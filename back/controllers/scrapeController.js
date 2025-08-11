// back/controllers/scrapeController.js
import { getMeta } from "../utils/getMeta.js";
import { insertVideo, listVideos } from "../repos/videoRepo.js";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const YTDLP = path.join(__dirname, "..", "bin", "yt-dlp.exe");

/* ------------------------------------------------------------------ *
 * Filename / header helpers                                           *
 * ------------------------------------------------------------------ */

/**
 * Minimal HTML entity decoder for titles coming from pages (e.g., &#x27;).
 * We only decode the common ones we actually see in titles.
 */
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

/** Strip filesystem-illegal characters, collapse spaces, trim. */
const sanitizeBaseName = (s) =>
  (s || "video")
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, " ")
    .trim();

/** ASCII fallback for header (Node requires Latin‑1). */
const toAsciiFilename = (s) =>
  sanitizeBaseName(s)
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "_") // non-ASCII → _
    .replace(/"/g, "'") // quotes can break header
    .slice(0, 100);

/** RFC 5987 percent-encoding for filename* (UTF‑8). */
const encodeRFC5987 = (str) =>
  encodeURIComponent(str)
    .replace(/['()]/g, escape)
    .replace(/\*/g, "%2A")
    .replace(/%(7C|60|5E)/g, (m, hex) => `%${hex.toLowerCase()}`);

/** Keep an extra filesystem-safe name for logs or local temp files if ever needed. */
const safeFileName = (s) => sanitizeBaseName(s).slice(0, 100);

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
export const downloadVideo = async (req, res) => {
  try {
    const { url, title } = req.body || {};
    if (!url)
      return res.status(400).json({ ok: false, error: "url is required" });
    if (!fs.existsSync(YTDLP))
      return res.status(500).json({ ok: false, error: "yt-dlp.exe not found" });

    // Build a safe + internationalized filename
    const rawTitle = decodeEntities(title || "video");
    const baseName = sanitizeBaseName(rawTitle) || "video";
    const asciiName = toAsciiFilename(baseName) || "video";
    const utf8Star = encodeRFC5987(`${baseName}.mp4`);

    // Headers: ASCII fallback + UTF-8 filename*
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${asciiName}.mp4"; filename*=UTF-8''${utf8Star}`
    );

    // Try best video+audio merged to MP4; if ffmpeg missing, we still stream what we get
    const args = [
      "-f",
      "bv*+ba/best",
      "--merge-output-format",
      "mp4",
      "--no-part",
      "--no-warnings",
      "--quiet",
      "--referer",
      url,
      "--add-header",
      "User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "-o",
      "-", // stream to stdout
      url,
    ];

    let started = false;
    let stderr = "";

    const child = spawn(YTDLP, args, { windowsHide: true });
    const onAbort = () => {
      try {
        child.kill("SIGKILL");
      } catch {}
    };
    req.on("close", onAbort);

    child.stdout.on("data", (chunk) => {
      started = true;
      res.write(chunk);
    });

    child.stderr.on("data", (b) => {
      stderr += b.toString();
    });

    child.on("error", (err) => {
      req.off("close", onAbort);
      if (!res.headersSent)
        return res
          .status(502)
          .json({ ok: false, error: `yt-dlp spawn error: ${err.message}` });
      res.end();
    });

    child.on("close", (code) => {
      req.off("close", onAbort);
      if (code === 0) return res.end();

      // If we haven't streamed yet, map error to JSON
      const msg = stderr || `yt-dlp exited ${code}`;
      if (!res.headersSent || !started) {
        return res.status(502).json({ ok: false, error: msg });
      }
      res.end();
    });
  } catch (e) {
    if (!res.headersSent) {
      res.status(500).json({ ok: false, error: String(e.message || e) });
    } else {
      res.end();
    }
  }
};

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
