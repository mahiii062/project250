import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from './config/db.js';
import authRouter from './routes/auth.js';
import vendorAuthRouter from "./routes/vendorAuth.js";
import lookupsRouter from "./routes/lookups.js";
import vendorsRouter from "./routes/vendors.js";
import productsRouter from "./routes/products.js";
import servicesRouter from "./routes/services.js";




dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use("/api/vendor", vendorAuthRouter);    

import requireVendor from "./middleware/requireVendor.js";

// public
app.use("/api/lookups", lookupsRouter);

// protected (requires Authorization: Bearer <token>)
app.use("/api/vendors", requireVendor, vendorsRouter);
app.use("/api/products", requireVendor, productsRouter);
app.use("/api/services", requireVendor, servicesRouter);


 

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
