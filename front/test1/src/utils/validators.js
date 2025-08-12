// src/validation/validators.js

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const IL_PHONE = /^0\d{8,9}$/;

export const validateField = (key, value, type) => {
  const k = String(key).toLowerCase();

  if (
    (value === "" || value === null || value === undefined) &&
    type !== "boolean"
  ) {
    return "שדה חובה";
  }

  if (k === "name" && String(value).trim().length < 2) {
    return "חייב להכיל לפחות 2 תווים";
  }

  if (type === "email" && value && !EMAIL.test(String(value))) {
    return "אימייל לא תקין";
  }

  if (type === "phone" && value && !IL_PHONE.test(String(value))) {
    return "טלפון לא תקין";
  }

  if (type === "number" && value !== "" && Number.isNaN(Number(value))) {
    return "מספר לא תקין";
  }

  return null;
};

export const validateAll = (values, columns, columnTypes) => {
  const errs = {};
  columns
    .filter((c) => c !== "id" && !c.includes("created_at"))
    .forEach((c) => {
      const msg = validateField(c, values[c], columnTypes[c]);
      if (msg) errs[c] = msg;
    });
  return errs;
};
