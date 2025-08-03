const preURL = "http://localhost:3001";

export const fetchUsers = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const res = await fetch(`${preURL}/users`, {
    headers: {
      "x-user-role": user.role || "",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch users");
  return await res.json();
};

export const fetchWelcomeMessage = async () => {
  const res = await fetch(`${preURL}/test`);
  if (!res.ok) throw new Error("Failed to fetch welcome message");
  const data = await res.json();
  return data.message;
};
