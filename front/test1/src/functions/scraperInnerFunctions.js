export const fmtDate = (yyyymmdd) => {
  if (!yyyymmdd || yyyymmdd.length !== 8) return "Unknown date";
  const y = yyyymmdd.slice(0, 4);
  const m = yyyymmdd.slice(4, 6);
  const d = yyyymmdd.slice(6, 8);
  return `${d}/${m}/${y}`;
};

// Build the same nice paragraph on the client (fallback if backend didn't send one)
export const makeScraperSummary = (meta) => {
  const title = meta?.title || "Untitled video";
  const date = fmtDate(meta?.upload_date);
  const duration = Number.isFinite(meta?.duration) ? meta.duration : 0;
  const tags =
    Array.isArray(meta?.tags) && meta.tags.length
      ? meta.tags.join(", ")
      : "No tags";
  const categories =
    Array.isArray(meta?.categories) && meta.categories.length
      ? meta.categories.join(", ")
      : "No categories";

  // Extra info fields
  const extras = [];
  if (meta?.width && meta?.height)
    extras.push(`Resolution: ${meta.width}×${meta.height}`);
  if (meta?.uploader) extras.push(`Uploader: ${meta.uploader}`);
  if (Number.isFinite(meta?.view_count))
    extras.push(`Views: ${meta.view_count.toLocaleString()}`);
  if (Number.isFinite(meta?.like_count))
    extras.push(`Likes: ${meta.like_count.toLocaleString()}`);

  const extraInfo = extras.length ? extras.join(" | ") : null;

  return (
    <div>
      <strong>Video:</strong> "{title}"<br />
      <strong>Published on:</strong> {date}
      <br />
      <strong>Duration:</strong> {duration} seconds
      <br />
      <strong>Categories:</strong> {categories}
      <br />
      <strong>Tags:</strong> {tags}
      <br />
      {extraInfo && (
        <div>
          <strong>Extra info:</strong> {extraInfo}
        </div>
      )}
    </div>
  );
};

/* ---------- helpers ---------- */
export const computeExtraInfo = (meta) => {
  const parts = [];
  if (meta?.width && meta?.height)
    parts.push(`Resolution: ${meta.width}×${meta.height}`);
  if (meta?.uploader) parts.push(`Uploader: ${meta.uploader}`);
  if (Number.isFinite(meta?.view_count))
    parts.push(`Views: ${meta.view_count.toLocaleString()}`);
  if (Number.isFinite(meta?.like_count))
    parts.push(`Likes: ${meta.like_count.toLocaleString()}`);
  return parts.length ? parts.join(" | ") : null;
};

// Build JSX locally (when backend doesn't send a summary)
export const buildSummaryJSX = (meta) => {
  const title = meta?.title || "Untitled video";
  const date = fmtDate(meta?.upload_date);
  const duration = Number.isFinite(meta?.duration) ? meta.duration : 0;
  const tags =
    Array.isArray(meta?.tags) && meta.tags.length
      ? meta.tags.join(", ")
      : "No tags";
  const categories =
    Array.isArray(meta?.categories) && meta.categories.length
      ? meta.categories.join(", ")
      : "No categories";
  const extraInfo = computeExtraInfo(meta);

  return (
    <div>
      <strong>Video:</strong> "{title}"<br />
      <strong>Published on:</strong> {date}
      <br />
      <strong>Duration:</strong> {duration} seconds
      <br />
      <strong>Categories:</strong> {categories}
      <br />
      <strong>Tags:</strong> {tags}
      <br />
      {extraInfo && (
        <div>
          <strong>Extra info:</strong> {extraInfo}
        </div>
      )}
    </div>
  );
};

// Turn any backend summary (object/string) into JSX safely
export const summaryToJSX = (summary, metaFallback) => {
  if (!summary) return buildSummaryJSX(metaFallback);
  if (typeof summary === "string") return <div>{summary}</div>;
  if (typeof summary === "object" && (summary.text || summary.extraInfo)) {
    return (
      <div>
        {summary.text && <div>{summary.text}</div>}
        {summary.extraInfo && (
          <div>
            <strong>Extra info:</strong> {summary.extraInfo}
          </div>
        )}
      </div>
    );
  }
  // unknown shape → build locally
  return buildSummaryJSX(metaFallback);
};

export const downloadVideoBlob = async ({ url, title }) => {
  const res = await fetch("http://localhost:3001/scrape/download", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "video/*" },
    body: JSON.stringify({ url, title }),
  });
  if (!res.ok) {
    // Try to parse error JSON if any
    let msg = `Download failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
  const blob = await res.blob();
  return blob;
};

/* ---------- Local helpers for export ---------- */
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

export const rowsToCSV = (rows, headers) => {
  const toCell = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => toCell(r[h])).join(",")),
  ];
  // UTF‑8 BOM so Excel opens it correctly
  return "\uFEFF" + lines.join("\n");
};

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

export const safeName = (s = "video") => {
  s.replace(/[\\/:*?"<>|]+/g, "_")
    .trim()
    .slice(0, 100);
};
