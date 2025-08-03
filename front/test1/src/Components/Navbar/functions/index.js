export const getGreeting = () => {
  const now = new Date();
  const israelHour = now.getUTCHours() + 3;
  const msgTimeStamp =
    israelHour < 12 ? "בוקר" : israelHour < 17 ? "צהריים" : "ערב";

  return msgTimeStamp !== "צהריים"
    ? `!${msgTimeStamp} טוב`
    : `!${msgTimeStamp} טובים`;
};
