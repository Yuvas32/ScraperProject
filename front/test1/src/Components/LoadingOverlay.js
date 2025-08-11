// front/src/components/LoadingOverlay.jsx
import React from "react";

/**
 * LoadingOverlay
 * Displays a fullscreen (or container-covering) overlay with a spinner,
 * an optional message, elapsed time, and ETA.
 */
const LoadingOverlay = ({ show, message, elapsedMs, etaMs }) => {
  if (!show) return null;

  // Format milliseconds to mm:ss
  const formatTime = (ms) => {
    if (ms == null) return "";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <div style={styles.spinner} />
        <div style={styles.message}>{message || "Loading..."}</div>
        {(elapsedMs != null || etaMs != null) && (
          <div style={styles.timer}>
            {elapsedMs != null && <span>Elapsed: {formatTime(elapsedMs)}</span>}
            {etaMs != null && (
              <span style={{ marginLeft: 8 }}>ETA: {formatTime(etaMs)}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    background: "#fff",
    padding: "20px 30px",
    borderRadius: 8,
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  spinner: {
    margin: "0 auto 10px",
    width: 40,
    height: 40,
    border: "4px solid #ccc",
    borderTop: "4px solid #333",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  message: {
    fontSize: "16px",
    fontWeight: "bold",
  },
  timer: {
    marginTop: 8,
    fontSize: "14px",
    color: "#555",
  },
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

export default LoadingOverlay;
