// src/components/DataTable/DataTableForm.jsx
import React from "react";
import FieldInput from "./FieldInput";

const DataTableForm = ({
  columns,
  columnTypes,
  formValues,
  errors,
  onInput,
  onSubmit,
  onCancel,
  editingId,
}) => {
  return (
    <div className="form-view">
      {columns
        .filter((col) => col !== "id" && !col.includes("created_at"))
        .map((col) => {
          const t = columnTypes[col];
          const hasError = !!errors[col];
          return (
            <div key={col} className="input-group">
              <label htmlFor={col} className="label">
                {col.replace(/_/g, " ")}
              </label>

              <FieldInput
                col={col}
                type={t}
                value={formValues[col]}
                hasError={hasError}
                onChange={(e) => onInput(e, col)}
              />

              {hasError && <div className="error-text">{errors[col]}</div>}
            </div>
          );
        })}

      <div style={{ display: "flex", gap: 8 }}>
        <button className="button" onClick={onSubmit}>
          {editingId ? "עדכן" : "שלח"}
        </button>
        <button className="button" onClick={onCancel} type="button">
          בטל
        </button>
      </div>
    </div>
  );
};

export default DataTableForm;
