// ===============================================
// Nibash Backend (Express + MySQL)
// -----------------------------------------------
// This canvas contains multiple files. Copy them into your project
// preserving the folder structure shown in each header.
// ===============================================

/* ==================================================
 * FILE: server.js  (UPDATED)
 * ==================================================
 */

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./config/db.js";
import authRouter from "./routes/customerAuth.js";
import vendorAuthRouter from "./routes/vendorAuth.js";
import lookupsRouter from "./routes/lookups.js";
import vendorsRouter from "./routes/vendors.js";
import productsRouter from "./routes/products.js";
import servicesRouter from "./routes/services.js";
import { requireCustomerJWT } from "./middleware/auth.js";
import requireVendor from "./middleware/requireVendor.js";
import customersRouter from "./routes/customer.js";


// === NEW: recommendation + rating routers ===
// --------------------------------------------
// UPDATED: added feature routers for ratings and recommendations
import ratingsRouter from "./routes/ratings.js";              // UPDATED
import recommendationsRouter from "./routes/recommendations.js"; // UPDATED

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ============ AUTH ROUTES ============
app.use('/api/auth', authRouter);
app.use('/api/vendor', vendorAuthRouter);

// ============ TEST ENDPOINTS ============
app.get('/api/vendors-ping', (_req, res) => res.json({ ok: true, where: 'server' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, message: 'Server is working', timestamp: new Date().toISOString() }));

// ============ PROTECTED ROUTES ============
app.use('/api/customer', requireCustomerJWT, customersRouter);
app.use('/api/vendors', requireVendor, vendorsRouter);
app.use('/api/products', requireVendor, productsRouter);
app.use('/api/services', requireVendor, servicesRouter);

// ============ PUBLIC ROUTES ============

app.use('/api/lookups', lookupsRouter);
app.use('/api/recommendations', recommendationsRouter);  
// === NEW: Ratings (customer-auth required) ===
// Customers can rate vendors/products. Kept separate from vendor-only routers.
// Requires a valid customer JWT so users must be logged in to rate.
app.use('/api/ratings', requireCustomerJWT, ratingsRouter); // UPDATED

// === NEW: Recommendations (public) ===
// Nearby + blended (rating + distance) recommendations for vendors/products
app.use('/api/recommendations', recommendationsRouter);      // UPDATED

// ============ LOCATION-BASED RECOMMENDATIONS (LEGACY) ============
// Kept your original nearby endpoints for backward compatibility.
// Note: newer, richer endpoints live under /api/recommendations/*

/**
 * GET /api/nearby/vendors
 * Query params: latitude, longitude, radiusKm, category (optional), limit
 */
