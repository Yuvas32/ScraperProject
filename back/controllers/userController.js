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
  const sql = `INSERT INTO users (name, email, active)
               VALUES (?, ?, ?, ?)`;

  db.query(sql, [name, email, active], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "User added!", id: result.insertId });
  });
};
