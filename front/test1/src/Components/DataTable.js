import React, { useState, useEffect } from "react";

const styles = {
  wrapper: {
    padding: "24px",
    textAlign: "center",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  loadingText: {
    color: "#777",
  },
  container: {
    overflowX: "auto",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #ccc",
    borderRadius: "12px",
    overflow: "hidden",
  },
  th: {
    backgroundColor: "#d1cdcdff",
    fontWeight: "bold",
    padding: "12px 16px",
    borderBottom: "2px solid #ccc",
    textAlign: "left",
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #ddd",
    backgroundColor: "white",
    textAlign: "left",
  },
  rowHover: {
    backgroundColor: "#f9f9f9",
  },
  active: {
    color: "green",
    fontWeight: "bold",
  },
  inactive: {
    color: "red",
    fontWeight: "bold",
  },
  button: {
    marginTop: "20px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "bold",
    backgroundColor: "#2c3e50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  smallButton: {
    padding: "6px 10px",
    fontSize: "13px",
    fontWeight: "bold",
    backgroundColor: "#2c3e50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  formView: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#f4f4f4",
    borderRadius: "10px",
    maxWidth: "500px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  inputGroup: {
    marginBottom: "12px",
    textAlign: "left",
  },
  input: {
    width: "100%",
    padding: "8px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "bold",
  },
};

const formatValue = (key, value) => {
  if (key === "active") {
    return (
      <span style={value ? styles.active : styles.inactive}>
        {value ? "Active" : "Not Active"}
      </span>
    );
  }

  if (
    key.includes("date") ||
    key.includes("created_at") ||
    key.includes("updated_at")
  ) {
    const parsed = new Date(value);
    if (isNaN(parsed)) return "—";
    return parsed.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return value;
};

const DataTable = ({
  data = [],
  title = "Data Table",
  add = null,
  refresh = null,
}) => {
  const [tableData, setTableData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const handleAddClick = () => {
    setShowForm(!showForm);
  };

  const handleInputChange = (e, key) => {
    const value = key === "active" ? e.target.checked : e.target.value;
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (typeof add === "function") {
      add(formValues)
        .then((newUser) => {
          setTableData((prev) => [...prev, newUser]);
          setFormValues({});
          setShowForm(false);
        })
        .catch((err) => {
          console.error("Failed to add user:", err);
        });
    }
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

  if (!tableData || tableData.length === 0) {
    return (
      <div style={styles.wrapper}>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  const columns = Object.keys(tableData[0]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>{title}</h2>
        {refresh && (
          <button style={styles.smallButton} onClick={handleRefresh}>
            🔄 Refresh
          </button>
        )}
      </div>

      <div style={styles.container}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              {columns.map((col) => (
                <th key={col} style={styles.th}>
                  {col.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr
                key={row.id || idx}
                style={idx % 2 === 0 ? {} : styles.rowHover}
              >
                <td style={styles.td}>{idx + 1}</td>
                {columns.map((col) => (
                  <td key={col} style={styles.td}>
                    {formatValue(col, row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {add && (
        <button style={styles.button} onClick={handleAddClick}>
          {showForm ? "Cancel" : "➕ Add Row Form"}
        </button>
      )}

      {showForm && (
        <div style={styles.formView}>
          {columns
            .filter((col) => col !== "id" && !col.includes("created_at"))
            .map((col) => (
              <div key={col} style={styles.inputGroup}>
                <label htmlFor={col} style={styles.label}>
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
                    style={styles.input}
                  />
                )}
              </div>
            ))}
          <button style={styles.button} onClick={handleSubmit}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
