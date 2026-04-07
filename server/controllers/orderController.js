const Order = require("../models/Order");
const { createAuditLog } = require("../middleware/auditLog");

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { partyName, orderDate, dueDate, specialNotes, designs } = req.body;

    // Validation
    if (!partyName || !orderDate || !dueDate) {
      return res.status(400).json({
        message: "Please provide party name, order date, and due date",
      });
    }

    if (!designs || designs.length === 0) {
      return res
        .status(400)
        .json({ message: "Please add at least one design" });
    }

    // Validate each design
    for (const design of designs) {
      if (!design.skuCode) {
        return res
          .status(400)
          .json({ message: "Each design must have a SKU code" });
      }
    }

    const order = await Order.create({
      partyName,
      orderDate,
      dueDate,
      specialNotes: specialNotes || "",
      designs,
      status: "pending",
    });

    // Create audit log
    if (req.user) {
      await createAuditLog({
        user: req.user,
        action: "CREATE",
        resourceType: "Order",
        resourceId: order._id.toString(),
        description: `Created order #${order.orderNumber} for ${partyName}`,
        changes: { partyName, orderDate, dueDate, designCount: designs.length },
        req,
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check for version conflict (optimistic locking)
    if (req.body.__v !== undefined && order.__v !== req.body.__v) {
      return res.status(409).json({
        message:
          "This order was modified by another user. Please refresh and try again.",
        conflict: true,
        currentVersion: order.__v,
        yourVersion: req.body.__v,
        currentData: order,
      });
    }

    const { partyName, orderDate, dueDate, specialNotes, status, designs } =
      req.body;

    // Track changes for audit log
    const changes = {};
    if (partyName && partyName !== order.partyName)
      changes.partyName = { old: order.partyName, new: partyName };
    if (orderDate && orderDate !== order.orderDate)
      changes.orderDate = { old: order.orderDate, new: orderDate };
    if (dueDate && dueDate !== order.dueDate)
      changes.dueDate = { old: order.dueDate, new: dueDate };
    if (status && status !== order.status)
      changes.status = { old: order.status, new: status };

    order.partyName = partyName || order.partyName;
    order.orderDate = orderDate || order.orderDate;
    order.dueDate = dueDate || order.dueDate;
    order.specialNotes =
      specialNotes !== undefined ? specialNotes : order.specialNotes;
    order.status = status || order.status;
    order.designs = designs || order.designs;

    const updatedOrder = await order.save();

    // Create audit log
    if (req.user && Object.keys(changes).length > 0) {
      await createAuditLog({
        user: req.user,
        action:
          status && status !== changes.status?.old ? "STATUS_CHANGE" : "UPDATE",
        resourceType: "Order",
        resourceId: order._id.toString(),
        description: `Updated order #${order.orderNumber} for ${order.partyName}`,
        changes,
        req,
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create audit log before deletion
    if (req.user) {
      await createAuditLog({
        user: req.user,
        action: "DELETE",
        resourceType: "Order",
        resourceId: order._id.toString(),
        description: `Deleted order #${order.orderNumber} for ${order.partyName}`,
        changes: {
          partyName: order.partyName,
          orderNumber: order.orderNumber,
          status: order.status,
        },
        req,
      });
    }

    await order.deleteOne();
    res.json({ message: "Order removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update production stage for a design
// @route   PUT /api/orders/:orderId/designs/:designId/production/:stageName
// @access  Private
const updateProductionStage = async (req, res) => {
  try {
    const { orderId, designId, stageName } = req.params;
    const { status, labour, startDate, finishDate } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check for version conflict (optimistic locking)
    if (req.body.__v !== undefined && order.__v !== req.body.__v) {
      return res.status(409).json({
        message:
          "This order was modified by another user. Please refresh and try again.",
        conflict: true,
        currentVersion: order.__v,
        yourVersion: req.body.__v,
      });
    }

    const design = order.designs.id(designId);

    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    // Find or create production stage
    let stage = design.productionProgress.find(
      (s) => s.stageName === stageName,
    );

    if (!stage) {
      design.productionProgress.push({ stageName });
      stage = design.productionProgress[design.productionProgress.length - 1];
    }

    // Track changes for audit log
    const changes = {};
    if (status && status !== stage.status)
      changes.status = { old: stage.status, new: status };
    if (labour !== undefined && labour !== stage.labour)
      changes.labour = { old: stage.labour, new: labour };
    if (startDate !== undefined && startDate !== stage.startDate)
      changes.startDate = { old: stage.startDate, new: startDate };
    if (finishDate !== undefined && finishDate !== stage.finishDate)
      changes.finishDate = { old: stage.finishDate, new: finishDate };

    // Update stage
    if (status) stage.status = status;
    if (labour !== undefined) stage.labour = labour;
    if (startDate !== undefined) stage.startDate = startDate;
    if (finishDate !== undefined) stage.finishDate = finishDate;

    // Check if any SKU has started production
    const anyInProgress = order.designs.some((design) => {
      if (
        !design.productionProgress ||
        design.productionProgress.length === 0
      ) {
        return false;
      }
      return design.productionProgress.some(
        (stage) =>
          stage.status === "in-progress" || stage.status === "completed",
      );
    });

    // Check if all SKUs are completed and auto-update order status
    const allSKUsCompleted = order.designs.every((design) => {
      // Check if this design has production progress
      if (
        !design.productionProgress ||
        design.productionProgress.length === 0
      ) {
        return false;
      }
      // Check if all stages in this design are completed
      return design.productionProgress.every(
        (stage) => stage.status === "completed",
      );
    });

    // Auto-update order status based on production progress
    if (allSKUsCompleted && order.status !== "completed") {
      // All SKUs completed → set to completed
      order.status = "completed";
    } else if (!allSKUsCompleted && order.status === "completed") {
      // Not all SKUs completed but order was completed → revert to in-production
      order.status = "in-production";
    } else if (anyInProgress && order.status === "pending") {
      // Any SKU started and order is pending → set to in-production
      order.status = "in-production";
    } else if (!anyInProgress && order.status === "in-production") {
      // No SKU in progress and order is in-production → revert to pending
      order.status = "pending";
    }

    await order.save();

    // Create audit log
    if (req.user && Object.keys(changes).length > 0) {
      await createAuditLog({
        user: req.user,
        action: "PRODUCTION_UPDATE",
        resourceType: "ProductionStage",
        resourceId: order._id.toString(),
        description: `Updated ${stageName} stage for SKU ${design.skuCode} in order #${order.orderNumber}`,
        changes,
        req,
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateProductionStage,
};
