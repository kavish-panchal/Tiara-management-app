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

    const {
      partyName,
      orderDate,
      dueDate,
      orderCompleted,
      orderDelivered,
      specialNotes,
      status,
      designs,
    } = req.body;

    // Track changes for audit log
    const changes = {};
    if (partyName && partyName !== order.partyName)
      changes.partyName = { old: order.partyName, new: partyName };
    if (orderDate && orderDate !== order.orderDate)
      changes.orderDate = { old: order.orderDate, new: orderDate };
    if (dueDate && dueDate !== order.dueDate)
      changes.dueDate = { old: order.dueDate, new: dueDate };
    if (orderCompleted !== undefined) {
      const newCompleted = orderCompleted ? new Date(orderCompleted) : null;
      if (
        (newCompleted && !order.orderCompleted) ||
        (!newCompleted && order.orderCompleted) ||
        (newCompleted &&
          order.orderCompleted &&
          newCompleted.getTime() !== order.orderCompleted.getTime())
      ) {
        changes.orderCompleted = {
          old: order.orderCompleted,
          new: newCompleted,
        };
      }
    }
    if (orderDelivered !== undefined) {
      const newDelivered = orderDelivered ? new Date(orderDelivered) : null;
      if (
        (newDelivered && !order.orderDelivered) ||
        (!newDelivered && order.orderDelivered) ||
        (newDelivered &&
          order.orderDelivered &&
          newDelivered.getTime() !== order.orderDelivered.getTime())
      ) {
        changes.orderDelivered = {
          old: order.orderDelivered,
          new: newDelivered,
        };
      }
    }
    if (status && status !== order.status)
      changes.status = { old: order.status, new: status };

    order.partyName = partyName || order.partyName;
    order.orderDate = orderDate || order.orderDate;
    order.dueDate = dueDate || order.dueDate;
    if (orderCompleted !== undefined) {
      order.orderCompleted = orderCompleted ? new Date(orderCompleted) : null;
    }
    if (orderDelivered !== undefined) {
      order.orderDelivered = orderDelivered ? new Date(orderDelivered) : null;
    }
    order.specialNotes =
      specialNotes !== undefined ? specialNotes : order.specialNotes;
    order.status = status || order.status;
    order.designs = designs || order.designs;

    const updatedOrder = await order.save();

    // Create audit log
    if (req.user && Object.keys(changes).length > 0) {
      // Build detailed description
      const changeDescriptions = [];
      if (changes.partyName) {
        changeDescriptions.push(
          `party name from "${changes.partyName.old}" to "${changes.partyName.new}"`,
        );
      }
      if (changes.orderDate) {
        changeDescriptions.push(
          `order date from ${new Date(changes.orderDate.old).toLocaleDateString()} to ${new Date(changes.orderDate.new).toLocaleDateString()}`,
        );
      }
      if (changes.dueDate) {
        changeDescriptions.push(
          `due date from ${new Date(changes.dueDate.old).toLocaleDateString()} to ${new Date(changes.dueDate.new).toLocaleDateString()}`,
        );
      }
      if (changes.status) {
        changeDescriptions.push(
          `status from "${changes.status.old}" to "${changes.status.new}"`,
        );
      }
      if (changes.orderCompleted) {
        const oldDate = changes.orderCompleted.old
          ? new Date(changes.orderCompleted.old).toLocaleDateString()
          : "not set";
        const newDate = changes.orderCompleted.new
          ? new Date(changes.orderCompleted.new).toLocaleDateString()
          : "cleared";
        changeDescriptions.push(`completed date from ${oldDate} to ${newDate}`);
      }
      if (changes.orderDelivered) {
        const oldDate = changes.orderDelivered.old
          ? new Date(changes.orderDelivered.old).toLocaleDateString()
          : "not set";
        const newDate = changes.orderDelivered.new
          ? new Date(changes.orderDelivered.new).toLocaleDateString()
          : "cleared";
        changeDescriptions.push(`delivered date from ${oldDate} to ${newDate}`);
      }

      const description =
        changeDescriptions.length > 0
          ? `Updated ${changeDescriptions.join(", ")} for order #${order.orderNumber} (${order.partyName})`
          : `Updated order #${order.orderNumber} for ${order.partyName}`;

      await createAuditLog({
        user: req.user,
        action:
          status && status !== changes.status?.old ? "STATUS_CHANGE" : "UPDATE",
        resourceType: "Order",
        resourceId: order._id.toString(),
        description,
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
    if (status) {
      const oldStatus = stage.status;
      stage.status = status;

      // Auto-set start date when status changes to "in-progress"
      if (
        status === "in-progress" &&
        oldStatus !== "in-progress" &&
        !stage.startDate
      ) {
        const now = new Date();
        stage.startDate = now;
        if (!changes.startDate) {
          changes.startDate = { old: null, new: now };
        }
      }

      // Auto-set finish date when status changes to "completed"
      if (
        status === "completed" &&
        oldStatus !== "completed" &&
        !stage.finishDate
      ) {
        const now = new Date();
        stage.finishDate = now;
        if (!changes.finishDate) {
          changes.finishDate = { old: null, new: now };
        }
      }
    }
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
    // A design is completed when all its stages that have any progress are completed
    const allSKUsCompleted = order.designs.every((design) => {
      // Check if this design has production progress
      if (
        !design.productionProgress ||
        design.productionProgress.length === 0
      ) {
        return false;
      }

      // Filter out stages that haven't been started (not-started)
      // Only check stages that have been worked on
      const startedStages = design.productionProgress.filter(
        (stage) => stage.status !== "not-started",
      );

      // If no stages have been started, design is not completed
      if (startedStages.length === 0) {
        return false;
      }

      // Check if all started stages are completed
      return startedStages.every((stage) => stage.status === "completed");
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
      // Build detailed description
      const changeDescriptions = [];
      if (changes.status) {
        changeDescriptions.push(
          `status: ${changes.status.old} → ${changes.status.new}`,
        );
      }
      if (changes.labour) {
        const oldLabour = changes.labour.old || "unassigned";
        const newLabour = changes.labour.new || "unassigned";
        changeDescriptions.push(`worker: ${oldLabour} → ${newLabour}`);
      }
      if (changes.startDate) {
        const dateStr = changes.startDate.new
          ? new Date(changes.startDate.new).toLocaleDateString()
          : "not set";
        changeDescriptions.push(`start date: ${dateStr}`);
      }
      if (changes.finishDate) {
        const dateStr = changes.finishDate.new
          ? new Date(changes.finishDate.new).toLocaleDateString()
          : "not set";
        changeDescriptions.push(`finish date: ${dateStr}`);
      }

      const detailStr =
        changeDescriptions.length > 0
          ? ` (${changeDescriptions.join(", ")})`
          : "";
      const description = `Updated "${stageName}" stage for SKU ${design.skuCode} in order #${order.orderNumber} (${order.partyName})${detailStr}`;

      await createAuditLog({
        user: req.user,
        action: "PRODUCTION_UPDATE",
        resourceType: "ProductionStage",
        resourceId: order._id.toString(),
        description,
        changes,
        req,
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if already cancelled
    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    const oldStatus = order.status;

    // Update order to cancelled
    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancellationReason = cancellationReason || "";

    await order.save();

    // Create audit log
    if (req.user) {
      await createAuditLog({
        user: req.user,
        action: "CANCEL",
        resourceType: "Order",
        resourceId: order._id.toString(),
        description: `Cancelled order #${order.orderNumber} for ${order.partyName}`,
        changes: {
          status: { old: oldStatus, new: "cancelled" },
          cancelledAt: { old: null, new: order.cancelledAt },
          cancellationReason: { old: "", new: cancellationReason || "" },
        },
        req,
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark order images as printed
// @route   POST /api/orders/:id/mark-printed
// @access  Private
const markOrderAsPrinted = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update print status
    order.imagesPrinted = true;
    order.imagesPrintedAt = new Date();
    order.imagesPrintedBy = req.user._id;

    await order.save();

    // Create audit log
    if (req.user) {
      await createAuditLog({
        user: req.user,
        action: "UPDATE",
        resourceType: "Order",
        resourceId: order._id.toString(),
        description: `Marked images as printed for order #${order.orderNumber} (${order.partyName})`,
        changes: {
          imagesPrinted: { old: false, new: true },
          imagesPrintedAt: { old: null, new: order.imagesPrintedAt },
        },
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
  cancelOrder,
  updateProductionStage,
  markOrderAsPrinted,
};
