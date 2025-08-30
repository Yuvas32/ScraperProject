import { useEffect, useState } from "react";
import { fetchUsersByStatus } from "../functions";
import { UserChart, UsersList } from "../containers";

const GraphsPage = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);

  useEffect(() => {
    fetchUsersByStatus()
      .then(({ active, inactive }) => {
        setActiveUsers(active);
        setInactiveUsers(inactive);
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  return (
    <div style={{ width: "600px", margin: "auto" }}>
      <UserChart
        activeCount={activeUsers.length}
        inactiveCount={inactiveUsers.length}
      />
      <UsersList activeUsers={activeUsers} inactiveUsers={inactiveUsers} />
    </div>
  );
};

export default GraphsPage;
