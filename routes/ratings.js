

/* ==================================================
* FILE: routes/ratings.js (NEW)
* ==================================================
*/


import { Router } from 'express';
import db from '../config/db.js';
const router = Router();


// Upsert a vendor rating (1–5) by the current customer
// POST /api/ratings/vendors/:vendorId body: { rating, review }
router.post('/vendors/:vendorId', async (req, res) => {
try {
const vendorId = Number(req.params.vendorId);
const customerId = req.user?.customer_id; // set by requireCustomerJWT
const { rating, review } = req.body || {};


if (!customerId) return res.status(401).json({ ok: false, error: 'Auth required' });
if (!vendorId || !rating) return res.status(400).json({ ok: false, error: 'vendorId and rating required' });
if (rating < 1 || rating > 5) return res.status(400).json({ ok: false, error: 'rating must be 1..5' });


const sql = `INSERT INTO vendor_ratings (vendor_id, customer_id, rating, review)
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE rating = VALUES(rating), review = VALUES(review)`;
await db.query(sql, [vendorId, customerId, rating, review ?? null]);


const [rows] = await db.query('SELECT * FROM vendor_rating_stats WHERE vendor_id = ?', [vendorId]);
res.json({ ok: true, vendor_id: vendorId, stats: rows[0] || null });
} catch (e) {
console.error('rate vendor error', e);
res.status(500).json({ ok: false, error: 'Failed to submit rating' });
}
});


// Optional: rate a product
router.post('/products/:productId', async (req, res) => {
try {
const productId = Number(req.params.productId);
const customerId = req.user?.customer_id;
const { rating, review } = req.body || {};


if (!customerId) return res.status(401).json({ ok: false, error: 'Auth required' });
if (!productId || !rating) return res.status(400).json({ ok: false, error: 'productId and rating required' });
if (rating < 1 || rating > 5) return res.status(400).json({ ok: false, error: 'rating must be 1..5' });


const sql = `INSERT INTO product_ratings (product_id, customer_id, rating, review)
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE rating = VALUES(rating), review = VALUES(review)`;
await db.query(sql, [productId, customerId, rating, review ?? null]);


const [rows] = await db.query('SELECT * FROM product_rating_stats WHERE product_id = ?', [productId]);
res.json({ ok: true, product_id: productId, stats: rows[0] || null });
} catch (e) {
console.error('rate product error', e);
res.status(500).json({ ok: false, error: 'Failed to submit product rating' });
}
});


export default router;