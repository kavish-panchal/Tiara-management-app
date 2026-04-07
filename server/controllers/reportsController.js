const Order = require("../models/Order");

// @desc    Get pending orders
// @route   GET /api/reports/pending-orders
// @access  Private
const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "pending" }).sort({ dueDate: 1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active orders (in-production)
// @route   GET /api/reports/active-orders
// @access  Private
const getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "in-production" }).sort({
      dueDate: 1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders due today
// @route   GET /api/reports/due-today
// @access  Private
const getDueToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await Order.find({
      dueDate: {
        $gte: today,
        $lt: tomorrow,
      },
      status: { $nin: ["completed", "delivered"] },
    }).sort({ dueDate: 1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get overdue orders
// @route   GET /api/reports/overdue
// @access  Private
const getOverdue = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      dueDate: { $lt: today },
      status: { $nin: ["completed", "delivered"] },
    }).sort({ dueDate: 1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get completed orders
// @route   GET /api/reports/completed-orders
// @access  Private
const getCompletedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "completed" }).sort({
      dueDate: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get worker report
// @route   GET /api/reports/worker-report
// @access  Private
const getWorkerReport = async (req, res) => {
  try {
    const { workerName, fromDate, toDate } = req.query;

    if (!workerName) {
      return res.status(400).json({ message: "Worker name is required" });
    }

    // Build query to find all orders with production stages assigned to this worker
    const query = {};

    // Get all orders
    const allOrders = await Order.find(query);

    // Filter and collect tasks for this worker
    const tasks = [];
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let notStartedTasks = 0;

    allOrders.forEach((order) => {
      order.designs.forEach((design) => {
        if (design.productionProgress && design.productionProgress.length > 0) {
          design.productionProgress.forEach((stage) => {
            // Check if this stage is assigned to the worker (exact match, case-insensitive)
            if (
              stage.labour &&
              stage.labour.toLowerCase() === workerName.toLowerCase()
            ) {
              // Apply date filters if provided
              let includeTask = true;

              if (fromDate) {
                const from = new Date(fromDate);
                from.setHours(0, 0, 0, 0);

                // Check if task has started and is within date range
                if (stage.startDate) {
                  const taskStart = new Date(stage.startDate);
                  taskStart.setHours(0, 0, 0, 0);
                  if (taskStart < from) {
                    includeTask = false;
                  }
                } else if (stage.finishDate) {
                  const taskFinish = new Date(stage.finishDate);
                  taskFinish.setHours(0, 0, 0, 0);
                  if (taskFinish < from) {
                    includeTask = false;
                  }
                }
              }

              if (toDate && includeTask) {
                const to = new Date(toDate);
                to.setHours(23, 59, 59, 999);

                // Check if task is within date range
                if (stage.startDate) {
                  const taskStart = new Date(stage.startDate);
                  if (taskStart > to) {
                    includeTask = false;
                  }
                } else if (stage.finishDate) {
                  const taskFinish = new Date(stage.finishDate);
                  if (taskFinish > to) {
                    includeTask = false;
                  }
                }
              }

              if (includeTask) {
                tasks.push({
                  orderNumber: order.orderNumber,
                  partyName: order.partyName,
                  skuCode: design.skuCode,
                  stageName: stage.stageName,
                  status: stage.status,
                  labour: stage.labour,
                  startDate: stage.startDate,
                  finishDate: stage.finishDate,
                });

                totalTasks++;
                if (stage.status === "completed") {
                  completedTasks++;
                } else if (stage.status === "in-progress") {
                  inProgressTasks++;
                } else {
                  notStartedTasks++;
                }
              }
            }
          });
        }
      });
    });

    res.json({
      workerName,
      fromDate: fromDate || null,
      toDate: toDate || null,
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPendingOrders,
  getActiveOrders,
  getCompletedOrders,
  getDueToday,
  getOverdue,
  getWorkerReport,
};
