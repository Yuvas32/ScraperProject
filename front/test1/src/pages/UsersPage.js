import { useEffect, useState } from "react";
import { DataTable } from "../components";
import { fetchUsers } from "../functions";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // שליפת משתמש מחובר מ-localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

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
      .then((list) => {
        setUsers(list); // update page state
        return list; // <-- return to DataTable so it can setTableData(list)
      })
      .catch((err) => console.error("Failed to refresh after add:", err));

  const isAdmin = currentUser?.role === "admin";

  // Format values only in the exported files (not on-screen)
  const exportUserRow = (u) => ({
    ...u,
    active: u.active ? "פעיל" : "לא פעיל",
    // example date prettifier (if your created_at is ISO):
    // created_at: new Date(u.created_at).toLocaleDateString('he-IL'),
  });

  return (
    <>
      <DataTable
        data={users}
        tableName="users"
        title="משתמשים"
        refresh={refreshUsers}
        add={isAdmin ? addUser : null}
        deleteItem={isAdmin}
        edit={isAdmin}
        exportable
        exportFileBase="users" // file base name: users.csv / users.xlsx
        exportTransform={exportUserRow} // optional: formats only the exported data
      />

      {!isAdmin && (
        <p style={{ textAlign: "center", color: "#666", marginTop: "1rem" }}>
          אין לך הרשאה לערוך את הטבלה
        </p>
      )}
    </>
  );
};

export default UsersPage;
