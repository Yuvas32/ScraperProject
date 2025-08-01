export const formatValue = (key, value) => {
  if (key === "active") {
    return (
      <span className={value ? "active" : "inactive"}>
        {value ? "Active" : "Not Active"}
      </span>
    );
  }

  if (
    key.includes("date") ||
    key.includes("created_at") ||
    key.includes("updated_at")
  ) {
    const parsed = new Date(value);
    if (isNaN(parsed)) return "—";
    return parsed.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return value;
};
