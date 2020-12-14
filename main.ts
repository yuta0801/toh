import { serve } from "https://deno.land/std@0.80.0/http/server.ts";

const socket = Deno.listen({ port: 4000 });

console.log("waiting connection");
for await (const conn of socket) {
  console.log("waiting http request");
  const server = serve({ port: 8000 });
  for await (const request of server) {
    console.log("piping");
    await Promise.allSettled([
      Deno.copy(request.body, conn),
      request.respond({ body: conn }),
    ]);

    console.log("piped");
    server.close();
    break;
  }
}
