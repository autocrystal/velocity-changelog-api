const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS changelogs (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS changelog_lines (
      id SERIAL PRIMARY KEY,
      changelog_id INTEGER REFERENCES changelogs(id) ON DELETE CASCADE,
      line TEXT NOT NULL
    )
  `);
})();

module.exports = pool;
