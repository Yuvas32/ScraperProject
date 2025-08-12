// front/src/components/SummaryPanel.js
import React from "react";

/**
 * SummaryPanel
 * Simple container for displaying summary JSX or other content.
 */
const SummaryPanel = ({ children }) => {
  if (!children) return null;

  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        background: "#f8f9fa",
        border: "1px solid #ccc",
        borderRadius: 4,
        fontSize: 14,
        lineHeight: 1.4,
      }}
    >
      {children}
    </div>
  );
};

export default SummaryPanel;
