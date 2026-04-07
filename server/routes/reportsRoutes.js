const express = require("express");
const router = express.Router();
const {
  getPendingOrders,
  getActiveOrders,
  getCompletedOrders,
  getDueToday,
  getOverdue,
  getWorkerReport,
} = require("../controllers/reportsController");

// Reports routes
router.get("/pending-orders", getPendingOrders);
router.get("/active-orders", getActiveOrders);
router.get("/completed-orders", getCompletedOrders);
router.get("/due-today", getDueToday);
router.get("/overdue", getOverdue);
router.get("/worker-report", getWorkerReport);

module.exports = router;
