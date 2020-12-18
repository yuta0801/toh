import {
  serve,
  Server,
  ServerRequest,
} from "https://deno.land/std@0.80.0/http/server.ts";

const socket = Deno.listen({ port: 4000 });

const headers = new Headers({ "Access-Control-Allow-Origin": "*" });

console.log("waiting connection");
for await (const conn of socket) {
  console.log("waiting http request");
  const server = serve({ port: 8000 });

  const handler = handle(server);
  const upstream = await consumeRequest(handler);
  const downstream = await consumeRequest(handler);

  console.log("piping");
  await Promise.allSettled([
    downstream.respond({ body: conn, headers }),
    Deno.copy(upstream.body, conn),
  ]);

  console.log("piped");
  server.close();
  break;
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
