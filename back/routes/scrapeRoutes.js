// back/routes/scrapeRoutes.js
import express from "express";
import {
  downloadVideo,
  meta,
  scrapeVideo,
  batchVideo,
  saveVideo,
  videos,
} from "../controllers/scrapeController.js";

const router = express.Router();

/**
 * @route POST /scrape/download
 * @desc Download video directly as a stream
 */
router.post("/download", downloadVideo);

/**
 * @route POST /scrape/meta
 * @desc Get metadata for a single video
 */
router.post("/meta", meta);

/**
 * @route POST /scrape
 * @desc Alias for /scrape/meta
 */
router.post("/", scrapeVideo);

/**
 * @route POST /scrape/batch
 * @desc Get metadata for multiple videos
 */
router.post("/batch", batchVideo);

/**
 * @route POST /scrape/save
 * @desc Save video metadata into the database
 */
router.post("/save", saveVideo);

/**
 * @route GET /scrape/videos
 * @desc Get a list of saved videos
 */
router.get("/videos", videos);

export default router;
