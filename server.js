import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import db from './config/db.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a friendly AI assistant. Answer any question the user asks politely and clearly." },
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();
        res.json({ reply: data.choices[0].message.content });
    } catch (err) {
        console.error(err);
        res.status(500).json({ reply: "Sorry! Something went wrong. 😢" });
    }
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
