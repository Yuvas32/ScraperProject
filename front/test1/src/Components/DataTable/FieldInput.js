// src/components/DataTable/FieldInput.jsx
import React from "react";
import { htmlTypeFor, normalizeInForInput } from "../../utils/fieldTypes";

const FieldInput = ({ col, type, value, onChange, hasError }) => {
  const common = {
    id: col,
    className: `input ${hasError ? "input-error" : ""}`,
    onChange,
  };

  if (col.toLowerCase() === "role") {
    return (
      <select {...common} value={value || ""}>
        <option value="">בחר תפקיד</option>
        <option value="admin">מנהל</option>
        <option value="user">רגיל</option>
      </select>
    );
  }

  if (type === "boolean") {
    return (
      <input
        type="checkbox"
        id={col}
        checked={!!normalizeInForInput("boolean", value)}
        onChange={onChange}
      />
    );
  }

  if (type === "textarea") {
    return (
      <textarea
        {...common}
        rows={3}
        value={normalizeInForInput("text", value)}
      />
    );
  }

  return (
    <input
      {...common}
      type={htmlTypeFor(type)}
      value={normalizeInForInput(type, value)}
      // optional UX helpers
      step={type === "number" ? "any" : undefined}
      pattern={type === "phone" ? "^0\\d{8,9}$" : undefined}
    />
  );
};

export default FieldInput;
