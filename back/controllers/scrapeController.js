// back/controllers/scrapeController.js
import { getMeta } from "../utils/getMeta.js";
import { insertVideo, listVideos } from "../repos/videoRepo.js";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const YTDLP = path.join(__dirname, "..", "bin", "yt-dlp.exe");

/* ---------- helpers (same as you already have) ---------- */
const decodeEntities = (s = "") =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) =>
      String.fromCharCode(parseInt(h, 16))
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const sanitizeBaseName = (s) =>
  (s || "video")
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, " ")
    .trim();

const toAsciiFilename = (s) =>
  sanitizeBaseName(s)
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/"/g, "'")
    .slice(0, 100);

const encodeRFC5987 = (str) =>
  encodeURIComponent(str)
    .replace(/['()]/g, escape)
    .replace(/\*/g, "%2A")
    .replace(/%(7C|60|5E)/g, (m, hex) => `%${hex.toLowerCase()}`);

const buildYtArgs = (url, { useCookies = false } = {}) => {
  const extra = [
    "--referer",
    url,
    "--add-header",
    "User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  ];
  try {
    const host = new URL(url).hostname;
    if (host.includes("foxsports.com")) {
      extra.push("--geo-bypass-country", "US");
      extra.push("--add-header", "Origin:https://www.foxsports.com");
    }
  } catch {}
  if (useCookies) extra.push("--cookies-from-browser", "edge"); // or "chrome"
  return extra;
};

/* ------------------------------------------------------------------ *
 * Download                                                            *
 * ------------------------------------------------------------------ */

/**
 * POST /scrape/download
 * Streams MP4 bytes via yt-dlp stdout to the client.
 * Body: { url: string, title?: string }
 *
 * Notes:
 * - We set Content-Disposition using BOTH:
 *     filename="<ASCII fallback>.mp4"
 *     filename*=UTF-8''<percent-encoded-utf8>.mp4
 *   This prevents "Invalid character in header content".
 * - If ffmpeg is missing, yt-dlp may still produce a progressive MP4.
 */

/* ------------------------------------------------------------------ *
 * Metadata & DB                                                       *
 * ------------------------------------------------------------------ */

/**
 * Normalize yt-dlp info to our schema / DB columns.
 */
const toMeta = (url, info) => ({
  source_url: url,
  title: info.title ?? null,
  uploader: info.uploader ?? info.channel ?? null,
  upload_date: info.upload_date ?? null,
  duration: info.duration ?? 0,
  categories: Array.isArray(info.categories) ? info.categories : null,
  tags: Array.isArray(info.tags) ? info.tags : null,
  view_count: info.view_count ?? null,
  like_count: info.like_count ?? null,
  id: info.id ?? null,
  ext: info.ext ?? null,
  webpage_url: info.webpage_url ?? null,
  width: info.width ?? null,
  height: info.height ?? null,
  fps: info.fps ?? null,
  format: info.format ?? null,
});

/* ---------- NEW: robust streaming with fallbacks ---------- */
export const downloadVideo = async (req, res) => {
  const {
    url,
    title,
    useCookies = false,
    timeoutMs = 120_000,
  } = req.body || {};
  if (!url)
    return res.status(400).json({ ok: false, error: "url is required" });
  if (!fs.existsSync(YTDLP))
    return res.status(500).json({ ok: false, error: "yt-dlp.exe not found" });

  const rawTitle = decodeEntities(title || "video");
  const baseName = sanitizeBaseName(rawTitle) || "video";
  const asciiName = toAsciiFilename(baseName) || "video";
  const utf8Star = encodeRFC5987(`${baseName}.mp4`);

  // We’ll set headers only after we see the first stdout chunk
  const writeHeaders = () => {
    if (res.headersSent) return;
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${asciiName}.mp4"; filename*=UTF-8''${utf8Star}`
    );
  };

  // Attempts in order:
  // 1) Mux best video+audio to MP4 (needs ffmpeg, but fine if already progressive)
  // 2) Prefer progressive MP4, else best MP4
  // 3) Generic best (any container) as last resort
  const common = ["--no-part", "--no-warnings", "--quiet"];
  const site = buildYtArgs(url, { useCookies });

  const attempts = [
    ["-f", "bv*+ba/best", "--merge-output-format", "mp4", ...common, ...site],
    [
      "-f",
      "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
      ...common,
      ...site,
    ],
    ["-f", "best", ...common, ...site],
  ];

  const errors = [];

  // Run one attempt. If it starts streaming, we consider it final (no more fallbacks).
  const tryOnce = (args) =>
    new Promise((resolve) => {
      let started = false;
      let stderr = "";
      const child = spawn(YTDLP, [...args, "-o", "-", url], {
        windowsHide: true,
      });

      const killer = setTimeout(() => {
        try {
          child.kill("SIGKILL");
        } catch {}
      }, timeoutMs);

      const onAbort = () => {
        try {
          child.kill("SIGKILL");
        } catch {}
      };
      req.once("close", onAbort);

      child.stdout.on("data", (chunk) => {
        if (!started) {
          started = true;
          writeHeaders();
        }
        res.write(chunk);
      });

      child.stderr.on("data", (b) => {
        stderr += b.toString();
      });

      child.on("error", (err) => {
        clearTimeout(killer);
        req.off("close", onAbort);
        if (!started) {
          errors.push(`spawn error: ${err.message}`);
          return resolve({ started: false, code: 1 });
        }
        // If we had started streaming, we can only end the response.
        return resolve({ started: true, code: 1 });
      });

      child.on("close", (code) => {
        clearTimeout(killer);
        req.off("close", onAbort);
        if (code === 0) {
          if (started) res.end();
          return resolve({ started, code: 0 });
        }
        // Non-zero exit
        if (!started) errors.push(stderr || `yt-dlp exited ${code}`);
        else res.end(); // if streaming had begun, just end the body
        return resolve({ started, code });
      });
    });

  // Try attempts in sequence until one starts streaming or succeeds
  for (let i = 0; i < attempts.length; i++) {
    const { started, code } = await tryOnce(attempts[i]);
    if (started || code === 0) return; // success (streaming or finished cleanly)
    // else: no bytes were sent → we can try next
  }

  // If we got here, nothing streamed; return a useful JSON error
  const all = errors.join("\n");
  if (/HTTP Error 4(03|04)|geo|not available in your location|FOX/i.test(all)) {
    return res.status(451).json({
      ok: false,
      error:
        "This video appears geo‑restricted or requires authentication. Try enabling 'Use browser cookies' and make sure you can play it in your browser.",
    });
  }
  return res
    .status(502)
    .json({ ok: false, error: all || "yt-dlp failed to start streaming" });
};

/**
 * Build a human-friendly summary + extraInfo line (for UI).
 */
const makeSummary = (meta) => {
  const d = meta.upload_date;
  const date =
    d && d.length === 8
      ? `${d.slice(6, 8)}/${d.slice(4, 6)}/${d.slice(0, 4)}`
      : "Unknown date";

  const tags =
    Array.isArray(meta.tags) && meta.tags.length
      ? meta.tags.join(", ")
      : "No tags";
  const cats =
    Array.isArray(meta.categories) && meta.categories.length
      ? meta.categories.join(", ")
      : "No categories";

  const extras = [];
  if (meta?.width && meta?.height)
    extras.push(`Resolution: ${meta.width}×${meta.height}`);
  if (meta?.uploader) extras.push(`Uploader: ${meta.uploader}`);
  if (Number.isFinite(meta?.view_count))
    extras.push(`Views: ${meta.view_count}`);
  if (Number.isFinite(meta?.like_count))
    extras.push(`Likes: ${meta.like_count}`);

  return {
    text: `Video "${
      meta.title || "Untitled video"
    }" was published on ${date}, has a duration of ${
      meta.duration || 0
    } seconds, belongs to categories: ${cats}, and has tags: ${tags}.`,
    extraInfo: extras.length ? extras.join(" | ") : null,
  };
};

/**
 * POST /scrape/meta
 * Get metadata only (no DB write).
 * Body: { url: string }
 */
export const meta = async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url)
      return res.status(400).json({ ok: false, error: "url is required" });

    const info = await getMeta(url);
    const m = toMeta(url, info);
    const s = makeSummary(m);

    return res.json({
      ok: true,
      meta: m,
      partial: !!info.__partial,
      reason: info.__reason || null,
      summary: s,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};

/**
 * POST /scrape
 * Alias to /scrape/meta for convenience.
 */
export const scrapeVideo = async (req, res) => meta(req, res);

/**
 * POST /scrape/batch
 * Scrape multiple URLs (metadata only).
 * Body: { urls: string[] }
 */
export const batchVideo = async (req, res) => {
  try {
    const { urls } = req.body || {};
    if (!Array.isArray(urls) || urls.length === 0) {
      return res
        .status(400)
        .json({ ok: false, error: "urls must be a non-empty array" });
    }
    const results = [];
    for (const url of urls) {
      try {
        const info = await getMeta(url);
        const m = toMeta(url, info);
        const s = makeSummary(m);
        results.push({
          ok: true,
          url,
          meta: m,
          partial: !!info.__partial,
          reason: info.__reason || null,
          summary: s,
        });
      } catch (err) {
        results.push({ ok: false, url, error: String(err?.message || err) });
      }
    }
    return res.json({ ok: true, results });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};

/**
 * POST /scrape/save
 * Scrape a single URL and persist metadata to MySQL.
 * Body: { url: string }
 */
export const saveVideo = async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url)
      return res.status(400).json({ ok: false, error: "url is required" });

    const info = await getMeta(url);
    const m = toMeta(url, info);
    const insertedId = await insertVideo(m);
    const s = makeSummary(m);

    return res.json({
      ok: true,
      insertedId,
      meta: m,
      partial: !!info.__partial,
      reason: info.__reason || null,
      summary: s,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};

/**
 * GET /scrape/videos?limit=50
 * List recent saved rows for the dropdown.
 */
export const videos = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 50));
    const rows = await listVideos(limit);
    return res.json({ ok: true, rows });
  } catch (e) {
    console.error("[/scrape/videos] error:", e?.message || e);
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};
