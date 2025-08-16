import { Dashboard, NavbarWithStyle, StyledNavBtn } from "./components";
import { formatLastLoginTime } from "./functions";

const Navbar = ({ navigate, onLogout, user, loginTime }) => {
  return (
    <NavbarWithStyle>
      {/* צד שמאל – ניווט */}
      <div>
        <StyledNavBtn onClick={() => navigate("home")}>Home</StyledNavBtn>
        <StyledNavBtn onClick={() => navigate("users")}>Users</StyledNavBtn>
      </div>

      {/* אמצע – ברכת שלום */}
      <Dashboard />

      {/* צד ימין – שם + תאריך התחברות אחרונה + התנתק */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {user && (
          <div style={{ fontSize: "0.9rem", textAlign: "right" }}>
            {user.name} <br />
            התחברות אחרונה: {formatLastLoginTime(loginTime)}
          </div>
        )}
        {onLogout && <StyledNavBtn onClick={onLogout}>התנתק</StyledNavBtn>}
      </div>
    </NavbarWithStyle>
  );
};

export default Navbar;
