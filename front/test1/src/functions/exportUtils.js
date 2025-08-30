/**
 * ממיר מערך של שורות (אובייקטים) לטקסט CSV עם BOM בתחילת הקובץ (כדי ש-Excel יזהה UTF-8).
 *
 * @function rowsToCSV
 * @param {Array<Object>} rows   מערך שורות לייצוא
 * @param {Array<string>} headers מערך שמות העמודות (Keys מתוך האובייקטים)
 * @returns {string} מחרוזת CSV מוכנה להורדה/שמירה
 *
 * @example
 * const rows = [{ name: "דני", age: 30 }, { name: "רונה", age: 25 }];
 * const csv = rowsToCSV(rows, ["name", "age"]);
 * console.log(csv);
 */
export const rowsToCSV = (rows, headers) => {
  const toCell = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    // אם יש תו שדורש ציטוט → מוסיפים מרכאות ומכפילים מרכאות פנימיות
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.join(","), // שורת כותרות
    ...rows.map((r) => headers.map((h) => toCell(r[h])).join(",")),
  ];
  // מוסיפים BOM כדי ש-Excel יזהה את הקובץ כ-UTF-8
  return "\uFEFF" + lines.join("\n");
};

/**
 * מפעיל הורדה של Blob (למשל CSV או וידאו) בדפדפן.
 *
 * @function downloadBlob
 * @param {Blob} blob       קובץ Blob שנרצה להוריד
 * @param {string} filename שם הקובץ לשמירה במחשב
 *
 * @example
 * const blob = new Blob(["hello world"], { type: "text/plain" });
 * downloadBlob(blob, "greeting.txt");
 */
export const downloadBlob = (blob, filename) => {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/**
 * מנקה שם קובץ מתווים אסורים במערכת קבצים (כמו \ / : * ? " < > |).
 * בנוסף חותך שמות ארוכים ל-100 תווים.
 *
 * @function safeName
 * @param {string} [s="video"] שם קובץ גולמי
 * @returns {string} שם קובץ תקין ובטוח לשימוש
 *
 * @example
 * const name = safeName("my:bad*file?.mp4");
 * console.log(name); // "my_bad_file_.mp4"
 */
export const safeName = (s = "video") =>
  s
    .replace(/[\\/:*?"<>|]+/g, "_")
    .trim()
    .slice(0, 100);
