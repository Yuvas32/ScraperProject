// === Helpers: infer field types & normalize values ===
export const isNumberLike = (v) =>
  typeof v === "number" || /^-?\d+(\.\d+)?$/.test(String(v));
export const isIntegerLike = (v) => /^-?\d+$/.test(String(v));
export const isISODateLike = (v) => !Number.isNaN(Date.parse(v));

export const inferType = (col, val) => {
  const name = String(col || "").toLowerCase();

  // name-based hints
  if (name === "id" || name.endsWith("_id")) return "number";
  if (name.includes("email")) return "email";
  if (name.includes("phone") || name.includes("tel")) return "phone";
  if (name.includes("url") || name.includes("link")) return "url";
  if (name.includes("date") || name.endsWith("_at")) return "date";
  if (name.startsWith("is_") || name.includes("active")) return "boolean";
  if (name.includes("notes") || name.includes("description")) return "textarea";

  // value-based hints
  if (typeof val === "boolean") return "boolean";
  if (isISODateLike(val)) return "date";
  if (isIntegerLike(val)) return "number";
  if (isNumberLike(val)) return "number";

  // default
  return "text";
};

export const buildColumnTypes = (rows) => {
  if (!rows || !rows.length) return {};
  const sample = rows[0];
  return Object.keys(sample).reduce((acc, key) => {
    acc[key] = inferType(key, sample[key]);
    return acc;
  }, {});
};

export const normalizeOut = (type, raw) => {
  if (type === "number") return raw === "" ? "" : Number(raw);
  if (type === "boolean") return !!raw;
  // date/email/url/phone/text/textarea stay as strings
  return raw;
};

export const normalizeInForInput = (type, raw) => {
  if (raw == null) return "";
  if (type === "date") {
    // ensure YYYY-MM-DD for <input type="date">
    const s = String(raw);
    if (s.length >= 10) return s.slice(0, 10);
  }
  if (type === "boolean") return !!raw;
  return raw;
};
