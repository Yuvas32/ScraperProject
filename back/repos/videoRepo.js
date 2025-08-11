// back/repos/videoRepo.js
import db from "../config/db.js";

/**
 * Insert or update a video's metadata to match your existing table schema.
 * Table columns: source_url, yt_id, title, uploader, upload_date, duration,
 * width, height, format, view_count, like_count, raw_json
 */
export const insertVideo = async (meta) => {
  if (!meta?.source_url) throw new Error("source_url is required");

  const ytId = meta.id != null ? String(meta.id).slice(0, 255) : null; // clamp length

  const sql = `
    INSERT INTO videos (
      source_url, yt_id, title, uploader, upload_date, duration,
      width, height, format, view_count, like_count, raw_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      title=VALUES(title),
      uploader=VALUES(uploader),
      upload_date=VALUES(upload_date),
      duration=VALUES(duration),
      width=VALUES(width),
      height=VALUES(height),
      format=VALUES(format),
      view_count=VALUES(view_count),
      like_count=VALUES(like_count),
      raw_json=VALUES(raw_json)
  `;

  const params = [
    meta.source_url || null,
    ytId,
    meta.title || null,
    meta.uploader || null,
    meta.upload_date || null,
    Number.isFinite(meta.duration) ? meta.duration : null,
    Number.isFinite(meta.width) ? meta.width : null,
    Number.isFinite(meta.height) ? meta.height : null,
    meta.format || null,
    Number.isFinite(meta.view_count) ? meta.view_count : null,
    Number.isFinite(meta.like_count) ? meta.like_count : null,
    JSON.stringify(meta), // store full meta in JSON column
  ];

  const [result] = await db.execute(sql, params);
  return result.insertId || null;
};

/**
 * List recent saved videos. Avoid bound placeholders in LIMIT; sanitize and inline.
 */
export const listVideos = async (limit = 50) => {
  const lim = Math.max(1, Math.min(200, Number(limit) || 50));
  const sql = `
    SELECT vid_id, source_url, title, uploader, upload_date
    FROM videos
    ORDER BY vid_id DESC
    LIMIT ${lim}
  `;
  const [rows] = await db.query(sql);
  return rows;
};

export default { insertVideo, listVideos };
