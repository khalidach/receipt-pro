const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;
let currentDbPath = '';

/**
 * Initialize the SQLite database
 */
function initDatabase(userDataPath) {
  if (db) return db;

  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  currentDbPath = path.join(userDataPath, 'receipts.db');
  console.log('[SQLite] Initializing database at:', currentDbPath);

  db = new Database(currentDbPath);

  // High performance & crash resilience
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      receipt_number TEXT NOT NULL,
      date TEXT NOT NULL,
      client_name TEXT NOT NULL,
      total_amount REAL,
      paid_amount REAL NOT NULL,
      remaining_amount REAL,
      payment_method TEXT NOT NULL,
      parent_receipt_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      data TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(date);
    CREATE INDEX IF NOT EXISTS idx_receipts_number ON receipts(receipt_number);
    CREATE INDEX IF NOT EXISTS idx_receipts_parent ON receipts(parent_receipt_id);
    CREATE INDEX IF NOT EXISTS idx_receipts_client ON receipts(client_name);
  `);

  console.log('[SQLite] Tables and indexes verified successfully.');
  return db;
}

/**
 * Retrieve all receipts, company profile, and settings
 */
function getAllData() {
  if (!db) throw new Error('Database not initialized');

  // Receipts
  const rows = db.prepare(`
    SELECT data FROM receipts ORDER BY date DESC, created_at DESC
  `).all();
  const receipts = rows.map(r => {
    try {
      return JSON.parse(r.data);
    } catch {
      return null;
    }
  }).filter(Boolean);

  // Settings
  const companyRow = db.prepare(`SELECT value FROM settings WHERE key = 'company_profile'`).get();
  const company = companyRow ? JSON.parse(companyRow.value) : null;

  const lastNumRow = db.prepare(`SELECT value FROM settings WHERE key = 'last_receipt_num'`).get();
  const lastReceiptNum = lastNumRow ? lastNumRow.value : null;

  return {
    receipts,
    company,
    lastReceiptNum,
    dbPath: currentDbPath,
  };
}

/**
 * Save receipts in a fast, atomic transaction
 */
function saveReceipts(receipts) {
  if (!db) throw new Error('Database not initialized');
  if (!Array.isArray(receipts)) return false;

  const saveTx = db.transaction((items) => {
    db.prepare('DELETE FROM receipts').run();

    const insert = db.prepare(`
      INSERT INTO receipts (
        id, receipt_number, date, client_name, total_amount, paid_amount,
        remaining_amount, payment_method, parent_receipt_id, created_at, updated_at, data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const r of items) {
      insert.run(
        r.id,
        r.receiptNumber || '',
        r.date || '',
        r.clientName || '',
        r.totalAmount ?? null,
        r.paidAmount || 0,
        r.remainingAmount ?? null,
        r.paymentMethod || 'cash',
        r.parentReceiptId || null,
        r.createdAt || new Date().toISOString(),
        r.updatedAt || new Date().toISOString(),
        JSON.stringify(r)
      );
    }
  });

  saveTx(receipts);
  return true;
}

/**
 * Save company profile
 */
function saveCompanyProfile(profile) {
  if (!db) throw new Error('Database not initialized');
  const upsert = db.prepare(`
    INSERT INTO settings (key, value)
    VALUES ('company_profile', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  upsert.run(JSON.stringify(profile));
  return true;
}

/**
 * Backup the active database to a chosen file path
 */
async function backupDatabase(destPath) {
  if (!db) throw new Error('Database not initialized');

  if (destPath.endsWith('.json')) {
    const data = getAllData();
    fs.writeFileSync(destPath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true, filePath: destPath };
  }

  // Native SQLite backup for .db / .sqlite files
  await db.backup(destPath);
  return { success: true, filePath: destPath };
}

/**
 * Restore database from a backup file (.db or .json)
 */
function restoreDatabase(sourcePath) {
  if (!db) throw new Error('Database not initialized');

  if (!fs.existsSync(sourcePath)) {
    throw new Error('الملف المحدد غير موجود');
  }

  if (sourcePath.endsWith('.json')) {
    const raw = fs.readFileSync(sourcePath, 'utf-8');
    const parsed = JSON.parse(raw);

    if (parsed.company) {
      saveCompanyProfile(parsed.company);
    }
    if (Array.isArray(parsed.receipts)) {
      saveReceipts(parsed.receipts);
    }
    return { success: true, receiptsCount: parsed.receipts ? parsed.receipts.length : 0 };
  }

  // Restore from another SQLite DB
  const tempDb = new Database(sourcePath, { readonly: true });
  const rows = tempDb.prepare(`SELECT data FROM receipts`).all();
  const importedReceipts = rows.map(r => JSON.parse(r.data)).filter(Boolean);

  const companyRow = tempDb.prepare(`SELECT value FROM settings WHERE key = 'company_profile'`).get();
  tempDb.close();

  if (companyRow) {
    saveCompanyProfile(JSON.parse(companyRow.value));
  }
  saveReceipts(importedReceipts);

  return { success: true, receiptsCount: importedReceipts.length };
}

/**
 * Get database info
 */
function getDatabaseInfo() {
  let sizeBytes = 0;
  let receiptCount = 0;

  try {
    if (fs.existsSync(currentDbPath)) {
      sizeBytes = fs.statSync(currentDbPath).size;
    }
    if (db) {
      const countRow = db.prepare('SELECT COUNT(*) as count FROM receipts').get();
      receiptCount = countRow ? countRow.count : 0;
    }
  } catch (err) {
    console.error('Failed to get database stats:', err);
  }

  return {
    path: currentDbPath,
    sizeBytes,
    receiptCount,
  };
}

module.exports = {
  initDatabase,
  getAllData,
  saveReceipts,
  saveCompanyProfile,
  backupDatabase,
  restoreDatabase,
  getDatabaseInfo,
};
