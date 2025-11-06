// routes/vendorAuth.js (ESM)
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const router = Router();

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/vendor/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }

    const [exists] = await db.query(
      "SELECT vendor_id FROM Vendors WHERE Vendor_Email = ?",
      [email]
    );
    if (exists.length) return res.status(409).json({ error: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      `INSERT INTO Vendors (Vendor_Name, Vendor_Email, Vendor_pass)
       VALUES (?, ?, ?)`,
      [name, email, password_hash]
    );

    const vendor_id = result.insertId;
    const token = signToken({ vendor_id, email });

    return res.status(201).json({
      vendor_id,
      vendor_name: name,
      vendor_email: email,
      token,
    });
  } catch (e) {
    console.error("Vendor signup error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/vendor/signin
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const [rows] = await db.query(
      "SELECT vendor_id, Vendor_Name, Vendor_Email, Vendor_pass FROM Vendors WHERE Vendor_Email = ?",
      [email]
    );
    if (!rows.length) return res.status(401).json({ error: "Invalid email or password" });

    const vendor = rows[0];
    const ok = await bcrypt.compare(password, vendor.Vendor_pass);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken({ vendor_id: vendor.vendor_id, email: vendor.Vendor_Email });

    return res.json({
      vendor_id: vendor.vendor_id,
      vendor_name: vendor.Vendor_Name,
      vendor_email: vendor.Vendor_Email,
      token,
    });
  } catch (e) {
    console.error("Vendor signin error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
