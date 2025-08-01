const Footer = () => {
  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "#f0f0f0",
        padding: "1rem",
        textAlign: "center",
        fontSize: "0.9rem",
        color: "#555",
        marginTop: "40px",
        boxSizing: "border-box",
      }}
    >
      © {new Date().getFullYear()} My App. All rights reserved.
    </footer>
  );
};

export default Footer;
