import { useEffect, useState } from "react";
import { DataTable } from "../components";
import { fetchUsers } from "../functions";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetchUsers()
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);
  const addUser = async (newUser) => {
    const res = await fetch("http://localhost:3001/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    const createdUser = await res.json();

    // ✅ Immediately refresh the table data from DB
    try {
      const fresh = await fetchUsers();
      setUsers(fresh);
    } catch (err) {
      console.error("Refresh failed after add", err);
    }

    return createdUser;
  };
  const refreshUsers = () =>
    fetchUsers()
      .then(setUsers)
      .catch((err) => console.error("Failed to refresh after add:", err));
  return (
    <DataTable
      data={users}
      title="משתמשים"
      refresh={refreshUsers}
      add={addUser}
    />
  );
};
export default UsersPage;
