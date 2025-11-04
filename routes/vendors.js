// routes/vendors.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

/**
 * Require auth middleware: must set req.vendor_id for the logged-in vendor.
 * Replace this with your real auth middleware.
 */
function requireAuth(req, res, next) {
  if (!req.vendor_id) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  next();
}

/**
 * GET /api/vendors/me
 * Return the logged-in vendor's profile in the shape the frontend expects.
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         vendor_id,
         Vendor_Name  AS company_name,
         Vendor_Email AS email,
         phone,
         location,
         logo_url,
         vendor_type,
         rating
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
 * Update the logged-in vendor's profile.
 * Frontend sends { company_name, phone, location, email, logo_url }
 */
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const { company_name, phone, location, email, logo_url } = req.body || {};

    // Validate minimal fields (tweak as needed)
    if (!company_name || !phone || !location || !email) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    // Map frontend fields -> DB column names
    const updateCols = {
      Vendor_Name: company_name,
      Vendor_Email: email,
      phone,
      location,
      logo_url: logo_url || null,
    };

    // Build dynamic SET clause safely
    const sets = Object.keys(updateCols)
      .map((col) => `${col} = ?`)
      .join(", ");
    const params = [...Object.values(updateCols), req.vendor_id];

    const [result] = await db.query(
      `UPDATE Vendors SET ${sets} WHERE vendor_id = ?`,
      params
    );

    if (!result.affectedRows) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    // Return the updated row
    const [rows] = await db.query(
      `SELECT 
         vendor_id,
         Vendor_Name  AS company_name,
         Vendor_Email AS email,
         phone,
         location,
         logo_url,
         vendor_type,
         rating
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

/**
 * GET /api/vendors/me/type
 * Read the logged-in vendor type.
 */
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

/**
 * PATCH /api/vendors/me/type
 * Update the logged-in vendor type.
 */
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

/* ---------- OPTIONAL: id-based admin routes (keep if you need them) ---------- */

// GET /api/vendors/:vendorId/type
router.get("/:vendorId/type", async (req, res) => {
  try {
    const id = Number(req.params.vendorId);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid vendorId" });

    const [rows] = await db.query(
      "SELECT vendor_type FROM Vendors WHERE vendor_id = ? LIMIT 1",
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }
    return res.json({ ok: true, data: { vendor_type: rows[0].vendor_type } });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// PATCH /api/vendors/:vendorId/type
router.patch("/:vendorId/type", async (req, res) => {
  try {
    const id = Number(req.params.vendorId);
    const { vendor_type } = req.body || {};

    if (!id) return res.status(400).json({ ok: false, error: "Invalid vendorId" });
    if (!["seller", "service", "both"].includes(vendor_type || "")) {
      return res
        .status(400)
        .json({ ok: false, error: "vendor_type must be 'seller' | 'service' | 'both'" });
    }

    const [r] = await db.query(
      "UPDATE Vendors SET vendor_type = ? WHERE vendor_id = ?",
      [vendor_type, id]
    );

    if (!r.affectedRows) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    return res.json({ ok: true, data: { vendor_id: id, vendor_type } });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
