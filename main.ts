import {
  serve,
  Server,
  ServerRequest,
} from "https://deno.land/std@0.80.0/http/server.ts";
import { deferred } from "https://deno.land/std/async/mod.ts";

const socket = Deno.listen({ port: 4000 });
const server = serve({ port: 8000 });
const handler = handle(server);

const headers = new Headers({ "Access-Control-Allow-Origin": "*" });

class StoppableReader implements Deno.Reader {
  private controller = deferred<null>();

  constructor(private reader: Deno.Reader) {}

  async read(buf: Uint8Array): Promise<number | null> {
    return await Promise.race([
      this.reader.read(buf),
      this.controller,
    ]);
  }

  stop() {
    this.controller.resolve(null);
  }
}

while (true) {
  console.log("waiting http request");
  const downstream = await consumeRequest(handler);
  console.log("waiting connection");
  const conn = await socket.accept();
  console.log("piping");

  const reader = new StoppableReader(conn);
  setTimeout(() => reader.stop(), 1000);

  await Promise.allSettled([
    downstream.respond({ body: reader, headers }),
    consumeRequest(handler).then((upstream) => Deno.copy(upstream.body, conn)),
  ]);
  console.log("piped");
}

async function* handle(server: Server) {
  for await (const request of server) {
    if (request.method === "OPTIONS") {
      request.respond({
        headers: new Headers({ "Access-Control-Allow-Origin": "*" }),
      });
      continue;
    }

    yield request;
  }
}

async function consumeRequest(
  hander: AsyncGenerator<ServerRequest, void>,
) {
  const result = await hander.next();
  if (result.done) throw new Error("Server exited");
  return result.value;
}
