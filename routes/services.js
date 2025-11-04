import express from "express";
import db from "../config/db.js";
const router = express.Router();

async function getServiceCategoryIdBySlug(slug) {
  const [rows] = await db.query(
    "SELECT service_category_id AS id FROM ServiceCategories WHERE slug=? LIMIT 1",
    [slug]
  );
  if (!rows.length) throw new Error(`Unknown service category slug: ${slug}`);
  return rows[0].id;
}

// POST /api/services
router.post("/", async (req, res) => {
  try {
    const { title, description, service_category_slug, rate_bdt, billing, service_area, image_url } = req.body || {};
    if (!title || !description || !service_category_slug || rate_bdt == null) {
      return res.status(400).json({ ok: false, error: "title, description, service_category_slug, rate_bdt required" });
    }
    const catId = await getServiceCategoryIdBySlug(service_category_slug);
    const [r] = await db.query(
      `INSERT INTO Services (vendor_id, title, description, price, image_url, availability, service_category_id)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      [req.vendor_id, title, description, Number(rate_bdt), image_url || null, catId]
    );
    res.json({ ok: true, data: { service_id: r.insertId } });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

// GET /api/services?vendor_id=...
router.get("/", async (req, res) => {
  try {
    const vendorId = Number(req.query.vendor_id) || req.vendor_id; // default to logged-in vendor
    let sql = `SELECT s.*, sc.slug AS category_slug, sc.name AS category_name
               FROM Services s
               JOIN ServiceCategories sc ON sc.service_category_id = s.service_category_id
               WHERE s.vendor_id = ? AND s.availability = 1`;
    const params = [vendorId];
    if (req.query.category_slug) {
      sql += " AND sc.slug = ?";
      params.push(req.query.category_slug);
    }
    sql += " ORDER BY s.created_at DESC, s.service_id DESC";
    const [rows] = await db.query(sql, params);
    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
