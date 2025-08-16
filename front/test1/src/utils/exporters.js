// src/utils/exporters.js

// ---- Core helpers (generic) ----

// Convert arbitrary table `data` + `columns` into ordered rows + headers.
// Accepts columns in 3 shapes:
// 1) ['id','name']
// 2) [{ key:'id', label:'ID' }, { key:'name', label:'Name' }]
// 3) [{ accessor:'id', Header:'ID' }, { accessor:'name', Header:'Name' }]  // (React Table style)
export const toRowsAndHeaders = (data = [], columns) => {
  if (!Array.isArray(data) || data.length === 0)
    return { rows: [], headers: [], keys: [] };

  let keys = [];
  let headers = [];

  if (Array.isArray(columns) && columns.length) {
    if (typeof columns[0] === "string") {
      keys = columns;
      headers = columns;
    } else {
      // support various column shapes
      keys = columns.map((c) => c.key ?? c.accessor ?? c.field).filter(Boolean);
      headers = columns.map(
        (c) => c.label ?? c.Header ?? c.header ?? c.key ?? c.accessor ?? c.field
      );
    }
  } else {
    // fallback: infer from first row
    keys = Object.keys(data[0]);
    headers = keys;
  }

  const rows = data.map((row) =>
    keys.reduce((acc, k) => {
      acc[k] = row?.[k] ?? null;
      return acc;
    }, {})
  );

  return { rows, headers, keys };
};

// CSV builder (Excel-friendly, with BOM)
export const rowsToCSV = (rows, headers) => {
  const toCell = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    // Quote if needed, escape quotes
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => toCell(r[h])).join(",")),
  ];
  return "\uFEFF" + lines.join("\n"); // BOM so Excel detects UTF-8
};

// Trigger a download for a Blob (browser-safe)
export const downloadBlob = (blob, filename) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    console.warn("downloadBlob called outside the browser; skipping.");
    return;
  }
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// Very light filename sanitizer
export const safeName = (s = "export") =>
  s
    .replace(/[\\/:*?"<>|]+/g, "_")
    .trim()
    .slice(0, 100);

// Public APIs: export CSV/XLSX from generic data
export const exportCSV = (data = [], columns, filename = "export.csv") => {
  const { rows, headers } = toRowsAndHeaders(data, columns);
  const csvText = rowsToCSV(rows, headers);
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, safeName(filename));
};

// XLSX via SheetJS (install: npm i xlsx)
export const exportXLSX = (data = [], columns, filename = "export.xlsx") => {
  // Lazy import to avoid bundling if unused
  import("xlsx").then((XLSX) => {
    const { rows, headers, keys } = toRowsAndHeaders(data, columns);
    // Keep column order and show header labels in the sheet
    const ordered = rows.map((r) =>
      keys.reduce((o, k, i) => {
        o[headers[i]] = r[k];
        return o;
      }, {})
    );
    const ws = XLSX.utils.json_to_sheet(ordered, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbArray = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const blob = new Blob([wbArray], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    downloadBlob(blob, safeName(filename));
  });
};
