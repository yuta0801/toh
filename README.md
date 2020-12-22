# toh

TCP Server over HTTP written in Deno

## Basic Usage

1. Start the server

   ```sh
   $ deno run --allow-net main.ts
   ```

2. Make a upstream chunked request to the HTTP server

   ```sh
   $ curl -sT. localhost:8000
   ```

3. Make a downstream chunked request to the HTTP server

   ```sh
   $ curl localhost:8000
   ```

4. Connect the TCP server

   ```sh
   $ nc localhost 4000
   ```

Now the connections are connected and can send data to each other.
