import { useEffect, useState } from "react";
import { fetchWelcomeMessage } from "../functions";
const HomePage = () => {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchWelcomeMessage()
      .then(setMsg)
      .catch((err) => console.error("Error fetching message:", err));
  }, []);

  return (
    <>
      <div className="center-wrapper">
        <div className="center-content">
          <h1>{msg || "Loading welcome message..."}</h1>
        </div>
      </div>
    </>
  );
};
export default HomePage;
