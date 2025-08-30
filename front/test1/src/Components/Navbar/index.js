import { Dashboard, NavbarWithStyle, StyledNavBtn } from "./components";
import { formatLastLoginTime } from "./functions";

const Navbar = ({ navigate, onLogout, user, loginTime }) => {
  return (
    <NavbarWithStyle>
      {/* צד שמאל – ניווט */}
      <div>
        <StyledNavBtn onClick={() => navigate("home")}>Home</StyledNavBtn>
        <StyledNavBtn onClick={() => navigate("users")}>Users</StyledNavBtn>
        <StyledNavBtn onClick={() => navigate("graphs")}>Graphs</StyledNavBtn>
      </div>

      {/* צד ימין – שם + תאריך התחברות אחרונה + התנתק */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {user && (
          <div style={{ fontSize: "0.9rem", textAlign: "right" }}>
            <Dashboard />
            {user.name} <br />
            {onLogout && <StyledNavBtn onClick={onLogout}>התנתק</StyledNavBtn>}
            התחברות אחרונה: {formatLastLoginTime(loginTime)}
          </div>
        )}
      </div>
    </NavbarWithStyle>
  );
};

export default Navbar;
