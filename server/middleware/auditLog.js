const AuditLog = require("../models/AuditLog");

// Helper function to create audit log
const createAuditLog = async ({
  user,
  action,
  resourceType,
  resourceId = null,
  description,
  changes = null,
  req = null,
}) => {
  try {
    const auditData = {
      user: user._id,
      userName: user.name,
      userUsername: user.username,
      action,
      resourceType,
      resourceId,
      description,
      changes,
    };

    // Add request metadata if available
    if (req) {
      auditData.ipAddress =
        req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
      auditData.userAgent = req.get("user-agent");
    }

    await AuditLog.create(auditData);
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw error - audit logging should not break the main operation
  }
};

module.exports = { createAuditLog };
