import {
  serve,
  Server,
  ServerRequest,
} from "https://deno.land/std@0.80.0/http/server.ts";

const socket = Deno.listen({ port: 4000 });
const server = serve({ port: 8000 });
const handler = handle(server);

const headers = new Headers({ "Access-Control-Allow-Origin": "*" });

while (true) {
  console.log("waiting http request");
  const upstream = await consumeRequest(handler);
  const downstream = await consumeRequest(handler);

  console.log("waiting connection");
  const conn = await socket.accept();

  console.log("piping");
  await Promise.allSettled([
    downstream.respond({ body: conn, headers }),
    Deno.copy(upstream.body, conn),
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
