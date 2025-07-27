import { useEffect, useState } from "react";
import DataTable from "./Components/DataTable";

const preURL = "http://localhost:3001";

const fetchUsers = async () => {
  const res = await fetch(`${preURL}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return await res.json();
};

const fetchWelcomeMessage = async () => {
  const res = await fetch(`${preURL}/test`);
  if (!res.ok) throw new Error("Failed to fetch welcome message");
  const data = await res.json();
  return data.message;
};

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
