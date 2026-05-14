/**
 * database.js
 * Uses sql.js — a pure JavaScript port of SQLite.
 * No native compilation needed; works on any machine.
 */

const initSqlJs = require('sql.js');
const fs        = require('fs');
const path      = require('path');

const DB_PATH = path.join(__dirname, '../../taskmate.db');

let db   = null;
let init = null;

async function getDb() {
  if (db) return db;
  if (!init) init = _init();
  return init;
}

async function _init() {
  const SQL    = await initSqlJs();
  const useFile = process.env.NODE_ENV !== 'test' && fs.existsSync(DB_PATH);
  db = useFile
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    DEFAULT '',
      category    TEXT    DEFAULT 'General',
      status      TEXT    DEFAULT 'pending',
      created_at  TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
    )
  `);
  return db;
}

function saveDb() {
  if (process.env.NODE_ENV === 'test') return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function resetDb() {
  if (db) { db.close(); db = null; }
  init = null;
  await getDb();
}

async function run(sql, params = []) {
  const d = await getDb();
  d.run(sql, params);
  saveDb();
  const r = d.exec('SELECT last_insert_rowid() AS id');
  return { lastInsertRowid: r[0]?.values[0][0] ?? null };
}

async function all(sql, params = []) {
  const d       = await getDb();
  const results = d.exec(sql, params);
  if (!results.length) return [];
  const { columns, values } = results[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

async function get(sql, params = []) {
  const rows = await all(sql, params);
  return rows[0] ?? null;
}

module.exports = { getDb, resetDb, run, all, get };
