const User = require("../models/User");

// Demo mode middleware - automatically sets req.user to owner
// This is for demo purposes only - remove in production
const demoAuth = async (req, res, next) => {
  try {
    // Find the owner user
    const owner = await User.findOne({ role: "owner" });
    
    if (!owner) {
      console.error("No owner user found for demo mode");
      return next();
    }

    // Set req.user to the owner
    req.user = owner;
    next();
  } catch (error) {
    console.error("Error in demo auth middleware:", error);
    next();
  }
};

module.exports = { demoAuth };

