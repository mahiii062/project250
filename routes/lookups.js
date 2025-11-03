// routes/lookups.js
import express from "express";
import db from "../config/db.js";

const lookupsRouter = express.Router();

/**
 * GET /api/lookups/product-categories
 * Returns all active product categories
 */
lookupsRouter.get("/product-categories", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT product_category_id, slug, name FROM ProductCategories WHERE active=1 ORDER BY name"
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * GET /api/lookups/service-categories
 * Returns all active service categories
 */
lookupsRouter.get("/service-categories", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT service_category_id, slug, name FROM ServiceCategories WHERE active=1 ORDER BY name"
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default lookupsRouter;
