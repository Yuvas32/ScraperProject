const preURL = "http://localhost:3001";

export const fetchUsers = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const res = await fetch(`${preURL}/users`, {
    headers: {
      "x-user-role": user.role || "",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch users");
  return await res.json();
};

export const fetchWelcomeMessage = async () => {
  const res = await fetch(`${preURL}/test`);
  if (!res.ok) throw new Error("Failed to fetch welcome message");
  const data = await res.json();
  return data.message;
};

// front/src/functions/appFunctions.js

// Fetch video metadata from backend
export const fetchVideoMeta = async (url) => {
  const res = await fetch("http://localhost:3001/scrape/meta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Failed to fetch metadata");
  }
  return data.meta;
};

// Save video metadata to database via backend
export const saveVideoMeta = async (url) => {
  const res = await fetch("http://localhost:3001/scrape/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Failed to save video");
  }
  return data;
};

// Fetch list of saved videos from backend
export const fetchSavedVideos = async (limit = 50) => {
  const res = await fetch(`${preURL}/scrape/videos?limit=${limit}`);
  const ct = res.headers.get("content-type") || "";

  let data;
  if (ct.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text(); // HTML or plain text
    throw new Error(
      `Unexpected response (HTTP ${res.status}). Body: ${text.slice(0, 200)}`
    );
  }

  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error || `Fetch failed (HTTP ${res.status})`);
  }
  return data.rows || [];
};

// Download video file from backend
export const downloadVideoBlob = async ({ url, title }) => {
  const res = await fetch("http://localhost:3001/scrape/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, title }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Download failed: ${errText}`);
  }
  return await res.blob();
};
