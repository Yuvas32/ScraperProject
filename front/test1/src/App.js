import { useState, useEffect } from "react";
import { HomePage, UsersPage, LoginPage, GraphsPage } from "./pages";
import { Footer, Navbar } from "./components";

const App = () => {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [loginTime, setLoginTime] = useState(null);

  // קריאה מ-localStorage בהעלאה
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    const savedLoginTime = localStorage.getItem("loginTime");

    if (savedUser && savedLoginTime) {
      const expireAt = new Date(savedLoginTime);
      expireAt.setDate(expireAt.getDate() + 60);

      if (new Date() < expireAt) {
        setUser(savedUser);
        setLoginTime(new Date(savedLoginTime));
      } else {
        localStorage.clear();
      }
    }

    const path = window.location.pathname.replace("/", "");
    setPage(path || "home");
  }, []);

  const handleLogin = (userData) => {
    const now = new Date();
    setUser(userData);
    setLoginTime(now);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("loginTime", now.toISOString());
  };

  const handleLogout = () => {
    setUser(null);
    setLoginTime(null);
    localStorage.clear();
  };

  const navigate = (targetPage) => {
    setPage(targetPage);
    window.history.pushState(
      {},
      "",
      `/${targetPage === "home" ? "" : targetPage}`
    );
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <>
      <Navbar
        navigate={navigate}
        onLogout={handleLogout}
        user={user}
        loginTime={loginTime}
      />
      {page === "home" && <HomePage />}
      {page === "users" && <UsersPage />}
      {page === "graphs" && <GraphsPage />}
      <Footer />
    </>
  );
};

export default App;
