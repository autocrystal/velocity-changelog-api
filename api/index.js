const express = require("express");
const pool = require("../db");
const cors = require("cors");
require("dotenv").config();
const serverless = require("serverless-http");

const app = express();
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.get("/changelogs", async (req, res) => {
  try {
    const sql = `
      SELECT c.id, c.created_at, array_agg(l.line) AS lines
      FROM changelogs c
      LEFT JOIN changelog_lines l ON c.id = l.changelog_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/changelogs", async (req, res) => {
  const token = req.headers["authorization"];
  if (!token || token !== `Bearer ${process.env.SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { lines } = req.body;
  if (!Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ error: "Lines array required" });
  }

  try {
    const result = await pool.query("INSERT INTO changelogs DEFAULT VALUES RETURNING id");
    const changelogId = result.rows[0].id;

    const insertLine = "INSERT INTO changelog_lines (changelog_id, line) VALUES ($1, $2)";
    for (const line of lines) {
      await pool.query(insertLine, [changelogId, line]);
    }

    res.status(201).json({ id: changelogId, lines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/changelogs/latest", async (req, res) => {
  try {
    const sql = `
      SELECT c.id, c.created_at, array_agg(l.line) AS lines
      FROM changelogs c
      LEFT JOIN changelog_lines l ON c.id = l.changelog_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT 1
    `;
    const { rows } = await pool.query(sql);
    if (rows.length === 0) return res.status(404).json({ error: "No changelogs found" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/changelogs/:id", async (req, res) => {
  const token = req.headers["authorization"];
  if (!token || token !== `Bearer ${process.env.SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM changelogs WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Changelog not found" });
    }
    res.json({ deleted: true, id: parseInt(id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
module.exports.handler = serverless(app);
