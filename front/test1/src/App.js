import { useState, useEffect } from "react";
import { HomePage, UsersPage } from "./pages";
import { Navbar, Footer } from "./components";

const App = () => {
  const [page, setPage] = useState("home");

  // קביעת העמוד לפי URL בזמן טעינה
  useEffect(() => {
    const path = window.location.pathname.replace("/", "");
    setPage(path || "home");
  }, []);

  // ניווט + עדכון ה-URL
  const navigate = (targetPage) => {
    setPage(targetPage);
    window.history.pushState(
      {},
      "",
      `/${targetPage === "home" ? "" : targetPage}`
    );
  };

  return (
    <>
      <Navbar navigate={navigate} />
      {page === "home" && <HomePage />}
      {page === "users" && <UsersPage />}
      <Footer />
    </>
  );
};

export default App;
