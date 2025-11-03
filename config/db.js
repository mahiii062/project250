// config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

/**
 * Use a pooled, promise-based connection so:
 *  - db.query(...) works everywhere
 *  - db.getConnection() is available for transactions
 */
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "", // you used DB_PASSWORD earlier
  database: process.env.DB_NAME || "nibashDB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Optional connectivity check on boot (non-fatal)
try {
  const [row] = await db.query("SELECT 1 AS ok");
  console.log("✅ Connected to MySQL pool (nibashDB). Ping:", row?.[0]?.ok === 1 ? "ok" : "unknown");
} catch (e) {
  console.error("❌ Database pool init failed:", e.message);
}

export default db;
// (optional) also export as a named 'pool' if any file uses { pool }
export { db as pool };
