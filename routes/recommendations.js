/* ==================================================
 * FILE: routes/recommendations.js  (UPDATED: includes Vendor_description)
 * ================================================== */
import { Router as Router2 } from "express";
import db2 from "../config/db.js";
import { buildSellerTags } from "../utils/tags.js";

const r = Router2();

/**
 * GET /api/recommendations/vendors
 * Query:
 *   latitude, longitude               (required)
 *   product_category_id               (optional; defaults to 4)
 *   radiusKm=25, limit=12, minRating=0
 *
 * Notes:
 *   - Only vendors that HAVE products in the given numeric category id
 *   - Category-specific rating from product_ratings
 *   - Filters vendors missing coordinates
 *   - Sort: category rating desc, distance asc
 */
r.get("/vendors", async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      product_category_id,
      radiusKm = 25,
      limit = 12,
      minRating = 0,
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ ok: false, error: "latitude and longitude required" });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const radius = Number(radiusKm);
    const catId = Number(product_category_id ?? 4);

    if ([lat, lng, radius, catId].some(Number.isNaN)) {
      return res.status(400).json({ ok: false, error: "Invalid coordinates/radius/category" });
    }

    const HAV = ` (6371 * acos(
      cos(radians(?)) * cos(radians(v.latitude)) *
      cos(radians(v.longitude) - radians(?)) +
      sin(radians(?)) * sin(radians(v.latitude))
    )) `;

    const sql = `
      SELECT
        v.vendor_id,
        v.Vendor_Name,
        v.vendor_type,
        v.job_type,
        v.location,
        v.latitude,
        v.longitude,
        v.logo_url,
        v.Vendor_description,      -- ✅ Added here
        cat.avg_rating_cat,
        cat.rating_count_cat,
        ${HAV} AS distance_km
      FROM Vendors v
      /* Category-specific product rating per vendor */
      LEFT JOIN (
        SELECT
          p.vendor_id,
          ROUND(AVG(pr.rating), 1) AS avg_rating_cat,
          COUNT(pr.id)            AS rating_count_cat
        FROM Products p
        LEFT JOIN product_ratings pr ON pr.product_id = p.product_id
        WHERE p.product_category_id = ?
        GROUP BY p.vendor_id
      ) AS cat ON cat.vendor_id = v.vendor_id
      WHERE v.latitude IS NOT NULL
        AND v.longitude IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM Products p0
          WHERE p0.vendor_id = v.vendor_id
            AND p0.product_category_id = ?
        )
      HAVING
        distance_km <= ?
        AND (cat.avg_rating_cat IS NULL OR cat.avg_rating_cat >= ?)
      ORDER BY
        COALESCE(cat.avg_rating_cat, 0) DESC,
        distance_km ASC
      LIMIT ?`;

    const params = [
      lat, lng, lat,   // distance calc
      catId,           // category for subquery
      catId,           // category for exists
      radius,
      Number(minRating),
      Math.min(Number(limit), 50),
    ];

    const [rows] = await db2.query(sql, params);

    const items = rows.map((row) => ({
      ...row,
      tags: (() => {
        try {
          return buildSellerTags({
            avg_rating: Number(row.avg_rating_cat ?? 0),
            rating_count: Number(row.rating_count_cat ?? 0),
            distance_km: Number(row.distance_km ?? 0),
          });
        } catch {
          return [];
        }
      })(),
    }));

    res.json({ ok: true, items });
  } catch (e) {
    console.error("recs vendors error", e);
    res.status(500).json({ ok: false, error: "Failed to fetch vendor recommendations" });
  }
});

/**
 * GET /api/recommendations/products
 * Query:
 *   latitude, longitude               (required)
 *   product_category_id               (optional; defaults to 4)
 *   radiusKm=25 (applied via HAVING), limit=12
 *
 * Notes:
 *   - Uses numeric category id
 *   - Filters vendors/products missing coordinates
 *   - Adds an optional hard radius gate (HAVING)
 *   - Blended score: product rating + vendor rating - distance factor
 */
r.get("/products", async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      product_category_id,
      radiusKm = 25,
      limit = 12,
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ ok: false, error: "latitude and longitude required" });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const catId = Number(product_category_id ?? 4);
    const radius = Number(radiusKm);

    if ([lat, lng, catId, radius].some(Number.isNaN)) {
      return res.status(400).json({ ok: false, error: "Invalid coordinates or category/radius" });
    }

    const HAV = ` (6371 * acos(
      cos(radians(?)) * cos(radians(v.latitude)) *
      cos(radians(v.longitude) - radians(?)) +
      sin(radians(?)) * sin(radians(v.latitude))
    )) `;

    const sql = `
      SELECT
        p.product_id, p.vendor_id, p.title, p.description,
        p.product_category_id, p.price_bdt, p.stock, p.status, p.image_url,
        v.Vendor_Name, v.location, v.latitude, v.longitude,
        vs.avg_rating   AS vendor_avg_rating,
        vs.rating_count AS vendor_rating_count,
        ps.avg_rating   AS product_avg_rating,
        ps.rating_count AS product_rating_count,
        ${HAV} AS distance_km,
        (
          COALESCE(ps.avg_rating, 0) * 1.0 +
          COALESCE(vs.avg_rating, 0) * 0.6 -
          ( ${HAV} / 12 )
        ) AS score
      FROM Products p
      JOIN Vendors v ON v.vendor_id = p.vendor_id
      LEFT JOIN product_rating_stats ps ON ps.product_id = p.product_id
      LEFT JOIN vendor_rating_stats  vs ON vs.vendor_id  = v.vendor_id
      WHERE p.status = 'active'
        AND (p.stock IS NULL OR p.stock > 0)
        AND p.product_category_id = ?
        AND v.latitude IS NOT NULL
        AND v.longitude IS NOT NULL
      HAVING distance_km <= ?
      ORDER BY score DESC
      LIMIT ?`;

    const [rows] = await db2.query(sql, [
      lat, lng, lat,   // HAV distance_km
      lat, lng, lat,   // HAV in score computation
      catId,
      radius,
      Math.min(Number(limit), 50),
    ]);

    res.json({ ok: true, items: rows });
  } catch (e) {
    console.error("recs products error", e);
    res.status(500).json({ ok: false, error: "Failed to fetch product recommendations" });
  }
});

export default r;
