import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data', 'dev.db');

let db: SqlJsDatabase | null = null;
let initPromise: Promise<SqlJsDatabase> | null = null;

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function initDb(): Promise<SqlJsDatabase> {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const SQL = await initSqlJs();
    ensureDir();

    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Create schema
    db.run(`
      CREATE TABLE IF NOT EXISTS doctors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        specialization TEXT NOT NULL,
        experience INTEGER NOT NULL,
        consultationFee REAL NOT NULL,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS slots (
        id TEXT PRIMARY KEY,
        doctorId TEXT NOT NULL,
        slotTime TEXT NOT NULL,
        isBooked INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE CASCADE,
        UNIQUE(doctorId, slotTime)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        doctorId TEXT NOT NULL,
        userName TEXT NOT NULL,
        slotTime TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE CASCADE
      )
    `);

    db.run('CREATE INDEX IF NOT EXISTS idx_slots_doctor ON slots(doctorId)');
    db.run('CREATE INDEX IF NOT EXISTS idx_bookings_doctor ON bookings(doctorId)');
    db.run('CREATE INDEX IF NOT EXISTS idx_doctors_spec ON doctors(specialization)');

    saveDb();
    return db;
  })();

  return initPromise;
}

export function getDb(): SqlJsDatabase {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

export function saveDb(): void {
  if (!db) return;
  ensureDir();
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Helper to run a query and return rows as objects
export function queryAll(sql: string, params: any[] = []): any[] {
  const stmt = getDb().prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function queryOne(sql: string, params: any[] = []): any | null {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

export function runSql(sql: string, params: any[] = []): void {
  if (params.length > 0) {
    getDb().run(sql, params);
  } else {
    getDb().run(sql);
  }
  saveDb();
}
