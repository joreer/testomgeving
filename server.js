import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Simpele in-memory database
let clients = [];
let quotes = [];
let quoteId = 1;

// File upload configuratie voor handtekeningen
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "public/signatures");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Root Route
app.get("/", (req, res) => {
  res.send("<h1>Welcome to the CRM API</h1><p>Use the /api/clients and /api/quotes endpoints.</p>");
});

// Routes
app.get("/api/clients", (req, res) => {
  res.json(clients);
});

app.post("/api/clients", (req, res) => {
  const newClient = { id: clients.length + 1, ...req.body };
  clients.push(newClient);
  res.json(newClient);
});

app.get("/api/quotes", (req, res) => {
  res.json(quotes);
});

app.post("/api/quotes", (req, res) => {
  const newQuote = { id: quoteId++, status: "draft", signature: "", ...req.body };
  quotes.push(newQuote);
  io.emit("quoteUpdated", quotes);
  res.json(newQuote);
});

app.patch("/api/quotes/:id", (req, res) => {
  const quote = quotes.find((q) => q.id == req.params.id);
  if (quote) {
    Object.assign(quote, req.body);
    io.emit("quoteUpdated", quotes);
    res.json(quote);
  } else {
    res.status(404).json({ error: "Quote not found" });
  }
});

app.delete("/api/quotes/:id", (req, res) => {
  quotes = quotes.filter((q) => q.id != req.params.id);
  io.emit("quoteUpdated", quotes);
  res.json({ message: "Quote deleted" });
});

app.post("/api/quotes/:id/upload-signature", upload.single("signature"), (req, res) => {
  const quote = quotes.find((q) => q.id == req.params.id);
  if (quote) {
    quote.signature = `/signatures/${req.file.filename}`;
    io.emit("quoteUpdated", quotes);
    res.json(quote);
  } else {
    res.status(404).json({ error: "Quote not found" });
  }
});

// Socket.io voor live updates
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.emit("quoteUpdated", quotes);
  socket.on("disconnect", () => console.log("A user disconnected"));
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
