import React, { useState, useEffect } from "react";
import "./DataTable.css";
import { formatValue } from "./functions";

const DataTable = ({
  data = [],
  title = "Data Table",
  add = null,
  refresh = null,
}) => {
  const [tableData, setTableData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const handleAddClick = () => {
    setFormValues({});
    setEditingId(null);
    setShowForm(!showForm);
  };

  const handleInputChange = (e, key) => {
    const value = key === "active" ? e.target.checked : e.target.value;
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:3001/users/${editingId}`
      : `http://localhost:3001/users`;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save");
        return res.json();
      })
      .then(() => refresh?.().then(setTableData))
      .then(() => {
        setFormValues({});
        setShowForm(false);
        setEditingId(null);
      })
      .catch((err) => {
        console.error("Failed to save user:", err);
      });
  };

  const handleEdit = (row) => {
    setFormValues(row);
    setEditingId(row.id);
    setShowForm(true);
  };

  const handleRefresh = async () => {
    if (typeof refresh === "function") {
      try {
        const updated = await refresh();
        setTableData(updated);
      } catch (err) {
        console.error("Refresh failed:", err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את המשתמש?")) return;

    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        if (typeof refresh === "function") {
          const updated = await refresh();
          setTableData(updated);
        }
      } else {
        console.error("Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  if (!tableData || tableData.length === 0) {
    return (
      <div className="wrapper">
        <div className="header-row">
          {refresh && (
            <button className="small-button" onClick={handleRefresh}>
              🔄
            </button>
          )}
          <h2 className="title">{title}</h2>
        </div>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  const columns = Object.keys(tableData[0]);

  return (
    <div className="wrapper">
      <div className="header-row">
        {refresh && (
          <button className="small-button" onClick={handleRefresh}>
            🔄
          </button>
        )}
        <h2 className="title">{title}</h2>
      </div>

      <div className="container">
        <table className="table">
          <thead>
            <tr>
              <th className="th">#</th>
              {columns.map((col) => (
                <th key={col} className="th">
                  {col.replace(/_/g, " ")}
                </th>
              ))}
              <th className="th">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr
                key={row.id || idx}
                className={idx % 2 !== 0 ? "row-hover" : ""}
              >
                <td className="td">{idx + 1}</td>
                {columns.map((col) => (
                  <td key={col} className="td">
                    {formatValue(col, row[col])}
                  </td>
                ))}
                <td className="td">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(row)}
                  >
                    ✏ ערוך
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(row.id)}
                  >
                    🗑 מחק
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {add && (
        <button className="button" onClick={handleAddClick}>
          {showForm ? "בטל" : "➕ משתמש חדש"}
        </button>
      )}

      {showForm && (
        <div className="form-view">
          {columns
            .filter((col) => col !== "id" && !col.includes("created_at"))
            .map((col) => (
              <div key={col} className="input-group">
                <label htmlFor={col} className="label">
                  {col.replace(/_/g, " ")}
                </label>
                {col === "active" ? (
                  <input
                    type="checkbox"
                    id={col}
                    checked={!!formValues[col]}
                    onChange={(e) => handleInputChange(e, col)}
                  />
                ) : (
                  <input
                    id={col}
                    type="text"
                    value={formValues[col] || ""}
                    onChange={(e) => handleInputChange(e, col)}
                    className="input"
                  />
                )}
              </div>
            ))}
          <button className="button" onClick={handleSubmit}>
            {editingId ? "עדכן" : "שלח"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
