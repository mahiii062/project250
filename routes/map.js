// routes/map.js — /api/map/nearby?lat=..&lon=..&radius_km=5
import { Router } from 'express';
import db from '../config/db.js';

const router = Router();

/**
 * Haversine distance in SQL (km)
 * Vendors(latitude, longitude) must be present.
 */
router.get('/nearby', async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const radius_km = Number(req.query.radius_km || 5);

    if (!isFinite(lat) || !isFinite(lon)) {
      return res.status(400).json({ ok: false, error: 'lat and lon are required numbers' });
    }

    const [rows] = await db.query(
      `
      SELECT
        v.vendor_id,
        v.Vendor_Name        AS name,
        v.Vendor_Email       AS email,
        v.phone,
        v.location,
        v.logo_url,
        v.latitude,
        v.longitude,
        v.vendor_type,
        v.rating,
        (6371 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(v.latitude)) *
          COS(RADIANS(v.longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(v.latitude))
        )) AS distance_km
      FROM Vendors v
      WHERE v.latitude IS NOT NULL AND v.longitude IS NOT NULL
      HAVING distance_km <= ?
      ORDER BY distance_km ASC
      LIMIT 100
      `,
      [lat, lon, lat, radius_km]
    );

    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
