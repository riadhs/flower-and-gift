const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const cloudinary = require("../cloudinary");

const router = express.Router();

// Protect this route (admin only)
router.use(adminAuth);

/**
 * Client requests a signature, then uploads directly to Cloudinary.
 * We sign ONLY the params the client will actually send in the upload form.
 */
router.get("/cloudinary-signature", (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);

    // Put your uploads under a folder in Cloudinary
    const folder =
      process.env.CLOUDINARY_UPLOAD_FOLDER || "flower-gift/products";

    const paramsToSign = { timestamp, folder };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (err) {
    console.error("Cloudinary signature error:", err);
    res.status(500).json({
      error: "Failed to generate signature",
      details: err.message,
    });
  }
});

module.exports = router;
