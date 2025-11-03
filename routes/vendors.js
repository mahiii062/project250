// routes/vendors.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

// GET /api/vendors/:vendorId/type  — read vendor type (UI gate)
router.get("/:vendorId/type", async (req, res) => {
  try {
    const id = Number(req.params.vendorId);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid vendorId" });

    const [rows] = await db.query(
      "SELECT vendor_id, vendor_type FROM Vendors WHERE vendor_id = ? LIMIT 1",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    res.json({ ok: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// PATCH /api/vendors/:vendorId/type  — update vendor type
router.patch("/:vendorId/type", async (req, res) => {
  try {
    const id = Number(req.params.vendorId);
    const { vendor_type } = req.body || {};

    if (!id) return res.status(400).json({ ok: false, error: "Invalid vendorId" });
    if (!vendor_type || !["seller", "service", "both"].includes(vendor_type)) {
      return res
        .status(400)
        .json({ ok: false, error: "vendor_type must be 'seller' | 'service' | 'both'" });
    }

    const [r] = await db.query(
      "UPDATE Vendors SET vendor_type = ? WHERE vendor_id = ?",
      [vendor_type, id]
    );

    if (r.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    res.json({ ok: true, data: { vendor_id: id, vendor_type } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
