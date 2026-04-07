const User = require("../models/User");

// Protect routes - simple user ID based authentication (no token validation)
// For local use only - session persists until logout
const protect = async (req, res, next) => {
  try {
    // Get user ID from Authorization header (simple format: "Bearer <userId>")
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Not authorized, no user session" });
    }

    const userId = authHeader.split(" ")[1];

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Not authorized, invalid session" });
    }

    // Get user from database
    req.user = await User.findById(userId).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!req.user.active) {
      return res.status(401).json({ message: "User account is inactive" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Not authorized" });
  }
};

// Owner only middleware
const ownerOnly = (req, res, next) => {
  if (req.user && req.user.role === "owner") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Owner only." });
  }
};

// Manager or Owner middleware
const managerOrOwner = (req, res, next) => {
  if (req.user && (req.user.role === "owner" || req.user.role === "manager")) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Manager or Owner only." });
  }
};

module.exports = { protect, ownerOnly, managerOrOwner };
