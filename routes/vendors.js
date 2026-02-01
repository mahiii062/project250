// routes/vendors.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Helper: standardized schema-missing response
function handleSchemaMissing(res, e) {
  if (e && e.message && e.message.includes('Unknown column')) {
    console.error('Schema error (missing column):', e.message);
    return res.status(500).json({ ok: false, error: 'Database schema missing required column(s). Please run migrations or restart the server after ensuring schema updates.' });
  }
  return null;
}

/** helper: build dynamic UPDATE SETs safely */
function buildUpdateSet(obj) {
  const cols = [];
  const vals = [];
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "undefined") continue;
    cols.push(`${k} = ?`);
    vals.push(v);
  }
  return { setClause: cols.join(", "), values: vals };
}

/**
 * GET /api/vendors/me
 * Return the logged-in vendor's profile
 */
router.get("/me", async (req, res) => {
  try {
    const vendor_id = req.vendor_id;
    if (!vendor_id) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const [rows] = await db.query(
      `SELECT 
         vendor_id,
         Vendor_Name AS company_name,
         Vendor_Email AS email,
         phone,
         location,
         latitude,
         longitude,
         logo_url,
         vendor_type,
         rating,
         job_type,
         Vendor_description,
         whatsapp_link,
         service_radius_km,
         visiting_card_url,
         shop_address,
         service_locations,
         verification_status,
         verification_requested_at,
         verification_documents
       FROM Vendors
       WHERE vendor_id = ?
       LIMIT 1`,
      [vendor_id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    // Parse JSON fields
    const vendorData = rows[0];
    if (vendorData.service_locations) {
      try {
        vendorData.service_locations = JSON.parse(vendorData.service_locations);
      } catch (e) {
        vendorData.service_locations = [];
      }
    }

    return res.json({ ok: true, data: vendorData });
  } catch (e) {    const schemaResp = handleSchemaMissing(res, e);
    if (schemaResp) return schemaResp;    console.error("GET /me error:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * PATCH /api/vendors/me
 * Update vendor profile with new fields
 */
router.patch("/me", async (req, res) => {
  try {
    const vendor_id = req.vendor_id;
    if (!vendor_id) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const {
      company_name,
      phone,
      location,
      email,
      logo_url,
      job_type,
      Vendor_description,
      latitude,
      longitude,
      whatsapp_link,
      service_radius_km,
      visiting_card_url,
      shop_address,
      service_locations
    } = req.body || {};

    if (!company_name || !phone || !location || !email) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    const updateCols = {
      Vendor_Name: company_name,
      Vendor_Email: email,
      phone,
      location,
      logo_url: logo_url ?? null,
      job_type: job_type || null,
      Vendor_description: Vendor_description || null,
      latitude: latitude !== undefined ? parseFloat(latitude) : null,
      longitude: longitude !== undefined ? parseFloat(longitude) : null,
      whatsapp_link: whatsapp_link || null,
      service_radius_km: service_radius_km ? parseInt(service_radius_km) : 5,
      visiting_card_url: visiting_card_url || null,
      shop_address: shop_address || null,
      service_locations: service_locations ? JSON.stringify(service_locations) : null
    };

    const { setClause, values } = buildUpdateSet(updateCols);
    if (!setClause) {
      return res.status(400).json({ ok: false, error: "No fields to update" });
    }

    const [result] = await db.query(
      `UPDATE Vendors SET ${setClause} WHERE vendor_id = ?`,
      [...values, vendor_id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    // Return updated vendor data
    const [rows] = await db.query(
      `SELECT 
         vendor_id,
         Vendor_Name AS company_name,
         Vendor_Email AS email,
         phone,
         location,
         latitude,
         longitude,
         logo_url,
         vendor_type,
         rating,
         job_type,
         Vendor_description,
         whatsapp_link,
         service_radius_km,
         visiting_card_url,
         shop_address,
         service_locations,
         verification_status,
         verification_requested_at,
         verification_documents
       FROM Vendors
       WHERE vendor_id = ?
       LIMIT 1`,
      [vendor_id]
    );

    // Parse JSON fields
    const vendorData = rows[0];
    if (vendorData.service_locations) {
      try {
        vendorData.service_locations = JSON.parse(vendorData.service_locations);
      } catch (e) {
        vendorData.service_locations = [];
      }
    }

    return res.json({ ok: true, data: vendorData });
  } catch (e) {
    const schemaResp = handleSchemaMissing(res, e);
    if (schemaResp) return schemaResp;
    console.error("PATCH /me error:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * PATCH /api/vendors/me/type
 * Update vendor type
 */
router.patch("/me/type", async (req, res) => {
  try {
    const vendor_id = req.vendor_id;
    if (!vendor_id) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const { vendor_type } = req.body || {};
    if (!["seller", "service", "both"].includes(vendor_type || "")) {
      return res.status(400).json({ 
        ok: false, 
        error: "vendor_type must be 'seller' | 'service' | 'both'" 
      });
    }

    const [r] = await db.query(
      "UPDATE Vendors SET vendor_type = ? WHERE vendor_id = ?",
      [vendor_type, vendor_id]
    );

    if (!r.affectedRows) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    return res.json({ ok: true, data: { vendor_id, vendor_type } });
  } catch (e) {
    const schemaResp = handleSchemaMissing(res, e);
    if (schemaResp) return schemaResp;
    console.error("PATCH /me/type error:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * POST /api/vendors/me/verify
 * Submit documents / request vendor verification
 */
router.post('/me/verify', async (req, res) => {
  try {
    const vendor_id = req.vendor_id;
    if (!vendor_id) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    const { nid_no, live_photo_url, trade_license_id, training_certificate } = req.body || {};
    if (!nid_no && !live_photo_url && !trade_license_id && !training_certificate) {
      return res.status(400).json({ ok: false, error: 'Provide at least one verification item' });
    }

    const docs = {
      nid_no: nid_no || null,
      live_photo_url: live_photo_url || null,
      trade_license_id: trade_license_id || null,
      training_certificate: training_certificate || null
    };

    await db.query(
      "UPDATE Vendors SET verification_status = 'pending', verification_requested_at = NOW(), verification_documents = ? WHERE vendor_id = ?",
      [JSON.stringify(docs), vendor_id]
    );

    return res.json({ ok: true, message: 'your profile has been submitted for verification' });
  } catch (e) {
    const schemaResp = handleSchemaMissing(res, e);
    if (schemaResp) return schemaResp;
    console.error('/me/verify error', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * GET /api/vendors/me/type
 * Get vendor type
 */
router.get("/me/type", async (req, res) => {
  try {
    const vendor_id = req.vendor_id;
    if (!vendor_id) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const [rows] = await db.query(
      "SELECT vendor_type FROM Vendors WHERE vendor_id = ? LIMIT 1",
      [vendor_id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    return res.json({ ok: true, data: { vendor_type: rows[0].vendor_type } });
  } catch (e) {
    console.error("GET /me/type error:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * PATCH /api/vendors/me/location
 * Update only location (latitude, longitude)
 */
router.patch("/me/location", async (req, res) => {
  try {
    const vendor_id = req.vendor_id;
    if (!vendor_id) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const { latitude, longitude, location_name } = req.body || {};

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        ok: false, 
        error: "latitude and longitude are required" 
      });
    }

    if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      return res.status(400).json({ 
        ok: false, 
        error: "Invalid latitude or longitude" 
      });
    }

    console.log(`[VENDOR LOCATION] Updating vendor ${vendor_id} to ${latitude}, ${longitude}`);

    const [r] = await db.query(
      `UPDATE Vendors 
       SET latitude = ?, longitude = ?, location = ? 
       WHERE vendor_id = ?`,
      [parseFloat(latitude), parseFloat(longitude), location_name || "Updated location", vendor_id]
    );

    if (!r.affectedRows) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    const [rows] = await db.query(
      `SELECT 
         vendor_id,
         Vendor_Name AS company_name,
         Vendor_Email AS email,
         phone,
         location,
         latitude,
         longitude,
         logo_url,
         vendor_type,
         rating,
         job_type,
         Vendor_description,
         whatsapp_link,
         service_radius_km,
         visiting_card_url,
         shop_address,
         service_locations,
         verification_status,
         verification_requested_at,
         verification_documents
       FROM Vendors
       WHERE vendor_id = ?
       LIMIT 1`,
      [vendor_id]
    );

    // Parse JSON fields
    const vendorData = rows[0];
    if (vendorData.service_locations) {
      try {
        vendorData.service_locations = JSON.parse(vendorData.service_locations);
      } catch (e) {
        vendorData.service_locations = [];
      }
    }

    return res.json({ ok: true, data: vendorData });
  } catch (e) {
    const schemaResp = handleSchemaMissing(res, e);
    if (schemaResp) return schemaResp;
    console.error("PATCH /me/location error:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;