import React from "react";

const styles = {
  wrapper: {
    padding: "24px",
    textAlign: "center",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "16px",
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
    backgroundColor: "#f5f5f5",
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
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return value;
};

const DataTable = ({ data = [], title = "Data Table" }) => {
  if (!data || data.length === 0) {
    return (
      <div style={styles.wrapper}>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>{title}</h2>
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
            {data.map((row, idx) => (
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
    </div>
  );
};

export default DataTable;
