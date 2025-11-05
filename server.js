import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";                // <-- For Socket.IO
import { Server } from "socket.io";     // <-- For Socket.IO

// --- Your existing imports ---
import db from './config/db.js';
import authRouter from './routes/customerAuth.js';
import vendorAuthRouter from "./routes/vendorAuth.js";
import lookupsRouter from "./routes/lookups.js";
import vendorsRouter from "./routes/vendors.js";
import productsRouter from "./routes/products.js";
import servicesRouter from "./routes/services.js";
import customersRouter from "./routes/customer.js";
import requireVendor from "./middleware/requireVendor.js";
import { requireCustomerJWT } from "./middleware/auth.js";

dotenv.config();

// --- Express app setup ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Your existing routes ---
app.use('/api/auth', authRouter);
app.use("/api/vendor", vendorAuthRouter);
app.get("/api/vendors-ping", (_req, res) => res.json({ ok: true, where: "server" }));
app.use("/api/customer", requireCustomerJWT, customersRouter);
app.use("/api/lookups", lookupsRouter);
app.use("/api/vendors", requireVendor, vendorsRouter);
app.use("/api/products", requireVendor, productsRouter);
app.use("/api/services", requireVendor, servicesRouter);

// --- Chatbot endpoint (unchanged) ---
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "No message provided." });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Nibash Assistant, a friendly expert on furniture, interior design, and home improvement." },
          { role: "user", content: message }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error response:", errText);
      return res.status(500).json({ reply: "OpenAI API returned an error." });
    }

    const data = await response.json();
    console.log("✅ OpenAI reply:", data.choices[0].message.content);
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("🚨 Server error:", error);
    res.status(500).json({ reply: "Sorry, something went wrong on the server." });
  }
});

// --- Create HTTP + Socket.IO server ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // or replace with your frontend domain
    methods: ["GET", "POST"]
  }
});

// --- Group chat state ---
let groups = {}; // Example: { groupId: { users: [], messages: [] } }

// --- Socket.IO logic ---
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Join or create a group
  socket.on("joinGroup", ({ groupId, username }) => {
    socket.join(groupId);
    if (!groups[groupId]) {
      groups[groupId] = { users: [], messages: [] };
    }
    groups[groupId].users.push({ id: socket.id, name: username });

    io.to(groupId).emit("groupUpdate", groups[groupId]);
    console.log(`👥 ${username} joined group ${groupId}`);
  });

  // Handle group messages
  socket.on("groupMessage", ({ groupId, username, text }) => {
    const message = { username, text, time: new Date() };
    if (groups[groupId]) groups[groupId].messages.push(message);
    io.to(groupId).emit("newMessage", message);
    console.log(`💬 [${groupId}] ${username}: ${text}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    for (let groupId in groups) {
      groups[groupId].users = groups[groupId].users.filter(u => u.id !== socket.id);
      io.to(groupId).emit("groupUpdate", groups[groupId]);
    }
  });
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
