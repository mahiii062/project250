// routes/products.js
import express from "express";
import db from "../config/db.js";

const productsRouter = express.Router();

// Resolve product category slug -> id
async function getProductCategoryIdBySlug(slug) {
  const [rows] = await db.query(
    "SELECT product_category_id AS id FROM ProductCategories WHERE slug = ? LIMIT 1",
    [slug]
  );
  if (!rows.length) throw new Error(`Unknown product category slug: ${slug}`);
  return rows[0].id;
}

/**
 * POST /api/products
 * Body: { vendor_id, title, description, category_slug, price_bdt, stock, image_url? }
 */
productsRouter.post("/", async (req, res) => {
  const conn = await db.getConnection();
  try {
    const {
      vendor_id,
      title,
      description,
      category_slug,
      price_bdt,
      stock,
      image_url,
    } = req.body || {};

    if (
      !vendor_id ||
      !title ||
      !description ||
      !category_slug ||
      price_bdt == null ||
      stock == null
    ) {
      return res.status(400).json({
        ok: false,
        error:
          "vendor_id, title, description, category_slug, price_bdt, stock are required",
      });
    }

    const catId = await getProductCategoryIdBySlug(category_slug);

    await conn.beginTransaction();
    const [r] = await conn.query(
      `INSERT INTO Products (vendor_id, title, description, product_category_id, price_bdt, stock, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        vendor_id,
        title,
        description,
        catId,
        Number(price_bdt),
        Number(stock),
        image_url || null,
      ]
    );
    await conn.commit();
    res.json({ ok: true, data: { product_id: r.insertId } });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ ok: false, error: e.message });
  } finally {
    conn.release();
  }
});

/**
 * GET /api/products?vendor_id=1[&category_slug=furniture]
 */
productsRouter.get("/", async (req, res) => {
  try {
    const vendorId = Number(req.query.vendor_id);
    const categorySlug = req.query.category_slug;
    if (!vendorId)
      return res.status(400).json({ ok: false, error: "vendor_id is required" });

    let sql = `
      SELECT p.*, pc.slug AS category_slug, pc.name AS category_name
      FROM Products p
      JOIN ProductCategories pc ON pc.product_category_id = p.product_category_id
      WHERE p.vendor_id = ? AND p.status <> 'deleted'
    `;
    const params = [vendorId];

    if (categorySlug) {
      sql += " AND pc.slug = ?";
      params.push(categorySlug);
    }

    // If created_at may be null in some rows, also order by product_id as a fallback
    sql += " ORDER BY p.created_at DESC, p.product_id DESC";

    const [rows] = await db.query(sql, params);
    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * POST /api/products/:id/images
 * Body: { url, is_primary?, sort_order? }
 */
productsRouter.post("/:id/images", async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { url, is_primary = false, sort_order = 0 } = req.body || {};
    if (!productId || !url) {
      return res
        .status(400)
        .json({ ok: false, error: "product id and url required" });
    }

    const [r] = await db.query(
      `INSERT INTO ProductImages (product_id, url, is_primary, sort_order)
       VALUES (?, ?, ?, ?)`,
      [productId, url, is_primary ? 1 : 0, Number(sort_order) || 0]
    );
    res.json({ ok: true, data: { product_image_id: r.insertId } });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

export default productsRouter;
