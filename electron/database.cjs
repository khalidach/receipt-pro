const path = require('path');
const fs = require('fs');

let SQL = null;
let db = null;
let currentDbPath = '';

/**
 * Persist the in-memory SQLite database to disk
 */
function persistToDisk() {
  if (!db || !currentDbPath) return;
  try {
    const data = db.export();
    fs.writeFileSync(currentDbPath, Buffer.from(data));
  } catch (err) {
    console.error('[SQLite] Failed to persist database to disk:', err);
  }
}

/**
 * Initialize the SQLite database using sql.js (WebAssembly SQLite)
 */
async function initDatabase(userDataPath) {
  if (db) return db;

  if (!SQL) {
    const initSqlJs = require('sql.js/dist/sql-wasm-inline.js');
    SQL = await initSqlJs();
  }

  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  currentDbPath = path.join(userDataPath, 'receipts.db');
  console.log('[SQLite] Initializing database at:', currentDbPath);

  if (fs.existsSync(currentDbPath)) {
    try {
      const fileBuffer = fs.readFileSync(currentDbPath);
      db = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn('[SQLite] Failed to load existing database file, creating fresh one:', e);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
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

  persistToDisk();
  console.log('[SQLite] Tables and indexes verified successfully.');
  return db;
}

/**
 * Retrieve all receipts, company profile, and settings
 */
function getAllData() {
  if (!db) throw new Error('Database not initialized');

  // Receipts
  const receiptsRes = db.exec(`SELECT data FROM receipts ORDER BY date DESC, created_at DESC`);
  const receipts = [];
  if (receiptsRes.length > 0 && receiptsRes[0].values) {
    for (const row of receiptsRes[0].values) {
      try {
        receipts.push(JSON.parse(row[0]));
      } catch {}
    }
  }

  // Settings
  let company = null;
  const companyRes = db.exec(`SELECT value FROM settings WHERE key = 'company_profile'`);
  if (companyRes.length > 0 && companyRes[0].values && companyRes[0].values.length > 0) {
    try {
      company = JSON.parse(companyRes[0].values[0][0]);
    } catch {}
  }

  let lastReceiptNum = null;
  const lastNumRes = db.exec(`SELECT value FROM settings WHERE key = 'last_receipt_num'`);
  if (lastNumRes.length > 0 && lastNumRes[0].values && lastNumRes[0].values.length > 0) {
    lastReceiptNum = lastNumRes[0].values[0][0];
  }

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

  db.run('BEGIN TRANSACTION;');
  try {
    db.run('DELETE FROM receipts;');

    const stmt = db.prepare(`
      INSERT INTO receipts (
        id, receipt_number, date, client_name, total_amount, paid_amount,
        remaining_amount, payment_method, parent_receipt_id, created_at, updated_at, data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const r of receipts) {
      stmt.run([
        r.id || '',
        r.receiptNumber || '',
        r.date || '',
        r.clientName || '',
        r.totalAmount !== undefined && r.totalAmount !== null ? Number(r.totalAmount) : null,
        r.paidAmount !== undefined && r.paidAmount !== null ? Number(r.paidAmount) : 0,
        r.remainingAmount !== undefined && r.remainingAmount !== null ? Number(r.remainingAmount) : null,
        r.paymentMethod || 'cash',
        r.parentReceiptId || null,
        r.createdAt || new Date().toISOString(),
        r.updatedAt || new Date().toISOString(),
        JSON.stringify(r)
      ]);
    }
    stmt.free();
    db.run('COMMIT;');
    persistToDisk();
    return true;
  } catch (err) {
    db.run('ROLLBACK;');
    throw err;
  }
}

/**
 * Save company profile
 */
function saveCompanyProfile(profile) {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(`
    INSERT INTO settings (key, value)
    VALUES ('company_profile', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  stmt.run([JSON.stringify(profile)]);
  stmt.free();
  persistToDisk();
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
  const data = db.export();
  fs.writeFileSync(destPath, Buffer.from(data));
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
  const backupBuffer = fs.readFileSync(sourcePath);
  const tempDb = new SQL.Database(backupBuffer);

  const res = tempDb.exec(`SELECT data FROM receipts`);
  const importedReceipts = [];
  if (res.length > 0 && res[0].values) {
    for (const row of res[0].values) {
      try {
        importedReceipts.push(JSON.parse(row[0]));
      } catch {}
    }
  }

  const compRes = tempDb.exec(`SELECT value FROM settings WHERE key = 'company_profile'`);
  let compProfile = null;
  if (compRes.length > 0 && compRes[0].values && compRes[0].values.length > 0) {
    try {
      compProfile = JSON.parse(compRes[0].values[0][0]);
    } catch {}
  }
  tempDb.close();

  if (compProfile) {
    saveCompanyProfile(compProfile);
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
      const res = db.exec('SELECT COUNT(*) as count FROM receipts');
      if (res.length > 0 && res[0].values && res[0].values.length > 0) {
        receiptCount = res[0].values[0][0];
      }
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
