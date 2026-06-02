const express = require("express");
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  cancelOrder,
  uncancelOrder,
  updateProductionStage,
  markOrderAsPrinted,
} = require("../controllers/orderController");
const { protect, ownerOnly } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(protect);

// Order CRUD routes
router.route("/").get(getOrders).post(createOrder);

router.route("/:id").get(getOrderById).put(updateOrder).delete(deleteOrder);

// Cancel order route
router.put("/:id/cancel", cancelOrder);

// Un-cancel order route (Owner only)
router.put("/:id/uncancel", ownerOnly, uncancelOrder);

// Mark as printed route
router.post("/:id/mark-printed", markOrderAsPrinted);

// Production stage update route
router.put(
  "/:orderId/designs/:designId/production/:stageName",
  updateProductionStage,
);

module.exports = router;
