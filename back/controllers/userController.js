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

// DELETE user by ID
exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  const sql = `DELETE FROM users WHERE id = ?`;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("❌ MySQL DELETE error:", err);
      return res.status(500).json({ error: "Failed to delete user" });
    }
    res.json({ message: "User deleted successfully" });
  });
};

// UPDATE USER BY ID
exports.updateUser = (req, res) => {
  const id = req.params.id;

  // עותק ללא created_at
  const updatedData = { ...req.body };
  delete updatedData.created_at;

  const fields = Object.keys(updatedData)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(updatedData);

  const sql = `UPDATE users SET ${fields} WHERE id = ?`;

  db.query(sql, [...values, id], (err, result) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({ error: "Failed to update user" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully" });
  });
};

// LOGIN user by email + "name" as password
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = results[0];

    if (user.name !== password) {
      return res.status(403).json({ error: "Incorrect password" });
    }

    res.json({ id: user.id, name: user.name, email: user.email });
  });
};
