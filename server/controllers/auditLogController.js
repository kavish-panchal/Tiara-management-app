const AuditLog = require("../models/AuditLog");

// @desc    Get all audit logs with filters
// @route   GET /api/audit-logs
// @access  Private/Owner
const getAuditLogs = async (req, res) => {
  try {
    const {
      userId,
      action,
      resourceType,
      fromDate,
      toDate,
      page = 1,
      limit = 50,
    } = req.query;

    // Build filter
    const filter = {};

    if (userId) filter.user = userId;
    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    // Get total count
    const total = await AuditLog.countDocuments(filter);

    // Get logs with pagination
    const logs = await AuditLog.find(filter)
      .populate("user", "name username role")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      logs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get audit logs for a specific resource
// @route   GET /api/audit-logs/resource/:resourceType/:resourceId
// @access  Private/Owner
const getResourceAuditLogs = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;

    const logs = await AuditLog.find({
      resourceType,
      resourceId,
    })
      .populate("user", "name username role")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get audit log statistics
// @route   GET /api/audit-logs/stats
// @access  Private/Owner
const getAuditLogStats = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (fromDate || toDate) {
      dateFilter.createdAt = {};
      if (fromDate) dateFilter.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = endDate;
      }
    }

    // Get stats
    const [actionStats, resourceStats, userStats, totalLogs] =
      await Promise.all([
        // Actions breakdown
        AuditLog.aggregate([
          { $match: dateFilter },
          { $group: { _id: "$action", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        // Resource types breakdown
        AuditLog.aggregate([
          { $match: dateFilter },
          { $group: { _id: "$resourceType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        // Top users
        AuditLog.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: "$user",
              userName: { $first: "$userName" },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),

        // Total logs
        AuditLog.countDocuments(dateFilter),
      ]);

    res.json({
      totalLogs,
      actionStats,
      resourceStats,
      userStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAuditLogs,
  getResourceAuditLogs,
  getAuditLogStats,
};
