const NavbarWithStyle = ({ children }) => (
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

const getGreeting = () => {
  const now = new Date();

  // ישראל היא UTC+3 (גם בקיץ)
  const israelHour = now.getUTCHours() + 3;
  const msgTimeStamp =
    israelHour < 12 ? "בוקר" : israelHour < 17 ? "צהריים" : "ערב";

  return msgTimeStamp !== "צהריים"
    ? `${msgTimeStamp} טוב`
    : `${msgTimeStamp} טובים`;
};

const Dashboard = () => (
  <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{getGreeting()}</div>
);

const StyledNavBtn = ({ children, onClick }) => (
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

const Navbar = ({ navigate }) => {
  return (
    <NavbarWithStyle>
      <div>
        <StyledNavBtn onClick={() => navigate("home")}>Home</StyledNavBtn>
        <StyledNavBtn onClick={() => navigate("users")}>Users</StyledNavBtn>
      </div>
      <Dashboard />
    </NavbarWithStyle>
  );
};

export default Navbar;
