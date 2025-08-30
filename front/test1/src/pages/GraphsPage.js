import { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PieController,
  DoughnutController,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PieController,
  DoughnutController
);

const GraphsPage = () => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const [activeUsers, setActiveUsers] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);

  useEffect(() => {
    let isMounted = true;

    fetch("http://localhost:3001/users")
      .then((res) => res.json())
      .then((users) => {
        if (!isMounted) return;

        const active = users.filter((u) => u.active);
        const inactive = users.filter((u) => !u.active);

        setActiveUsers(active);
        setInactiveUsers(inactive);

        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        if (chartRef.current) {
          chartRef.current.destroy();
        }

        chartRef.current = new ChartJS(ctx, {
          type: "doughnut",
          data: {
            labels: ["Active", "Inactive"],
            datasets: [
              {
                data: [active.length, inactive.length],
                backgroundColor: ["#4bc0c0", "#ff6384"],
                borderColor: ["#fff", "#fff"],
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "bottom" },
              title: {
                display: true,
                text: "Active vs Inactive Users",
                font: { size: 18 },
              },
            },
          },
        });
      })
      .catch((err) => console.error("Error fetching users:", err));

    return () => {
      isMounted = false;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ width: "600px", margin: "auto" }}>
      {/* Chart */}
      <div style={{ height: "400px" }}>
        <canvas ref={canvasRef} />
      </div>

      {/* Summary List */}
      <div style={{ marginTop: "20px", fontSize: "16px" }}>
        <div style={{ marginBottom: "15px" }}>
          <p style={{ color: "#4bc0c0", fontWeight: "bold" }}>
            Active ({activeUsers.length}):
          </p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {activeUsers.map((user) => (
              <li key={user.id} style={{ margin: "4px 0" }}>
                {user.name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p style={{ color: "#ff6384", fontWeight: "bold" }}>
            Not Active ({inactiveUsers.length}):
          </p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {inactiveUsers.map((user) => (
              <li key={user.id} style={{ margin: "4px 0" }}>
                {user.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GraphsPage;
