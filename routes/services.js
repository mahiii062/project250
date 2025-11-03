// routes/services.js
import express from "express";
import db from "../config/db.js";

const servicesRouter = express.Router();

// Resolve service category slug -> id
async function getServiceCategoryIdBySlug(slug) {
  const [rows] = await db.query(
    "SELECT service_category_id AS id FROM ServiceCategories WHERE slug = ? LIMIT 1",
    [slug]
  );
  if (!rows.length) throw new Error(`Unknown service category slug: ${slug}`);
  return rows[0].id;
}

/**
 * POST /api/services
 * Body: { vendor_id, title, description, service_category_slug, rate_bdt, billing?, service_area?, image_url? }
 */
servicesRouter.post("/", async (req, res) => {
  const conn = await db.getConnection();
  try {
    const {
      vendor_id,
      title,
      description,
      service_category_slug,
      rate_bdt,
      billing,       // optional (persist only if you added columns)
      service_area,  // optional (persist only if you added columns)
      image_url,
    } = req.body || {};

    if (!vendor_id || !title || !description || !service_category_slug || rate_bdt == null) {
      return res.status(400).json({
        ok: false,
        error: "vendor_id, title, description, service_category_slug, rate_bdt are required",
      });
    }

    const catId = await getServiceCategoryIdBySlug(service_category_slug);

    await conn.beginTransaction();

    const [r] = await conn.query(
      `INSERT INTO Services (vendor_id, title, description, price, image_url, availability, service_category_id)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      [vendor_id, title, description, Number(rate_bdt), image_url || null, catId]
    );

    // If you added columns for billing & service_area in Services, also persist them:
    // await conn.query(
    //   "UPDATE Services SET billing=?, service_area=? WHERE service_id=?",
    //   [billing || 'fixed', service_area || 'Dhaka, BD', r.insertId]
    // );

    await conn.commit();
    res.json({ ok: true, data: { service_id: r.insertId } });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ ok: false, error: e.message });
  } finally {
    conn.release();
  }
});

/**
 * GET /api/services?vendor_id=1[&category_slug=plumber]
 */
servicesRouter.get("/", async (req, res) => {
  try {
    const vendorId = Number(req.query.vendor_id);
    const categorySlug = req.query.category_slug;
    if (!vendorId) {
      return res.status(400).json({ ok: false, error: "vendor_id is required" });
    }

    let sql = `
      SELECT s.*, sc.slug AS category_slug, sc.name AS category_name
      FROM Services s
      JOIN ServiceCategories sc ON sc.service_category_id = s.service_category_id
      WHERE s.vendor_id = ? AND s.availability = 1
    `;
    const params = [vendorId];

    if (categorySlug) {
      sql += " AND sc.slug = ?";
      params.push(categorySlug);
    }

    // If you have a created_at column, prefer ordering by it. Otherwise service_id is fine.
    sql += " ORDER BY s.created_at DESC, s.service_id DESC";

    const [rows] = await db.query(sql, params);
    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default servicesRouter;
