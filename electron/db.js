'use strict';

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

let db = null;

const SEED = [
  {
    category: 'Overview / Leading figure',
    example:
      "Regarding graduates' destinations, just over half (52%) secured full-time employment after graduation, making it by far the largest category.",
    notes: 'Use for the single dominant figure. "By far the largest" only works when the gap to second place is wide.',
  },
  {
    category: 'Ranking',
    example: 'Part-time work was the second most common outcome, accounting for 15% of graduates.',
    notes: '"Accounting for" takes a percentage or a share, never a raw verb phrase.',
  },
  {
    category: 'Comparison',
    example:
      'By comparison, 12% were unemployed, while equal proportions of 8% each pursued further study or travelled abroad.',
    notes: 'Good for sweeping up the small remaining categories in one sentence. "Equal proportions of Y% each" handles ties.',
  },
];

const COLUMNS =
  'id, category, example, example_html, notes, notes_html, created_at, updated_at';

function nowISO() {
  return new Date().toISOString();
}

/**
 * Opens (and migrates/seeds) the database. Safe to call once at startup.
 * @param {string} dbPath absolute path to the sqlite file
 */
function init(dbPath) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS patterns (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      category     TEXT NOT NULL DEFAULT '',
      example      TEXT NOT NULL DEFAULT '',
      example_html TEXT NOT NULL DEFAULT '',
      notes        TEXT NOT NULL DEFAULT '',
      notes_html   TEXT NOT NULL DEFAULT '',
      created_at   TEXT NOT NULL,
      updated_at   TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_patterns_category ON patterns(category);

    CREATE TABLE IF NOT EXISTS meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  migrate();
  seedIfNeeded();
  return db;
}

// Brings an older database up to the current shape. The `pattern` column from
// earlier versions is deliberately left in place rather than dropped: it is no
// longer read or written, but dropping it would destroy entries the user wrote.
function migrate() {
  const columns = db.prepare('PRAGMA table_info(patterns)').all().map((c) => c.name);

  if (!columns.includes('example_html')) {
    db.exec(`ALTER TABLE patterns ADD COLUMN example_html TEXT NOT NULL DEFAULT ''`);
  }
  if (!columns.includes('notes_html')) {
    db.exec(`ALTER TABLE patterns ADD COLUMN notes_html TEXT NOT NULL DEFAULT ''`);
  }
}

// Seeds once ever, tracked in `meta`, so clearing every entry doesn't bring
// the starter rows back on the next launch.
function seedIfNeeded() {
  const flag = db.prepare('SELECT value FROM meta WHERE key = ?').get('seeded');
  if (flag) return;

  const insert = db.prepare(`
    INSERT INTO patterns (category, example, example_html, notes, notes_html, created_at, updated_at)
    VALUES (@category, @example, '', @notes, '', @created_at, @updated_at)
  `);

  const run = db.transaction((rows) => {
    const ts = nowISO();
    for (const row of rows) insert.run({ ...row, created_at: ts, updated_at: ts });
    db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run('seeded', nowISO());
  });

  run(SEED);
}

// Neutralises LIKE wildcards so a literal % or _ in the query matches itself.
function escapeLike(value) {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

/**
 * @param {{ search?: string, category?: string }} [opts]
 */
function list(opts = {}) {
  const search = (opts.search || '').trim();
  const category = (opts.category || '').trim();

  const where = [];
  const params = {};

  if (search) {
    params.q = `%${escapeLike(search.toLowerCase())}%`;
    // Matches the plain-text copies, so formatting markup never affects a search.
    where.push(`(
      LOWER(category) LIKE @q ESCAPE '\\' OR
      LOWER(example)  LIKE @q ESCAPE '\\' OR
      LOWER(notes)    LIKE @q ESCAPE '\\'
    )`);
  }

  if (category) {
    params.category = category;
    where.push('category = @category');
  }

  const sql = `
    SELECT ${COLUMNS} FROM patterns
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY category COLLATE NOCASE ASC, id ASC
  `;

  return db.prepare(sql).all(params);
}

function get(id) {
  return db.prepare(`SELECT ${COLUMNS} FROM patterns WHERE id = ?`).get(id);
}

function normalize(input = {}) {
  return {
    category: String(input.category ?? '').trim(),
    example: String(input.example ?? '').trim(),
    example_html: String(input.example_html ?? '').trim(),
    notes: String(input.notes ?? '').trim(),
    notes_html: String(input.notes_html ?? '').trim(),
  };
}

function create(input) {
  const data = normalize(input);
  if (!data.example) throw new Error('An example sentence is required.');

  const ts = nowISO();
  const info = db
    .prepare(
      `INSERT INTO patterns
         (category, example, example_html, notes, notes_html, created_at, updated_at)
       VALUES
         (@category, @example, @example_html, @notes, @notes_html, @created_at, @updated_at)`
    )
    .run({ ...data, created_at: ts, updated_at: ts });

  return get(info.lastInsertRowid);
}

function update(id, input) {
  const data = normalize(input);
  if (!data.example) throw new Error('An example sentence is required.');
  if (!get(id)) throw new Error(`No entry with id ${id}.`);

  db.prepare(
    `UPDATE patterns
        SET category = @category,
            example = @example,
            example_html = @example_html,
            notes = @notes,
            notes_html = @notes_html,
            updated_at = @updated_at
      WHERE id = @id`
  ).run({ ...data, id, updated_at: nowISO() });

  return get(id);
}

function remove(id) {
  const info = db.prepare('DELETE FROM patterns WHERE id = ?').run(id);
  return { deleted: info.changes };
}

function categories() {
  return db
    .prepare(
      `SELECT DISTINCT category FROM patterns
        WHERE TRIM(category) <> ''
        ORDER BY category COLLATE NOCASE ASC`
    )
    .all()
    .map((r) => r.category);
}

// Small key/value settings (currently just the theme) share the `meta` table.
function getSetting(key, fallback = null) {
  const row = db.prepare('SELECT value FROM meta WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

function setSetting(key, value) {
  db.prepare(
    `INSERT INTO meta (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(key, String(value));
  return getSetting(key);
}

function close() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  init, list, get, create, update, remove, categories, getSetting, setSetting, close,
};
