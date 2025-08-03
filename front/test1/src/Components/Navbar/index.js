import { Dashboard, NavbarWithStyle, StyledNavBtn } from "./components";

// ✅ נוסיף user ו־loginTime כ־props
const Navbar = ({ navigate, onLogout, user, loginTime }) => {
  const formatNextLoginTime = () => {
    if (!loginTime) return "";
    const next = new Date(loginTime);
    next.setDate(next.getDate() + 60);
    return `${next.toLocaleDateString()} ${next.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // ✅ פורמט 24 שעות
    })}`;
  };

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
            התחברות אחרונה: {formatNextLoginTime()}
          </div>
        )}
        {onLogout && <StyledNavBtn onClick={onLogout}>התנתק</StyledNavBtn>}
      </div>
    </NavbarWithStyle>
  );
};

export default Navbar;
