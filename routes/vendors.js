// routes/vendors.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

/** Require auth middleware */
function requireAuth(req, res, next) {
  if (!req.vendor_id) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  next();
}

/** helper: build dynamic UPDATE SETs safely */
function buildUpdateSet(obj) {
  const cols = [];
  const vals = [];
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "undefined") continue;        // skip missing keys
    cols.push(`${k} = ?`);
    vals.push(v);
  }
  return { setClause: cols.join(", "), values: vals };
}

/**
 * GET /api/vendors/me
 * Return the logged-in vendor's profile
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         vendor_id,
         Vendor_Name           AS company_name,
         Vendor_Email          AS email,
         phone,
         location,
         logo_url,
         vendor_type,
         rating,
         job_type,                 -- NEW
         Vendor_description        -- NEW (keep exact casing)
       FROM Vendors
       WHERE vendor_id = ?
       LIMIT 1`,
      [req.vendor_id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    return res.json({ ok: true, data: rows[0] });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * PATCH /api/vendors/me
 * Update vendor profile
 * Accepts: { company_name, phone, location, email, logo_url, job_type, Vendor_description }
 */
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const {
      company_name,
      phone,
      location,
      email,
      logo_url,
      job_type,             // NEW
      Vendor_description,   // NEW (exact casing)
    } = req.body || {};

    // Minimal validation (adjust to taste)
    if (!company_name || !phone || !location || !email) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    // Map to DB columns; include only provided keys
    const updateCols = {
      Vendor_Name: company_name,
      Vendor_Email: email,
      phone,
      location,
      logo_url: logo_url ?? null,
      job_type,                  // optional but saved if provided
      Vendor_description,        // optional but saved if provided
    };

    const { setClause, values } = buildUpdateSet(updateCols);
    if (!setClause) {
      return res.status(400).json({ ok: false, error: "No fields to update" });
    }

    const [result] = await db.query(
      `UPDATE Vendors SET ${setClause} WHERE vendor_id = ?`,
      [...values, req.vendor_id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    // Return the updated row
    const [rows] = await db.query(
      `SELECT 
         vendor_id,
         Vendor_Name           AS company_name,
         Vendor_Email          AS email,
         phone,
         location,
         logo_url,
         vendor_type,
         rating,
         job_type,
         Vendor_description
       FROM Vendors
       WHERE vendor_id = ?
       LIMIT 1`,
      [req.vendor_id]
    );

    return res.json({ ok: true, data: rows[0] });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/** GET /api/vendors/me/type (unchanged) */
router.get("/me/type", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT vendor_type FROM Vendors WHERE vendor_id = ? LIMIT 1",
      [req.vendor_id]
    );
    if (!rows.length) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }
    return res.json({ ok: true, data: { vendor_type: rows[0].vendor_type } });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/** PATCH /api/vendors/me/type (unchanged) */
router.patch("/me/type", requireAuth, async (req, res) => {
  try {
    const { vendor_type } = req.body || {};
    if (!["seller", "service", "both"].includes(vendor_type || "")) {
      return res
        .status(400)
        .json({ ok: false, error: "vendor_type must be 'seller' | 'service' | 'both'" });
    }

    const [r] = await db.query(
      "UPDATE Vendors SET vendor_type = ? WHERE vendor_id = ?",
      [vendor_type, req.vendor_id]
    );

    if (!r.affectedRows) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    return res.json({ ok: true, data: { vendor_id: req.vendor_id, vendor_type } });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/* Optional id-based admin routes (unchanged) ... */

export default router;
