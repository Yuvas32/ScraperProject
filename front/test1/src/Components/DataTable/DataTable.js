import React, { useState, useEffect, useMemo } from "react";
import "./DataTable.css";
import { formatValue } from "./functions";
import {
  buildColumnTypes,
  normalizeInForInput,
  normalizeOut,
} from "../../utils/fieldTypes";

const validateField = (key, value, type) => {
  // חובה לכל שדה חוץ מ-id ו-created_at
  if (
    (value === "" || value === null || value === undefined) &&
    type !== "boolean"
  ) {
    return "שדה חובה";
  }

  if (type === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) return "אימייל לא תקין";
  }

  if (type === "phone") {
    const phoneRegex = /^0\d{8,9}$/;
    if (value && !phoneRegex.test(value)) return "טלפון לא תקין";
  }

  if (type === "number" && value !== "" && isNaN(Number(value))) {
    return "מספר לא תקין";
  }

  return null; // תקין
};

const DataTable = ({
  data = [],
  title = "Data Table",
  add = null,
  edit = null,
  deleteItem = null,
  refresh = null,
  tableName,
}) => {
  const [tableData, setTableData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => setTableData(data), [data]);

  // 👇 פענוח סוגים אוטומטי לפי הדאטה והעמודות
  const columnTypes = useMemo(() => buildColumnTypes(tableData), [tableData]);

  const handleAddClick = () => {
    setFormValues({});
    setEditingId(null);
    setShowForm(!showForm);
  };

  const handleInputChange = (e, key) => {
    const type = columnTypes[key];
    const rawValue = type === "boolean" ? e.target.checked : e.target.value;
    const value = normalizeOut(type, rawValue);

    // עדכון הערך
    setFormValues((prev) => ({ ...prev, [key]: value }));

    // בדיקת שגיאה בזמן הקלדה
    const errMsg = validateField(key, value, type);
    setErrors((prev) => ({ ...prev, [key]: errMsg }));
  };

  const handleSubmit = () => {
    const newErrors = {};
    columns
      .filter((col) => col !== "id" && !col.includes("created_at"))
      .forEach((col) => {
        const errMsg = validateField(col, formValues[col], columnTypes[col]);
        if (errMsg) newErrors[col] = errMsg;
      });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // יש שגיאות → לא שולחים
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:3001/${tableName}/${editingId}`
      : `http://localhost:3001/${tableName}`;

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
        setErrors({});
      })
      .catch((err) => console.error("Failed to save user:", err));
  };

  const handleEdit = (row) => {
    // נורמליזציה לערכים לפי סוג ה־input
    const normalized = Object.fromEntries(
      Object.keys(row).map((k) => [
        k,
        normalizeInForInput(columnTypes[k], row[k]),
      ])
    );
    setFormValues(normalized);
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
    if (!window.confirm("האם אתה בטוח שברצונך למחוק?")) return;
    try {
      const res = await fetch(`http://localhost:3001/${tableName}/${id}`, {
        method: "DELETE",
      });
      if (res.ok && typeof refresh === "function") {
        const updated = await refresh();
        setTableData(updated);
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

  // עוזר קטן ל-type ה־HTML
  const htmlTypeFor = (col) => {
    const t = columnTypes[col];
    if (t === "email") return "email";
    if (t === "number") return "number";
    if (t === "date") return "date";
    if (t === "url") return "url";
    if (t === "phone") return "tel";
    return "text";
  };

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
              {(edit || deleteItem) && <th className="th">פעולות</th>}
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
                {(edit || deleteItem) && (
                  <td className="td">
                    {edit && (
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(row)}
                      >
                        ✏ ערוך
                      </button>
                    )}
                    {deleteItem && (
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(row.id)}
                      >
                        🗑 מחק
                      </button>
                    )}
                  </td>
                )}
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
            .map((col) => {
              const t = columnTypes[col];
              const isCheckbox = t === "boolean";
              const isTextArea = t === "textarea";
              const hasError = !!errors[col];
              return (
                <div key={col} className="input-group">
                  <label htmlFor={col} className="label">
                    {col.replace(/_/g, " ")}
                  </label>

                  {isCheckbox ? (
                    <input
                      type="checkbox"
                      id={col}
                      checked={
                        !!normalizeInForInput("boolean", formValues[col])
                      }
                      onChange={(e) => handleInputChange(e, col)}
                    />
                  ) : isTextArea ? (
                    <textarea
                      id={col}
                      value={normalizeInForInput("text", formValues[col])}
                      onChange={(e) => handleInputChange(e, col)}
                      className={`input ${hasError ? "input-error" : ""}`}
                      rows={3}
                    />
                  ) : (
                    <input
                      id={col}
                      type={htmlTypeFor(col)}
                      value={normalizeInForInput(t, formValues[col])}
                      onChange={(e) => handleInputChange(e, col)}
                      className={`input ${hasError ? "input-error" : ""}`}
                    />
                  )}

                  {hasError && <div className="error-text">{errors[col]}</div>}
                </div>
              );
            })}
          <button className="button" onClick={handleSubmit}>
            {editingId ? "עדכן" : "שלח"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
