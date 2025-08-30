const preURL = "http://localhost:3001";

/**
 * שולף את כל המשתמשים ומחלק אותם לרשימות של פעילים ולא פעילים.
 *
 * @async
 * @function fetchUsersByStatus
 * @returns {Promise<{active: Array<User>, inactive: Array<User>}>}
 *          active   - מערך משתמשים שהשדה active שלהם true
 *          inactive - מערך משתמשים שהשדה active שלהם false
 *
 * @throws {Error} אם הבקשה נכשלה או שהשרת החזיר שגיאה.
 *
 * @example
 * const { active, inactive } = await fetchUsersByStatus();
 * console.log("פעילים:", active.length, "לא פעילים:", inactive.length);
 */
export const fetchUsersByStatus = async () => {
  const res = await fetch(`${preURL}/users`);
  if (!res.ok) throw new Error("שגיאה בשליפת משתמשים");

  const users = await res.json();
  const active = users.filter((u) => u.active);
  const inactive = users.filter((u) => !u.active);

  return { active, inactive };
};

/**
 * שולף את כל המשתמשים מהשרת, עם כותרת (header) של role אם נשמר ב־localStorage.
 *
 * @async
 * @function fetchUsers
 * @returns {Promise<Array<User>>} מערך של אובייקטי משתמש
 *
 * @throws {Error} אם הבקשה נכשלה או שהשרת החזיר שגיאה.
 *
 * @example
 * const users = await fetchUsers();
 * console.log("סה״כ משתמשים:", users.length);
 */
export const fetchUsers = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const res = await fetch(`${preURL}/users`, {
    headers: {
      "x-user-role": user.role || "",
    },
  });

  if (!res.ok) throw new Error("שגיאה בשליפת משתמשים");
  return await res.json();
};

/**
 * שולף הודעת ברוך הבא/בדיקה מהשרת.
 *
 * @async
 * @function fetchWelcomeMessage
 * @returns {Promise<string>} מחרוזת עם הודעת ברוך הבא
 *
 * @throws {Error} אם הבקשה נכשלה או שהשרת החזיר שגיאה.
 *
 * @example
 * const message = await fetchWelcomeMessage();
 * console.log(message); // למשל: "ברוך הבא למערכת!"
 */
export const fetchWelcomeMessage = async () => {
  const res = await fetch(`${preURL}/test`);
  if (!res.ok) throw new Error("שגיאה בשליפת הודעת ברוך הבא");
  const data = await res.json();
  return data.message;
};

/**
 * @typedef {Object} User
 * @property {number|string} id     מזהה ייחודי של המשתמש
 * @property {string} name          שם המשתמש
 * @property {string} [role]        תפקיד המשתמש (לא חובה)
 * @property {boolean} active       האם המשתמש פעיל
 * @property {string} [created_at]  תאריך יצירה בפורמט ISO
 */
