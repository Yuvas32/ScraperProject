const db = require("../config/db");

// GET all workers
exports.getAllWorkers = (req, res) => {
  db.query("SELECT * FROM workers", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// ADD new worker
exports.createWorker = (req, res) => {
  const { name, email, base_salary, position } = req.body;
  const sql = `INSERT INTO workers (name, email, base_salary, position)
               VALUES (?, ?, ?, ?)`;

  db.query(sql, [name, email, base_salary, position], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Worker added!", id: result.insertId });
  });
};
