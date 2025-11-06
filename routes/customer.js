// routes/customer.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

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

/**
 * GET /api/customer/me
 * Get logged-in customer profile
 */
router.get("/me", async (req, res) => {
  try {
    const customer_id = req.customer_id;
    if (!customer_id) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const [rows] = await db.query(
      `SELECT
         customer_id,
         Customer_Name AS name,
         Customer_Email AS email,
         phone,
         location,
         latitude,
         longitude,
         avatar_url
       FROM customers
       WHERE customer_id = ?
       LIMIT 1`,
      [customer_id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: "Customer not found" });
    }

    return res.json({ ok: true, data: rows[0] });
  } catch (e) {
    console.error("GET /me error:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * PATCH /api/customer/me
 * Update customer profile
 */
router.patch("/me", async (req, res) => {
  try {
    const customer_id = req.customer_id;
    if (!customer_id) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const { name, phone, location, email, avatar_url, latitude, longitude } = req.body || {};

    if (!name || !phone || !location || !email) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    if (latitude !== undefined && longitude !== undefined) {
      if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
        return res.status(400).json({ ok: false, error: "Invalid latitude or longitude" });
      }
    }

    const updateCols = {
      Customer_Name: name,
      Customer_Email: email,
      phone,
      location,
      latitude: latitude !== undefined ? parseFloat(latitude) : null,
      longitude: longitude !== undefined ? parseFloat(longitude) : null,
      avatar_url: avatar_url ?? null,
      updated_at: new Date()
    };

    const { setClause, values } = buildUpdateSet(updateCols);
    if (!setClause) {
      return res.status(400).json({ ok: false, error: "No fields to update" });
    }

    const [r] = await db.query(
      `UPDATE customers SET ${setClause} WHERE customer_id = ?`,
      [...values, customer_id]
    );

    if (!r.affectedRows) {
      return res.status(404).json({ ok: false, error: "Customer not found" });
    }

    const [rows] = await db.query(
      `SELECT
         customer_id,
         Customer_Name AS name,
         Customer_Email AS email,
         phone,
         location,
         latitude,
         longitude,
         avatar_url
       FROM customers
       WHERE customer_id = ?
       LIMIT 1`,
      [customer_id]
    );

    return res.json({ ok: true, data: rows[0] });
  } catch (e) {
    console.error("PATCH /me error:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * PATCH /api/customer/me/location
 * Update only location (latitude, longitude)
 */
router.patch("/me/location", async (req, res) => {
  try {
    const customer_id = req.customer_id;
    if (!customer_id) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const { latitude, longitude, location_name } = req.body || {};

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        ok: false, 
        error: "latitude and longitude are required" 
      });
    }

    if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      return res.status(400).json({ 
        ok: false, 
        error: "Invalid latitude or longitude" 
      });
    }

    console.log(`[CUSTOMER LOCATION] Updating customer ${customer_id} to ${latitude}, ${longitude}`);

    const [r] = await db.query(
      `UPDATE customers 
       SET latitude = ?, longitude = ?, location = ?, updated_at = NOW() 
       WHERE customer_id = ?`,
      [parseFloat(latitude), parseFloat(longitude), location_name || "Updated location", customer_id]
    );

    if (!r.affectedRows) {
      return res.status(404).json({ ok: false, error: "Customer not found" });
    }

    const [rows] = await db.query(
      `SELECT
         customer_id,
         Customer_Name AS name,
         Customer_Email AS email,
         phone,
         location,
         latitude,
         longitude,
         avatar_url
       FROM customers
       WHERE customer_id = ?
       LIMIT 1`,
      [customer_id]
    );

    return res.json({ ok: true, data: rows[0] });
  } catch (e) {
    console.error("PATCH /me/location error:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * GET /api/customer/me/wishlist
 */
router.get("/me/wishlist", async (req, res) => {
  try {
    const customer_id = req.customer_id;
    if (!customer_id) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

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
      [customer_id]
    );

    return res.json({ ok: true, data: rows });
  } catch (e) {
    console.error("GET /me/wishlist error:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * GET /api/customer/me/orders
 */
router.get("/me/orders", async (req, res) => {
  try {
    const customer_id = req.customer_id;
    if (!customer_id) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

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
      [customer_id]
    );

    return res.json({ ok: true, data: rows });
  } catch (e) {
    console.error("GET /me/orders error:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * Optional: GET /:customerId (admin-style endpoint)
 */
router.get("/:customerId", async (req, res) => {
  try {
    const id = Number(req.params.customerId);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid id" });

    const [rows] = await db.query(
      `SELECT
         customer_id,
         Customer_Name AS name,
         Customer_Email AS email,
         phone,
         location,
         latitude,
         longitude,
         avatar_url
       FROM customers
       WHERE customer_id = ?
       LIMIT 1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: "Customer not found" });
    }

    return res.json({ ok: true, data: rows[0] });
  } catch (e) {
    console.error("GET /:customerId error:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * Optional: PATCH /:customerId (admin-style endpoint)
 */
router.patch("/:customerId", async (req, res) => {
  try {
    const id = Number(req.params.customerId);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid id" });

    const { name, phone, location, email, avatar_url, latitude, longitude } = req.body || {};

    if (!name || !phone || !location || !email) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    const updateCols = {
      Customer_Name: name,
      Customer_Email: email,
      phone,
      location,
      latitude: latitude !== undefined ? parseFloat(latitude) : null,
      longitude: longitude !== undefined ? parseFloat(longitude) : null,
      avatar_url: avatar_url ?? null,
      updated_at: new Date()
    };

    const { setClause, values } = buildUpdateSet(updateCols);

    const [r] = await db.query(
      `UPDATE customers SET ${setClause} WHERE customer_id = ?`,
      [...values, id]
    );

    if (!r.affectedRows) {
      return res.status(404).json({ ok: false, error: "Customer not found" });
    }

    const [rows] = await db.query(
      `SELECT
         customer_id,
         Customer_Name AS name,
         Customer_Email AS email,
         phone,
         location,
         latitude,
         longitude,
         avatar_url
       FROM customers
       WHERE customer_id = ?
       LIMIT 1`,
      [id]
    );

    return res.json({ ok: true, data: rows[0] });
  } catch (e) {
    console.error("PATCH /:customerId error:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;