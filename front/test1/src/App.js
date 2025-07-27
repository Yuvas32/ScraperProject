import { useEffect, useState } from "react";
import { DataTable, Navbar, Footer } from "./components";
import { fetchUsers, fetchWelcomeMessage } from "./functions";

const App = () => {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchWelcomeMessage()
      .then(setMsg)
      .catch((err) => console.error("Error fetching message:", err));
  }, []);

  useEffect(() => {
    fetchUsers()
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  return (
    <>
      <Navbar />
      <div className="center-wrapper">
        <div className="center-content">
          <h1>{msg || "Loading welcome message..."}</h1>
          <DataTable
            data={users}
            title="User Table"
            refresh={() =>
              fetchUsers()
                .then(setUsers)
                .catch((err) =>
                  console.error("Failed to refresh after add:", err)
                )
            }
            add={async (newUser) => {
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
            }}
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default App;