app.get('/api/nearby/vendors', async (req, res) => {
  try {
    const { latitude, longitude, radiusKm = 5, category, limit = 10 } = req.query;
    if (!latitude || !longitude) return res.status(400).json({ ok: false, error: 'latitude and longitude required' });
    const lat = parseFloat(latitude), lng = parseFloat(longitude), radius = parseFloat(radiusKm);
    if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radius)) return res.status(400).json({ ok: false, error: 'Invalid coordinates or radius' });

    let query = `
      SELECT 
        v.vendor_id,
        v.Vendor_Name AS company_name,
        v.Vendor_Email AS email,
        v.phone,
        v.location,
        v.latitude,
        v.longitude,
        v.logo_url,
        v.job_type,
        v.vendor_type,
        v.rating,
        v.Vendor_description,
        (6371 * acos(cos(radians(?)) * cos(radians(v.latitude)) * cos(radians(v.longitude) - radians(?)) + sin(radians(?)) * sin(radians(v.latitude)))) AS distance_km
      FROM Vendors v
      WHERE v.latitude IS NOT NULL 
        AND v.longitude IS NOT NULL
        AND (6371 * acos(cos(radians(?)) * cos(radians(v.latitude)) * cos(radians(v.longitude) - radians(?)) + sin(radians(?)) * sin(radians(v.latitude)))) <= ?`;

    const params = [lat, lng, lat, lat, lng, lat, radius];
    if (category) { query += ` AND v.job_type = ?`; params.push(category); }
    query += ` ORDER BY distance_km ASC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [vendors] = await db.query(query, params);
    res.json({ ok: true, data: vendors });
  } catch (e) {
    console.error('Nearby vendors error:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * GET /api/nearby/products
 */
app.get('/api/nearby/products', async (req, res) => {
  try {
    const { latitude, longitude, radiusKm = 5, category, limit = 10 } = req.query;
    if (!latitude || !longitude) return res.status(400).json({ ok: false, error: 'latitude and longitude required' });
    const lat = parseFloat(latitude), lng = parseFloat(longitude), radius = parseFloat(radiusKm);
    if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radius)) return res.status(400).json({ ok: false, error: 'Invalid coordinates or radius' });

    let query = `
      SELECT 
        p.product_id,
        p.title,
        p.description,
        p.price_bdt,
        p.category_slug,
        p.image_url,
        p.vendor_id,
        v.Vendor_Name AS vendor_name,
        v.location AS vendor_location,
        v.phone AS vendor_phone,
        v.latitude,
        v.longitude,
        v.rating,
        (6371 * acos(cos(radians(?)) * cos(radians(v.latitude)) * cos(radians(v.longitude) - radians(?)) + sin(radians(?)) * sin(radians(v.latitude)))) AS distance_km
      FROM Products p
      JOIN Vendors v ON p.vendor_id = v.vendor_id
      WHERE v.latitude IS NOT NULL 
        AND v.longitude IS NOT NULL
        AND (6371 * acos(cos(radians(?)) * cos(radians(v.latitude)) * cos(radians(v.longitude) - radians(?)) + sin(radians(?)) * sin(radians(v.latitude)))) <= ?`;

    const params = [lat, lng, lat, lat, lng, lat, radius];
    if (category) { query += ` AND p.category_slug = ?`; params.push(category); }
    query += ` ORDER BY distance_km ASC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [products] = await db.query(query, params);
    res.json({ ok: true, data: products });
  } catch (e) {
    console.error('Nearby products error:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * GET /api/nearby/services
 */
app.get('/api/nearby/services', async (req, res) => {
  try {
    const { latitude, longitude, radiusKm = 5, category, limit = 10 } = req.query;
    if (!latitude || !longitude) return res.status(400).json({ ok: false, error: 'latitude and longitude required' });
    const lat = parseFloat(latitude), lng = parseFloat(longitude), radius = parseFloat(radiusKm);
    if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radius)) return res.status(400).json({ ok: false, error: 'Invalid coordinates or radius' });

    let query = `
      SELECT 
        s.service_id,
        s.title,
        s.description,
        s.rate_bdt,
        s.service_category_slug,
        s.image_url,
        s.vendor_id,
        v.Vendor_Name AS vendor_name,
        v.location AS vendor_location,
        v.phone AS vendor_phone,
        v.latitude,
        v.longitude,
        v.rating,
        v.job_type,
        (6371 * acos(cos(radians(?)) * cos(radians(v.latitude)) * cos(radians(v.longitude) - radians(?)) + sin(radians(?)) * sin(radians(v.latitude)))) AS distance_km
      FROM Services s
      JOIN Vendors v ON s.vendor_id = v.vendor_id
      WHERE v.latitude IS NOT NULL 
        AND v.longitude IS NOT NULL
        AND (6371 * acos(cos(radians(?)) * cos(radians(v.latitude)) * cos(radians(v.longitude) - radians(?)) + sin(radians(?)) * sin(radians(v.latitude)))) <= ?`;

    const params = [lat, lng, lat, lat, lng, lat, radius];
    if (category) { query += ` AND s.service_category_slug = ?`; params.push(category); }
    query += ` ORDER BY distance_km ASC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [services] = await db.query(query, params);
    res.json({ ok: true, data: services });
  } catch (e) {
    console.error('Nearby services error:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ============ CHATBOT ENDPOINT ============
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: 'No message provided.' });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are Nibash Assistant, a friendly expert on furniture, interior design, and home improvement.' },
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI error response:', errText);
      return res.status(500).json({ reply: 'OpenAI API returned an error.' });
    }

    const data = await response.json();
    res.json({ reply: data.choices?.[0]?.message?.content ?? 'No reply' });
  } catch (error) {
    console.error('🚨 Server error:', error);
    res.status(500).json({ reply: 'Sorry, something went wrong on the server.' });
  }
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('✅ API endpoints ready');
});

