// src/components/DataTable/DataTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./DataTable.css";
import {
  buildColumnTypes,
  normalizeInForInput,
  normalizeOut,
} from "../../utils/fieldTypes";
import DataTableForm from "./DataTableForm";
import { validateAll, validateField } from "../../utils/validators";
import { formatValue } from "./functions";

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
  const columnTypes = useMemo(() => buildColumnTypes(tableData), [tableData]);

  const handleAddClick = () => {
    setFormValues({});
    setEditingId(null);
    setShowForm((s) => !s);
    setErrors({});
  };

  const handleInputChange = (e, key) => {
    const type = columnTypes[key];
    const rawValue = type === "boolean" ? e.target.checked : e.target.value;
    const value = normalizeOut(type, rawValue);
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: validateField(key, value, type) }));
  };

  const handleSubmit = () => {
    const columns = tableData.length
      ? Object.keys(tableData[0])
      : Object.keys(formValues);
    const newErrors = validateAll(formValues, columns, columnTypes);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

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
    const normalized = Object.fromEntries(
      Object.keys(row).map((k) => [
        k,
        normalizeInForInput(columnTypes[k], row[k]),
      ])
    );
    setFormValues(normalized);
    setEditingId(row.id);
    setShowForm(true);
    setErrors({});
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
        <DataTableForm
          columns={columns}
          columnTypes={columnTypes}
          formValues={formValues}
          errors={errors}
          editingId={editingId}
          onInput={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default DataTable;
