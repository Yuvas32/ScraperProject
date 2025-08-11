import * as XLSX from "xlsx";
import {
  buildExportRow,
  rowsToCSV,
  downloadBlob,
  safeName,
} from "../functions/exportUtils";

/**
 * Shows two buttons: Export CSV and Export XLSX
 * Props:
 *  - meta: the scraped metadata object (required)
 */
const ExportButtons = ({ meta }) => {
  if (!meta) return null;

  // 1 row for this single video
  const row = buildExportRow(meta);

  // Use the same ordered headers for CSV and XLSX
  const headers = [
    "source_url",
    "title",
    "uploader",
    "upload_date",
    "duration_seconds",
    "categories",
    "tags",
    "view_count",
    "like_count",
    "width",
    "height",
    "fps",
    "format",
    "webpage_url",
  ];

  const onExportCSV = () => {
    const csv = rowsToCSV([row], headers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const base = safeName(meta.title || "video");
    downloadBlob(blob, `${base}.csv`);
  };

  const onExportXLSX = () => {
    // Make a worksheet with a header row in the order we want
    const data = [headers, headers.map((h) => row[h] ?? "")];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Video");

    // Generate an ArrayBuffer and turn into a Blob
    const ab = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([ab], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const base = safeName(meta.title || "video");
    downloadBlob(blob, `${base}.xlsx`);
  };

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <button type="button" onClick={onExportCSV}>
        Export CSV
      </button>
      <button type="button" onClick={onExportXLSX}>
        Export XLSX
      </button>
    </div>
  );
};

export default ExportButtons;
