// back/controllers/userController.js
import db from "../config/db.js";

/**
 * GET /users
 * Return all users.
 */
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

/**
 * POST /users
 * Body: { name, email, active=true, role="user" }
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, active = true, role = "user" } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required" });
    }

    const sql =
      "INSERT INTO users (name, email, active, role) VALUES (?, ?, ?, ?)";
    const [result] = await db.execute(sql, [name, email, !!active, role]);

    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [
      result.insertId,
    ]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error("createUser error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

/**
 * DELETE /users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

/**
 * PUT /users/:id
 * Body: any updatable fields (name, email, active, role)
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = { ...req.body };
    delete updated.created_at;

    const keys = Object.keys(updated);
    if (keys.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const sets = keys.map((k) => `${k} = ?`).join(", ");
    const values = keys.map((k) => updated[k]);

    const sql = `UPDATE users SET ${sets} WHERE id = ?`;
    const [result] = await db.execute(sql, [...values, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

/**
 * POST /users/login
 * Body: { email, password }
 * NOTE: Demo logic — password must equal the 'name' field and user must be active.
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = rows[0];
    if (user.name !== password) {
      return res.status(403).json({ error: "Incorrect password" });
    }
    if (!user.active) {
      return res.status(403).json({ error: "User is inactive" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    });
  } catch (err) {
    console.error("loginUser error:", err);
    res.status(500).json({ error: "Database error" });
  }
};
