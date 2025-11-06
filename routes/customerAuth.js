// routes/customerAuth.js (ESM)
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import { requireCustomerJWT } from "../middleware/auth.js";

const router = Router();

// quick probe to confirm mount: GET /api/customer/__health
router.get("/__health", (_req, res) => res.json({ ok: true, where: "customerAuth" }));

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// ===========================
// POST /api/customer/signup
// ===========================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email, and password are required" });
    }

    // check duplicate (use actual column name)
    const [exists] = await db.query(
      "SELECT customer_id FROM customers WHERE Customer_Email = ?",
      [email]
    );
    if (exists.length) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      `INSERT INTO customers (Customer_Name, Customer_Email, password_hash)
       VALUES (?, ?, ?)`,
      [name, email, password_hash]
    );

    const customer_id = result.insertId;
    const token = signToken({ customer_id, email });

    res.status(201).json({
      customer_id,
      customer_name: name,
      customer_email: email,
      token,
    });
  } catch (e) {
    console.error("Customer signup error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// ===========================
// POST /api/customer/signin
// ===========================
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "email and password are required" });
    }

    // align WHERE + alias returned columns to the JSON keys you send back
    const [rows] = await db.query(
      `SELECT
         customer_id,
         Customer_Name  AS customer_name,
         Customer_Email AS customer_email,
         password_hash
       FROM customers
       WHERE Customer_Email = ?`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

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
    console.error("Customer signin error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// // ===========================
// // GET /api/customer/me (protected)
// // ===========================
// router.get("/me", requireCustomerJWT, async (req, res) => {
//   try {
//     const id = req.customer_id || req.user?.customer_id;
//     if (!id) return res.status(401).json({ error: "Unauthorized" });

//     // alias to keep JSON consistent with signup/signin
//     const [rows] = await db.query(
//       `SELECT
//          customer_id,
//          Customer_Name  AS customer_name,
//          Customer_Email AS customer_email
//        FROM customers
//        WHERE customer_id = ?`,
//       [id]
//     );

//     if (!rows.length) return res.status(404).json({ error: "Not found" });

//     const u = rows[0];
//     res.json({
//       customer_id: u.customer_id,
//       customer_name: u.customer_name,
//       customer_email: u.customer_email,
//     });
//   } catch (e) {
//     console.error("Customer me error:", e);
//     res.status(500).json({ error: "Server error" });
//   }
// });

export default router;
