// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './config/db.js';

// Routers
import vendorAuthRouter from './routes/vendorAuth.js';
import customerAuthRouter from './routes/customerAuth.js';
import lookupsRouter from './routes/lookups.js';
import vendorsRouter from './routes/vendors.js';
import productsRouter from './routes/products.js';
import servicesRouter from './routes/services.js';
import requireVendor from './middleware/requireVendor.js';
// import mapRouter from './routes/map.js'; // if you actually have it

const app = express();

/* ---------- CORS (Express 5–safe) ---------- */
// Allow file:// (Origin null) and localhost during dev
const corsOpts = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // file:// or curl
    if (/^https?:\/\/localhost(:\d+)?$/i.test(origin)) return cb(null, true);
    return cb(null, true); // open during dev
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOpts));

// Explicit preflight responder (no app.options('*', …) in Express 5)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(204);
  }
  next();
});

/* ---------- Parsers ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- Logger ---------- */
app.use((req, _res, next) => {
  console.log(`\n📨 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (Object.keys(req.body || {}).length) {
    console.log('   Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

/* ---------- Health ---------- */
app.get('/api/ping', (_req, res) => res.json({ ok: true }));
app.get('/api/vendors-ping', (_req, res) => res.json({ ok: true, where: 'server' }));

/* ---------- Public ---------- */
app.use('/api/vendor', vendorAuthRouter);
app.use('/api/customer', customerAuthRouter);
app.use('/api/lookups', lookupsRouter);
// if (mapRouter) app.use('/api/map', mapRouter);

/* ---------- Protected (vendor) ---------- */
app.use('/api/vendors', requireVendor, vendorsRouter);
app.use('/api/products', requireVendor, productsRouter);
app.use('/api/services', requireVendor, servicesRouter);

/* ---------- OpenAI demo ---------- */
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: 'No message provided.' });
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are Nibash Assistant, a friendly expert on furniture, interior design, and home improvement.' },
          { role: 'user', content: message },
        ],
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error('❌ OpenAI error:', errText);
      return res.status(500).json({ reply: 'OpenAI API returned an error.' });
    }
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? 'No reply';
    res.json({ reply });
  } catch (error) {
    console.error('🚨 Server error:', error.message);
    res.status(500).json({ reply: 'Sorry, something went wrong on the server.' });
  }
});

/* ---------- 404 ---------- */
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Route not found', path: req.url });
});

/* ---------- Error handler ---------- */
app.use((err, _req, res, _next) => {
  console.error('🔴 ERROR:', err.message);
  res.status(500).json({ ok: false, error: err.message });
});

/* ---------- Port ---------- */
const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log('✅ Ready to accept requests\n');
});
