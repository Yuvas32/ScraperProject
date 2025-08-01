import { useState } from "react";
import { HomePage, UsersPage } from "./pages";
import { Navbar, Footer } from "./components";

const App = () => {
  const [page, setPage] = useState("home");

  return (
    <>
      <Navbar navigate={setPage} />
      {page === "home" && <HomePage />}
      {page === "users" && <UsersPage />}
      <Footer />
    </>
  );
};

export default App;
