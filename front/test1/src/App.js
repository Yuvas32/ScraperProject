import { useEffect, useState } from "react";
import { DataTable } from "./components";
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
      .then((data) => {
        console.log("Fetched users:", data);
        setUsers(data);
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  return (
    <div className="center-wrapper">
      <div className="center-content">
        <h1>{msg || "Loading welcome message..."}</h1>
        <DataTable data={users} title="User Table" />
      </div>
    </div>
  );
};

export default App;
