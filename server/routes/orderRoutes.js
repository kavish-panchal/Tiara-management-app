const express = require("express");
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateProductionStage,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(protect);

// Order CRUD routes
router.route("/").get(getOrders).post(createOrder);

router.route("/:id").get(getOrderById).put(updateOrder).delete(deleteOrder);

// Production stage update route
router.put(
  "/:orderId/designs/:designId/production/:stageName",
  updateProductionStage,
);

module.exports = router;
