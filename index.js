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

const upload = multer({ 
    dest: CACHE 
});

app.post("/register", upload.single("photo"), (req, res) => {
  const name = req.body.inventory_name;
  const desc = req.body.description || "";

  if (!name) {
    return res.status(400).send("name is required");
  }

  const data = JSON.parse(fs.readFileSync(INVENTORY_FILE));
  const id = data.length + 1;

  const item = {
    id: id,
    inventory_name: name,
    description: desc,
    photo: req.file ? req.file.filename : null,
  };

  data.push(item);
  fs.writeFileSync(INVENTORY_FILE, JSON.stringify(data));
  res.status(201).json(item);
});


app.get("/inventory", (req, res) => {
  const data = JSON.parse(fs.readFileSync(INVENTORY_FILE));
  res.status(200).json(data);
});

app.get("/inventory/:id", (req, res) => {
  const data = JSON.parse(fs.readFileSync(INVENTORY_FILE));
  const item = data.find((i) => i.id == req.params.id);

  if (!item) return res.status(404).send("Not found");
  res.status(200).json(item);
});

app.put("/inventory/:id", (req, res) => {
  const data = JSON.parse(fs.readFileSync(INVENTORY_FILE));
  const item = data.find((i) => i.id == req.params.id);

  if (!item) return res.status(404).send("Not found");

  if (req.body.inventory_name) item.inventory_name = req.body.inventory_name;
  if (req.body.description) item.description = req.body.description;

  fs.writeFileSync(INVENTORY_FILE, JSON.stringify(data));
  res.status(200).json(item);
});


app.all("*", (req, res) => {
  res.status(405).send("Method not allowed");
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
