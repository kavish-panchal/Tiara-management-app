const express = require("express");
const router = express.Router();
const {
  getAuditLogs,
  getResourceAuditLogs,
  getAuditLogStats,
} = require("../controllers/auditLogController");
const { protect, ownerOnly } = require("../middleware/auth");

// All routes require authentication and owner role
router.use(protect);
router.use(ownerOnly);

router.get("/", getAuditLogs);
router.get("/stats", getAuditLogStats);
router.get("/resource/:resourceType/:resourceId", getResourceAuditLogs);

module.exports = router;
