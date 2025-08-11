// front/src/components/ActionBar.js
import React from "react";

/**
 * ActionBar
 * Buttons for scraping, saving, downloading, and any other actions.
 */
const ActionBar = ({
  url,
  busy,
  saving,
  downloading,
  canSave,
  canDownload,
  onGetMeta,
  onSave,
  onDownload,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginTop: 8,
        marginBottom: 8,
        flexWrap: "wrap",
      }}
    >
      <button
        type="submit"
        disabled={!url || busy || saving || downloading}
        style={{
          padding: "8px 12px",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: busy || saving || downloading ? "not-allowed" : "pointer",
        }}
        onClick={onGetMeta}
      >
        {busy ? "Fetching…" : "Get Metadata"}
      </button>

      <button
        type="button"
        disabled={!canSave}
        style={{
          padding: "8px 12px",
          background: canSave ? "#28a745" : "#6c757d",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: canSave ? "pointer" : "not-allowed",
        }}
        onClick={onSave}
      >
        {saving ? "Saving…" : "Save"}
      </button>

      <button
        type="button"
        disabled={!canDownload}
        style={{
          padding: "8px 12px",
          background: canDownload ? "#17a2b8" : "#6c757d",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: canDownload ? "pointer" : "not-allowed",
        }}
        onClick={onDownload}
      >
        {downloading ? "Downloading…" : "Download"}
      </button>
    </div>
  );
};

export default ActionBar;
