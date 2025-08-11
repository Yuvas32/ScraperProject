// Build a stable export row from a meta object
export const buildExportRow = (meta = {}) => {
  const arrOrNull = (a) => (Array.isArray(a) && a.length ? a.join("; ") : null);

  return {
    source_url: meta.source_url ?? null,
    title: meta.title ?? null,
    uploader: meta.uploader ?? null,
    upload_date: meta.upload_date ?? null, // YYYYMMDD
    duration_seconds: Number.isFinite(meta.duration) ? meta.duration : 0,
    categories: arrOrNull(meta.categories),
    tags: arrOrNull(meta.tags),
    view_count: meta.view_count ?? null,
    like_count: meta.like_count ?? null,
    width: meta.width ?? null,
    height: meta.height ?? null,
    fps: meta.fps ?? null,
    format: meta.format ?? null,
    webpage_url: meta.webpage_url ?? null,
  };
};

// Convert rows → CSV text with a UTF‑8 BOM (Excel-friendly)
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
  // BOM so Excel detects UTF‑8 correctly
  return "\uFEFF" + lines.join("\n");
};

// Trigger a download for a Blob
export const downloadBlob = (blob, filename) => {
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
export const safeName = (s = "video") =>
  s
    .replace(/[\\/:*?"<>|]+/g, "_")
    .trim()
    .slice(0, 100);
