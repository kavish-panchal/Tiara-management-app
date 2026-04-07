const express = require("express");
const router = express.Router();
const {
  getAppSettings,
  updateAppSettings,
  getSkuImage,
} = require("../controllers/appSettingsController");
const { protect } = require("../middleware/auth");

// SKU image route - PUBLIC (no auth required)
// Images are loaded via <img> tags which don't send auth headers
// The image path is local to each user's machine anyway
router.get("/sku-image/:skuCode", getSkuImage);

// All other app settings routes require authentication
router.use(protect);

// App settings routes
router.route("/").get(getAppSettings).put(updateAppSettings);

module.exports = router;
