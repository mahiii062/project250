// config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Use environment variables for everything
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD, // use env variable
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Async function to check connectivity
async function testConnection() {
  try {
    const [row] = await db.query("SELECT 1 AS ok");
    console.log("✅ Connected to MySQL pool:", row?.[0]?.ok === 1 ? "ok" : "unknown");
  } catch (e) {
    console.error("❌ Database pool init failed:", e.message);
  }
}

// Ensure vendor verification columns exist (safe / idempotent)
async function ensureVendorVerificationColumns() {
  try {
    const dbName = process.env.DB_NAME;

    // Check and add verification_status
    const [statusRow] = await db.query(
      "SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Vendors' AND COLUMN_NAME = 'verification_status'",
      [dbName]
    );
    if (!statusRow?.[0]?.cnt) {
      await db.query("ALTER TABLE Vendors ADD COLUMN verification_status ENUM('unverified','pending','verified','rejected') NOT NULL DEFAULT 'unverified'");
    }

    // Check and add verification_requested_at
    const [reqRow] = await db.query(
      "SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Vendors' AND COLUMN_NAME = 'verification_requested_at'",
      [dbName]
    );
    if (!reqRow?.[0]?.cnt) {
      await db.query("ALTER TABLE Vendors ADD COLUMN verification_requested_at DATETIME NULL");
    }

    // Check and add verification_documents
    const [docRow] = await db.query(
      "SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Vendors' AND COLUMN_NAME = 'verification_documents'",
      [dbName]
    );
    if (!docRow?.[0]?.cnt) {
      await db.query("ALTER TABLE Vendors ADD COLUMN verification_documents JSON NULL");
    }

    // Create index if it doesn't exist
    const [idxRow] = await db.query(
      "SELECT COUNT(*) AS cnt FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Vendors' AND INDEX_NAME = 'idx_vendors_verification_status'",
      [dbName]
    );
    if (!idxRow?.[0]?.cnt) {
      await db.query("CREATE INDEX idx_vendors_verification_status ON Vendors (verification_status)");
    }

    console.log('✅ Vendor verification columns ensured');
  } catch (e) {
    console.warn('⚠️ Could not ensure vendor verification columns:', e.message);
    // Don't throw - failure here shouldn't bring the whole app down
  }
}

// Run the test and schema ensure immediately
testConnection();
ensureVendorVerificationColumns();

export default db;
export { db as pool };
