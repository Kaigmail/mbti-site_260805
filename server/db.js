'use strict';

const path = require('path');

const DB_TYPE = process.env.DB_TYPE || 'sqlite';

let db = null;

function notImplemented() {
  throw new Error(
    'not implemented: DB_TYPE=coze built-in database is not supported in this phase (TODO)'
  );
}

/**
 * Initialize the database. Called once at server startup.
 * Default / `sqlite` -> better-sqlite3 with data/results.db.
 * `coze` -> not implemented this phase (TODO).
 */
function initDB() {
  if (DB_TYPE === 'coze') {
    return notImplemented();
  }

  const Database = require('better-sqlite3');
  const dbPath = path.join(__dirname, '..', 'data', 'results.db');
  db = new Database(dbPath);
  db.prepare(
    `CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      label_code TEXT NOT NULL,
      scores_json TEXT NOT NULL
    )`
  ).run();
  return db;
}

/**
 * Insert a test result and return the new row id.
 *
 * @param {{code: string, scores: Object}} result
 * @returns {number} inserted row id.
 */
function saveResult({ code, scores }) {
  if (DB_TYPE === 'coze') {
    return notImplemented();
  }
  if (!db) {
    throw new Error('database is not initialized');
  }
  const info = db
    .prepare('INSERT INTO results (label_code, scores_json) VALUES (?, ?)')
    .run(code, JSON.stringify(scores));
  return info.lastInsertRowid;
}

module.exports = { initDB, saveResult };
