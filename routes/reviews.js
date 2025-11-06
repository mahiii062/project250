// routes/reviews.js
import { Router } from 'express';
import db from '../config/db.js';
import jwt from 'jsonwebtoken';

const router = Router();

// Light customer auth from Authorization header
function requireCustomer(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const [, token] = auth.split(' ');
    if (!token) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    const dec = jwt.verify(token, process.env.JWT_SECRET);
    if (!dec?.customer_id) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    req.customer_id = dec.customer_id;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
}

/** GET /api/reviews/vendor/:vendor_id */
router.get('/vendor/:vendor_id', async (req, res) => {
  try {
    const vendor_id = Number(req.params.vendor_id);
    const [rows] = await db.query(
      `SELECT r.review_id, r.customer_id, c.customer_name, r.rating, r.comment, r.created_at
       FROM Reviews r
       JOIN Customers c ON c.customer_id = r.customer_id
       WHERE r.vendor_id = ?
       ORDER BY r.created_at DESC
       LIMIT 200`,
      [vendor_id]
    );

    // Also compute avg rating
    const [agg] = await db.query(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM Reviews WHERE vendor_id = ?`,
      [vendor_id]
    );
    res.json({ ok: true, data: { reviews: rows, stats: agg[0] || { avg_rating: null, total: 0 } } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/** POST /api/reviews  (customer only)
 * body: { vendor_id, rating(1-5), comment? }
 */
router.post('/', requireCustomer, async (req, res) => {
  try {
    const { vendor_id, rating, comment } = req.body || {};
    if (!vendor_id || !rating) return res.status(400).json({ ok: false, error: 'vendor_id and rating are required' });

    await db.query(
      `INSERT INTO Reviews (vendor_id, customer_id, rating, comment) VALUES (?,?,?,?)`,
      [vendor_id, req.customer_id, Math.max(1, Math.min(5, Number(rating))), comment || null]
    );

    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
