import express from "express";
import db from "../config/db.js";
const router = express.Router();

async function getProductCategoryIdBySlug(slug) {
  const [rows] = await db.query(
    "SELECT product_category_id AS id FROM ProductCategories WHERE slug=? LIMIT 1",
    [slug]
  );
  if (!rows.length) throw new Error(`Unknown product category slug: ${slug}`);
  return rows[0].id;
}

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const { title, description, category_slug, price_bdt, stock, image_url } = req.body || {};
    if (!title || !description || !category_slug || price_bdt == null || stock == null) {
      return res.status(400).json({ ok: false, error: "title, description, category_slug, price_bdt, stock required" });
    }
    const catId = await getProductCategoryIdBySlug(category_slug);
    const [r] = await db.query(
      `INSERT INTO Products (vendor_id, title, description, product_category_id, price_bdt, stock, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [req.vendor_id, title, description, catId, Number(price_bdt), Number(stock), image_url || null]
    );
    res.json({ ok: true, data: { product_id: r.insertId } });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

// GET /api/products?vendor_id=...
router.get("/", async (req, res) => {
  try {
    const vendorId = Number(req.query.vendor_id) || req.vendor_id; // default to logged-in vendor
    let sql = `SELECT p.*, pc.slug AS category_slug, pc.name AS category_name
               FROM Products p
               JOIN ProductCategories pc ON pc.product_category_id = p.product_category_id
               WHERE p.vendor_id = ? AND p.status != 'deleted'`;
    const params = [vendorId];
    if (req.query.category_slug) {
      sql += " AND pc.slug = ?";
      params.push(req.query.category_slug);
    }
    sql += " ORDER BY p.created_at DESC, p.product_id DESC";
    const [rows] = await db.query(sql, params);
    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
