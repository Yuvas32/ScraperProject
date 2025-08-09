// src/utils/validation.js

// ---- Common patterns
export const patterns = {
  ilPhone: /^0\d{8,9}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// ---- Type inference
const isNumberLike = (val) =>
  typeof val === "number" || /^-?\d+(\.\d+)?$/.test(String(val));

const isDateLike = (val) => {
  const d = Date.parse(val);
  return !Number.isNaN(d);
};

export const inferType = (col, sample) => {
  const name = String(col || "").toLowerCase();
  if (name.includes("email")) return "email";
  if (name.includes("phone") || name.includes("tel")) return "phone";
  if (name.includes("date") || name.endsWith("_at") || name.endsWith("date"))
    return "date";
  if (name === "id" || name.endsWith("_id")) return "id";
  if (name.includes("active") || name.startsWith("is_")) return "boolean";
  if (isNumberLike(sample)) return "number";
  return "string";
};

// ---- Input type for <input type=...>
export const getInputType = (col, rules = {}, sample) => {
  const ruleType = rules[col]?.type;
  const t = ruleType || inferType(col, sample);
  if (t === "email") return "email";
  if (t === "number") return "number";
  if (t === "date") return "date";
  return "text";
};

// ---- Field validation
export const validateField = (
  key,
  value,
  { rules = {}, tableSample = {} } = {}
) => {
  const rule = rules[key] || {};
  const detectedType = rule.type || inferType(key, tableSample[key]);
  const msg = (m) => ({ [key]: m });

  // required
  if (
    rule.required &&
    (value === undefined || value === null || String(value).trim() === "")
  ) {
    return msg("שדה חובה");
  }

  // type-based checks
  if (detectedType === "email" || rule.email) {
    if (value && !patterns.email.test(String(value)))
      return msg("אימייל לא תקין");
  }

  if (detectedType === "number") {
    if (value !== "" && !isNumberLike(value)) return msg("מספר לא תקין");
    const num = Number(value);
    if (rule.min !== undefined && num < rule.min)
      return msg(`מינימום ${rule.min}`);
    if (rule.max !== undefined && num > rule.max)
      return msg(`מקסימום ${rule.max}`);
  }

  if (detectedType === "date") {
    if (value && !isDateLike(value)) return msg("תאריך לא תקין");
  }

  if ((detectedType === "phone" || rule.phone) && value) {
    if (!patterns.ilPhone.test(String(value))) return msg("טלפון לא תקין");
  }

  // generic string length
  if (
    rule.min !== undefined &&
    detectedType === "string" &&
    String(value).length < rule.min
  ) {
    return msg(`לפחות ${rule.min} תווים`);
  }
  if (
    rule.max !== undefined &&
    detectedType === "string" &&
    String(value).length > rule.max
  ) {
    return msg(`עד ${rule.max} תווים`);
  }

  if (rule.pattern && value && !rule.pattern.test(String(value))) {
    return msg("פורמט לא תקין");
  }

  return {};
};

// ---- Form validation
export const validateAll = (values, { rules = {}, tableSample = {} } = {}) => {
  const nextErrors = {};
  Object.keys(values || {}).forEach((k) => {
    Object.assign(
      nextErrors,
      validateField(k, values[k], { rules, tableSample })
    );
  });
  return nextErrors;
};

export const isFormValid = (errs) => !errs || Object.keys(errs).length === 0;

// ---- Touch helpers
export const markAllTouched = (values) =>
  Object.keys(values || {}).reduce((acc, k) => ((acc[k] = true), acc), {});

// ---- (Optional) build a default rules object from columns
export const buildRulesFromColumns = (columns = [], sampleRow = {}) => {
  const rules = {};
  columns.forEach((col) => {
    if (col === "id" || col.includes("created_at")) return;
    const t = inferType(col, sampleRow[col]);
    rules[col] = { type: t };
    if (["name", "email"].includes(col)) rules[col].required = true;
  });
  return rules;
};
