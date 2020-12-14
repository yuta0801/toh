# toh

TCP Server over HTTP written in Deno

## Basic Usage

1. Start the server

   ```sh
   $ deno run --allow-net main.ts
   ```

2. Connect the TCP server

   ```sh
   $ nc localhost 4000
   ```

3. Make a chunked request to the HTTP server

   ```sh
   $ curl -sT. localhost:8000
   ```

Now both connections are connected and can send data to each other.
