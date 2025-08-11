// back/utils/getMeta.js (ESM)
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------- helpers ---------------- */

const parseBetween = (s, start, end) => {
  const i = s.indexOf(start);
  if (i === -1) return null;
  const j = s.indexOf(end, i + start.length);
  if (j === -1) return null;
  return s.slice(i + start.length, j).trim();
};

const getMetaTag = (content, prop) => {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=(?:"|')${prop}(?:"|')[^>]*?(?:content|value)=(?:"|')([^"']+)(?:"|')`,
    "i"
  );
  const m = content.match(re);
  return m ? m[1] : null;
};

const toYYYYMMDD = (isoString) => {
  if (!isoString) return null;
  const d = new Date(isoString);
  if (isNaN(d)) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
};

const fallbackHtmlMeta = async (url, reason = "yt-dlp binary not found") => {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      Referer: url,
    },
  });
  const html = await res.text();

  const ogTitle =
    getMetaTag(html, "og:title") || getMetaTag(html, "twitter:title");
  const titleTag = parseBetween(html, "<title>", "</title>");
  const title = (ogTitle || titleTag || "").replace(/\s+/g, " ").trim() || null;

  const site = getMetaTag(html, "og:site_name") || null;
  const pubIso =
    getMetaTag(html, "article:published_time") ||
    getMetaTag(html, "og:updated_time") ||
    getMetaTag(html, "date") ||
    null;
  const upload_date = toYYYYMMDD(pubIso);

  const durStr =
    getMetaTag(html, "og:video:duration") ||
    getMetaTag(html, "video:duration") ||
    null;
  const duration = durStr ? Number(durStr) || null : null;

  const kw = getMetaTag(html, "keywords") || getMetaTag(html, "news_keywords");
  const tags = kw
    ? kw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null;

  return {
    __partial: true,
    __reason: reason,
    title,
    uploader: site,
    upload_date,
    duration,
    categories: null,
    tags,
    view_count: null,
    like_count: null,
    id: null,
    ext: null,
    webpage_url: url,
    width: null,
    height: null,
    fps: null,
    format: null,
  };
};

/* locate yt-dlp.exe */
const getYtDlpPath = () => {
  const candidates = [];

  if (process.env.YTDLP_PATH) {
    candidates.push(process.env.YTDLP_PATH);
  }

  // back/utils/getMeta.js -> ../bin/yt-dlp.exe
  candidates.push(path.join(__dirname, "..", "bin", "yt-dlp.exe"));

  // project root fallback (if server started from root)
  candidates.push(path.resolve(__dirname, "..", "..", "bin", "yt-dlp.exe"));

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

const runYtDlp = (ytPath, url, { timeoutMs = 120_000 } = {}) =>
  new Promise((resolve, reject) => {
    const args = [
      "--dump-single-json",
      "--skip-download",
      "--quiet",
      "--no-warnings",
      "--referer",
      url,
      "--add-header",
      "User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      url,
    ];
    const child = spawn(ytPath, args, { windowsHide: true });

    let out = "",
      err = "";
    const killTimer = setTimeout(() => child.kill("SIGKILL"), timeoutMs);

    child.stdout.on("data", (b) => (out += b));
    child.stderr.on("data", (b) => (err += b));
    child.on("close", (code) => {
      clearTimeout(killTimer);
      if (code !== 0) return reject(new Error(err || `yt-dlp exited ${code}`));
      try {
        resolve(JSON.parse(out));
      } catch (e) {
        reject(e);
      }
    });
  });

/* ---------------- exported API ---------------- */

export const getMeta = async (url, opts = {}) => {
  const ytPath = getYtDlpPath();
  if (!ytPath) {
    // Graceful fallback: still return partial meta so /save can work
    return fallbackHtmlMeta(url, "yt-dlp.exe not found");
  }

  try {
    return await runYtDlp(ytPath, url, opts);
  } catch (err) {
    const msg = String(err?.message || err);
    if (/Unsupported URL/i.test(msg)) {
      return fallbackHtmlMeta(url, "Unsupported URL for yt-dlp");
    }
    // still fallback to avoid hard failure
    return fallbackHtmlMeta(url, msg);
  }
};
