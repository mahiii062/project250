// routes/vendors.js
import express from "express";
import db from "../config/db.js";
const router = express.Router();

/** ... keep your existing /me/type endpoints ... */

// GET /api/vendors/me  -> profile for the logged-in vendor
router.get("/me", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         vendor_id,
         Vendor_Name      AS name,
         Vendor_Email     AS email,
         location,
         rating,
         vendor_type
       FROM Vendors
       WHERE vendor_id = ? LIMIT 1`,
      [req.vendor_id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }
    res.json({ ok: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// PATCH /api/vendors/me/type
router.patch("/me/type", async (req, res) => {
  const { vendor_type } = req.body || {};
  if (!["seller", "service", "both"].includes(vendor_type || "")) {
    return res.status(400).json({ ok: false, error: "vendor_type must be 'seller' | 'service' | 'both'" });
  }
  const [r] = await db.query("UPDATE Vendors SET vendor_type=? WHERE vendor_id=?", [vendor_type, req.vendor_id]);
  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Vendor not found" });
  res.json({ ok: true, data: { vendor_id: req.vendor_id, vendor_type } });
});

export default router;
