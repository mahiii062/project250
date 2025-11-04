// routes/customers.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

/**
 * If mounted with requireCustomerJWT in server.js, this helper can be removed.
 * It just ensures req.customer_id exists (set by JWT middleware).
 */
function requireAuth(req, res, next) {
  if (!req.customer_id) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  next();
}

/** helper: build dynamic UPDATE SETs safely */
function buildUpdateSet(obj) {
  const cols = [];
  const vals = [];
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "undefined") continue;
    cols.push(`${k} = ?`);
    vals.push(v);
  }
  return { setClause: cols.join(", "), values: vals };
}

/* =========================================================
 * GET /me
 * =======================================================*/
router.get("/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         customer_id,
         Customer_Name  AS name,
         Customer_Email AS email,
         phone,
         location,
         avatar_url
       FROM customers
       WHERE customer_id = ?
       LIMIT 1`,
      [req.customer_id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: "Customer not found" });
    }
    return res.json({ ok: true, data: rows[0] });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/* =========================================================
 * PATCH /me
 * Body expects: { name, phone, location, email, avatar_url }
 * =======================================================*/
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const { name, phone, location, email, avatar_url } = req.body || {};

    if (!name || !phone || !location || !email) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    // Use your actual column names (capitalized)
    const updateCols = {
      Customer_Name: name,
      Customer_Email: email,
      phone,
      location,
      avatar_url: avatar_url ?? null,
      updated_at: new Date()
    };

    const { setClause, values } = buildUpdateSet(updateCols);
    if (!setClause) {
      return res.status(400).json({ ok: false, error: "No fields to update" });
    }

    const [r] = await db.query(
      `UPDATE customers SET ${setClause} WHERE customer_id = ?`,
      [...values, req.customer_id]
    );

    if (!r.affectedRows) {
      return res.status(404).json({ ok: false, error: "Customer not found" });
    }

    const [rows] = await db.query(
      `SELECT
         customer_id,
         Customer_Name  AS name,
         Customer_Email AS email,
         phone,
         location,
         avatar_url
       FROM customers
       WHERE customer_id = ?
       LIMIT 1`,
      [req.customer_id]
    );

    return res.json({ ok: true, data: rows[0] });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/* =========================================================
 * GET /me/wishlist
 * =======================================================*/
router.get("/me/wishlist", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         w.wishlist_id AS id,
         p.title,
         p.price_bdt,
         p.image_url
       FROM Wishlist w
       JOIN Products p ON p.product_id = w.product_id
       WHERE w.customer_id = ?
       ORDER BY w.created_at DESC`,
      [req.customer_id]
    );

    return res.json({ ok: true, data: rows });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/* =========================================================
 * GET /me/orders
 * =======================================================*/
router.get("/me/orders", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         o.order_id,
         o.status,
         COALESCE(p.title, CONCAT('Order #', o.order_id)) AS title,
         p.image_url
       FROM Orders o
       LEFT JOIN (
         SELECT oi.order_id, oi.product_id
         FROM OrderItems oi
         INNER JOIN (
           SELECT order_id, MIN(order_item_id) AS first_item
           FROM OrderItems
           GROUP BY order_id
         ) x ON x.first_item = oi.order_item_id
       ) one ON one.order_id = o.order_id
       LEFT JOIN Products p ON p.product_id = one.product_id
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC`,
      [req.customer_id]
    );

    return res.json({ ok: true, data: rows });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/* ---------- Optional admin-style endpoints (by id) ---------- */
// GET /:customerId
router.get("/:customerId", async (req, res) => {
  try {
    const id = Number(req.params.customerId);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid id" });

    const [rows] = await db.query(
      `SELECT
         customer_id,
         Customer_Name  AS name,
         Customer_Email AS email,
         phone,
         location,
         avatar_url
       FROM customers
       WHERE customer_id = ?
       LIMIT 1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: "Customer not found" });
    return res.json({ ok: true, data: rows[0] });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// PATCH /:customerId
router.patch("/:customerId", async (req, res) => {
  try {
    const id = Number(req.params.customerId);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid id" });

    const { name, phone, location, email, avatar_url } = req.body || {};
    if (!name || !phone || !location || !email) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    const updateCols = {
      Customer_Name: name,
      Customer_Email: email,
      phone,
      location,
      avatar_url: avatar_url ?? null,
      updated_at: new Date()
    };
    const { setClause, values } = buildUpdateSet(updateCols);

    const [r] = await db.query(
      `UPDATE customers SET ${setClause} WHERE customer_id = ?`,
      [...values, id]
    );
    if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Customer not found" });

    const [rows] = await db.query(
      `SELECT
         customer_id,
         Customer_Name  AS name,
         Customer_Email AS email,
         phone,
         location,
         avatar_url
       FROM customers
       WHERE customer_id = ?
       LIMIT 1`,
      [id]
    );
    return res.json({ ok: true, data: rows[0] });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
