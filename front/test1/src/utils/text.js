/* ---------- tiny helpers ---------- */
export const hostOf = (u) => {
  try {
    return new URL(u).host.replace(/^www\./, "");
  } catch {
    return "";
  }
};
export const truncate = (s, n = 70) =>
  s && s.length > n ? s.slice(0, n - 1) + "… " : s || "-";
