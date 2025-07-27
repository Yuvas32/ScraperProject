const db = require("../config/db");

// GET all users
exports.getAllUsers = (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// ADD new worker
exports.createUser = (req, res) => {
  const { name, email, active } = req.body;
  const sql = `INSERT INTO users (name, email, active) VALUES (?, ?, ?)`;

  db.query(sql, [name, email, active], (err, result) => {
    if (err) {
      console.error("❌ MySQL INSERT error:", err);
      return res.status(500).json({ error: err });
    }

    const getSql = `SELECT * FROM users WHERE id = ?`;
    db.query(getSql, [result.insertId], (err2, rows) => {
      if (err2) {
        console.error("❌ MySQL FETCH error:", err2);
        return res.status(500).json({ error: err2 });
      }
      res.json(rows[0]); // ✅ Return full row including created_at
    });
  });
};
