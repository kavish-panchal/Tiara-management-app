const User = require("../models/User");
const { createAuditLog } = require("../middleware/auditLog");

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username and password" });
    }

    console.log(`[LOGIN] Attempting login for username: "${username}"`);

    // Check if user exists
    const user = await User.findOne({ username });
    console.log(`[LOGIN] User found: ${user ? "YES" : "NO"}`);

    if (!user) {
      console.log("[LOGIN] User not found in database");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log(`[LOGIN] User active status: ${user.active}`);

    // Check if user is active
    if (!user.active) {
      console.log("[LOGIN] User account is inactive");
      return res.status(401).json({ message: "Account is inactive" });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    console.log(`[LOGIN] Password match: ${isPasswordCorrect}`);

    if (!isPasswordCorrect) {
      console.log("[LOGIN] Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create audit log
    await createAuditLog({
      user,
      action: "LOGIN",
      resourceType: "Auth",
      description: `User logged in`,
      req,
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
      token: user._id.toString(), // Use user ID as token (no JWT, no expiration)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Logout user (for audit log purposes)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Create audit log
    await createAuditLog({
      user: req.user,
      action: "LOGOUT",
      resourceType: "Auth",
      description: `User logged out`,
      req,
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  login,
  getMe,
  logout,
};
