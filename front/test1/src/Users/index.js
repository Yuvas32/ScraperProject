const formatValue = (key, value) => {
  if (key === "active") {
    return (
      <span
        className={
          value ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
        }
      >
        {value ? "Active" : "Not Active"}
      </span>
    );
  }

  if (
    key.includes("date") ||
    key.includes("created_at") ||
    key.includes("updated_at")
  ) {
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return value;
};

const UserTable = ({ tableName = [], title = "User Table" }) => {
  if (!tableName || tableName.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  const columns = Object.keys(tableName[0]);

  return (
    <div className="p-4 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <table className="min-w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">#</th>
            {columns.map((col) => (
              <th
                key={col}
                className="border border-gray-300 px-4 py-2 text-left capitalize"
              >
                {col.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableName.map((row, idx) => (
            <tr key={row.id || idx} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{idx + 1}</td>
              {columns.map((col) => (
                <td key={col} className="border border-gray-300 px-4 py-2">
                  {formatValue(col, row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
