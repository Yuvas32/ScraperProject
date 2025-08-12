export const getGreeting = () => {
  const now = new Date();
  const israelHour = now.getUTCHours() + 3;
  const msgTimeStamp =
    israelHour < 12 ? "בוקר" : israelHour < 17 ? "צהריים" : "ערב";

  return msgTimeStamp !== "צהריים"
    ? `!${msgTimeStamp} טוב`
    : `!${msgTimeStamp} טובים`;
};

// ✅ פונקציה חדשה להצגת תאריך בפורמט DD/MM/YYYY HH:MM
export const formatLastLoginTime = (loginTime) => {
  if (!loginTime) return "";

  const last = new Date(loginTime);

  const day = String(last.getDate()).padStart(2, "0");
  const month = String(last.getMonth() + 1).padStart(2, "0"); // חודשים מ-0 עד 11
  const year = last.getFullYear();
  const hours = String(last.getHours()).padStart(2, "0");
  const minutes = String(last.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
