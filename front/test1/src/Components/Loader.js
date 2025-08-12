// front/src/components/Loader.js
import React from "react";

/**
 * Loader
 * A simple inline spinner component, useful for buttons or small areas.
 */
const Loader = ({ size = 24, color = "#333" }) => {
  const spinnerStyle = {
    width: size,
    height: size,
    border: `${Math.max(2, size / 8)}px solid ${color}33`, // lighter border for background
    borderTop: `${Math.max(2, size / 8)}px solid ${color}`, // solid color for the animated part
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  return <div style={spinnerStyle} />;
};

// Add keyframes globally for the spinner
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  styleSheet.insertRule(
    `@keyframes spin {
      to { transform: rotate(360deg); }
    }`,
    styleSheet.cssRules.length
  );
}

export default Loader;
