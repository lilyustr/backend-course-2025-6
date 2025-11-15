import { Command } from "commander";
import fs, { existsSync } from "fs";
import http from "http"

const program = new Command();
program.helpOption(false);

program
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port')
  .requiredOption('-c, --cache <path>', 'cache directory');

program.parse(process.argv);

const options = program.opts();

if(!existsSync(options.cache)){
    fs.mkdirSync(options.cache, {recursive: true});
}

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Server is running \n");
});

server.listen(options.port, options.host, () => {
    console.log(`Server is running at http://${options.host}:${options.port}/`)
});