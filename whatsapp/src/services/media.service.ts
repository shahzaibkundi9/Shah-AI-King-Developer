/**
 * media.service.ts
 * - Accepts multipart upload (multer) from routes
 * - Uploads to Cloudinary
 * - Returns secure URL for backend & storage
 */

import cloudinary from "cloudinary";
import { CLOUDINARY } from "../config/env";
import fs from "fs";
import logger from "../logger";
import path from "path";

cloudinary.v2.config({
  cloud_name: CLOUDINARY.cloud_name,
  api_key: CLOUDINARY.api_key,
  api_secret: CLOUDINARY.api_secret
});

export async function uploadLocalFileToCloudinary(localPath: string) {
  try {
    const res = await cloudinary.v2.uploader.upload(localPath, { resource_type: "auto" });
    // optionally delete local file
    try { fs.unlinkSync(localPath); } catch (e) {}
    return { url: res.secure_url, raw: res };
  } catch (err: any) {
    logger.error("cloud upload error: " + (err.message || err.toString()));
    throw err;
  }
}
