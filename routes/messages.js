// routes/messages.js
import { Router } from 'express';
import db from '../config/db.js';

const router = Router();

/** 1:1 thread (vendor & customer) */
router.get('/dm', async (req, res) => {
  try {
    const vendor_id = Number(req.query.vendor_id);
    const customer_id = Number(req.query.customer_id);
    if (!vendor_id || !customer_id) {
      return res.status(400).json({ ok: false, error: 'vendor_id & customer_id required' });
    }

    const [rows] = await db.query(
      `SELECT message_id, chat_group_id, vendor_id, customer_id, body, created_at
       FROM Messages
       WHERE chat_group_id IS NULL AND vendor_id = ? AND customer_id = ?
       ORDER BY created_at ASC
       LIMIT 500`,
      [vendor_id, customer_id]
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/** POST dm message */
router.post('/dm', async (req, res) => {
  try {
    const { vendor_id, customer_id, body } = req.body || {};
    if (!vendor_id || !customer_id || !body) {
      return res.status(400).json({ ok: false, error: 'vendor_id, customer_id, body required' });
    }
    const [r] = await db.query(
      `INSERT INTO Messages (chat_group_id, vendor_id, customer_id, body) VALUES (NULL, ?, ?, ?)`,
      [vendor_id, customer_id, body]
    );
    res.status(201).json({ ok: true, data: { message_id: r.insertId } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/** Create a chat group */
router.post('/groups', async (req, res) => {
  try {
    const { group_name, member_customer_ids = [], member_vendor_ids = [] } = req.body || {};
    if (!group_name) {
      return res.status(400).json({ ok: false, error: 'group_name required' });
    }

    const [g] = await db.query(`INSERT INTO ChatGroups (group_name) VALUES (?)`, [group_name]);
    const gid = g.insertId;

    // insert members with new schema
    for (const cid of member_customer_ids) {
      if (!cid) continue;
      await db.query(
        `INSERT INTO GroupMembers (chat_group_id, member_kind, member_id, role)
         VALUES (?, 'customer', ?, 'member')`,
        [gid, cid]
      );
    }
    for (const vid of member_vendor_ids) {
      if (!vid) continue;
      await db.query(
        `INSERT INTO GroupMembers (chat_group_id, member_kind, member_id, role)
         VALUES (?, 'vendor', ?, 'member')`,
        [gid, vid]
      );
    }

    res.status(201).json({ ok: true, data: { group_id: gid } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/** Get group messages */
router.get('/groups/:group_id/messages', async (req, res) => {
  try {
    const gid = Number(req.params.group_id);
    const [rows] = await db.query(
      `SELECT message_id, chat_group_id, vendor_id, customer_id, body, created_at
       FROM Messages
       WHERE chat_group_id = ?
       ORDER BY created_at ASC
       LIMIT 500`,
      [gid]
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/** Post a message into a group */
router.post('/groups/:group_id/messages', async (req, res) => {
  try {
    const gid = Number(req.params.group_id);
    const { vendor_id = null, customer_id = null, body } = req.body || {};
    if (!body) return res.status(400).json({ ok: false, error: 'body required' });

    const [r] = await db.query(
      `INSERT INTO Messages (chat_group_id, vendor_id, customer_id, body)
       VALUES (?, ?, ?, ?)`,
      [gid, vendor_id, customer_id, body]
    );
    res.status(201).json({ ok: true, data: { message_id: r.insertId } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
