import { useEffect, useRef } from "react";
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

const UsersChart = ({ activeCount, inactiveCount }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
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
            data: [activeCount, inactiveCount],
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

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [activeCount, inactiveCount]);

  return (
    <div style={{ height: "400px" }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default UsersChart;
