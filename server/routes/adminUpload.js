const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const cloudinary = require("../cloudinary");

const router = express.Router();

// Protect this route (admin only)
router.use(adminAuth);

/**
 * Client will request a signature, then upload directly to Cloudinary.
 */
router.get("/cloudinary-signature", (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);

  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "flower-gift/products";

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
  });
});

module.exports = router;
