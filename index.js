import express from "express";
import multer from "multer";
import { Command } from "commander";
import path from "path";
import fs from "fs";

const program = new Command();

program
  .requiredOption("-h, --host <host>", "server host")
  .requiredOption("-p, --port <port>", "server port")
  .requiredOption("-c, --cache <path>", "cache directory");

program.parse(process.argv);
const options = program.opts();

const app = express();
const HOST = options.host;
const PORT = options.port;
const CACHE = options.cache;

if (!fs.existsSync(CACHE)) {
  fs.mkdirSync(CACHE, { recursive: true });
}

const INVENTORY_FILE = path.join(CACHE, "inventory.json");
if (!fs.existsSync(INVENTORY_FILE)) {
  fs.writeFileSync(INVENTORY_FILE, "[]");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/inventory", (req, res) => {
  const data = JSON.parse(fs.readFileSync(INVENTORY_FILE));
  res.status(200).json(data);
});

app.all("*", (req, res) => {
  res.status(405).send("Method not allowed");
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
