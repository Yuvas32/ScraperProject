import { useEffect, useState } from "react";
const preURL = "http://localhost:3001";

const App = () => {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");

  // Optional: welcome message
  useEffect(() => {
    fetch(`${preURL}/test`)
      .then((res) => res.json())
      .then((data) => setMsg(data.message))
      .catch((err) => console.error("Error fetching message:", err));
  }, []);

  // ✅ This is where you insert the debug-friendly fetch block
  useEffect(() => {
    fetch(`${preURL}/users`)
      .then((res) => {
        console.log("Response status:", res.status); // log HTTP status
        return res.json();
      })
      .then((data) => {
        console.log("Fetched users:", data); // log the returned data
        setUsers(data); // update React state
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  return (
    <div>
      <h1>{msg || "Loading welcome message..."}</h1>

      <h2>User List:</h2>
      {users.length === 0 ? (
        <p>Loading users...</p>
      ) : (
        <ul>
          {users.map((user, idx) => (
            <li key={idx}>
              {user.name} —{" "}
              <span style={{ color: user.active ? "green" : "red" }}>
                {user.active ? "Active" : "Not Active"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default App;
