const UsersList = ({ activeUsers, inactiveUsers }) => {
  return (
    <div style={{ marginTop: "20px", fontSize: "16px" }}>
      <div style={{ marginBottom: "15px" }}>
        <p style={{ color: "#4bc0c0", fontWeight: "bold" }}>
          Active ({activeUsers.length}):
        </p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {activeUsers.map((user) => (
            <li key={user.id} style={{ margin: "4px 0" }}>
              {user.name}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p style={{ color: "#ff6384", fontWeight: "bold" }}>
          Not Active ({inactiveUsers.length}):
        </p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {inactiveUsers.map((user) => (
            <li key={user.id} style={{ margin: "4px 0" }}>
              {user.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UsersList;
