// routes/auth.js (ESM)
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js"; // uses your MySQL connection

const router = Router();

// Generate a JWT for authentication
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// ===========================
// POST /api/auth/signup
// ===========================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email, and password are required" });
    }

    // Check if email already exists
    const [exists] = await db.query(
      "SELECT customer_id FROM customers WHERE customer_email = ?",
      [email]
    );
    if (exists.length)
      return res.status(409).json({ error: "Email already registered" });

    // Hash the password
    const password_hash = await bcrypt.hash(password, 12);

    // ✅ Let MySQL handle customer_id (AUTO_INCREMENT)
    const [result] = await db.query(
      `INSERT INTO customers (customer_name, customer_email, password_hash)
       VALUES (?, ?, ?)`,
      [name, email, password_hash]
    );

    const customer_id = result.insertId; // auto-generated ID

    const token = signToken({ customer_id, email });

    res.status(201).json({
      customer_id,
      customer_name: name,
      customer_email: email,
      token,
    });
  } catch (e) {
    console.error("Signup error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// ===========================
// POST /api/auth/signin
// ===========================
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res
        .status(400)
        .json({ error: "email and password are required" });

    const [rows] = await db.query(
      "SELECT customer_id, customer_name, customer_email, password_hash FROM customers WHERE customer_email = ?",
      [email]
    );
    if (!rows.length)
      return res.status(401).json({ error: "Invalid email or password" });

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword)
      return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken({
      customer_id: user.customer_id,
      email: user.customer_email,
    });

    res.json({
      customer_id: user.customer_id,
      customer_name: user.customer_name,
      customer_email: user.customer_email,
      token,
    });
  } catch (e) {
    console.error("Signin error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
