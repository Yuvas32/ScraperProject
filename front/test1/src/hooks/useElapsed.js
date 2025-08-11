// front/src/hooks/useElapsed.js
import { useState, useEffect } from "react";

/**
 * Custom hook to track elapsed time and estimate ETA
 * @param {boolean} active - Whether the timer is running
 * @param {number|null} avgMs - Average duration (ms) for estimating ETA
 * @returns {{ elapsedMs: number, etaMs: number|null }}
 */
const useElapsed = (active, avgMs = null) => {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!active) {
      setElapsedMs(0);
      return;
    }
    const start = performance.now();
    const interval = setInterval(() => {
      setElapsedMs(performance.now() - start);
    }, 100);

    return () => clearInterval(interval);
  }, [active]);

  const etaMs =
    active && avgMs != null && avgMs > 0
      ? Math.max(avgMs - elapsedMs, 0)
      : null;

  return { elapsedMs, etaMs };
};
export default useElapsed;
