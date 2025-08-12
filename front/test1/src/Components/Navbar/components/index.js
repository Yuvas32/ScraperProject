import { getGreeting } from "../functions";

export const NavbarWithStyle = ({ children }) => (
  <nav
    style={{
      width: "100%",
      backgroundColor: "#2c3e50",
      color: "white",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxSizing: "border-box",
    }}
  >
    {children}
  </nav>
);

export const Dashboard = () => (
  <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{getGreeting()}</div>
);

export const StyledNavBtn = ({ children, onClick }) => (
  <button
    onClick={onClick}
    style={{
      marginRight: "10px",
      padding: "0.5rem 1rem",
      backgroundColor: "#34495e",
      border: "none",
      borderRadius: "5px",
      color: "white",
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);
