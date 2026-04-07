const User = require("../models/User");
const { createAuditLog } = require("../middleware/auditLog");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Owner
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Owner
const createUser = async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    // Validate input
    if (!name || !username || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, username, and password" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      username,
      password,
      role: role || "manager",
    });

    // Create audit log
    await createAuditLog({
      user: req.user,
      action: "CREATE",
      resourceType: "User",
      resourceId: user._id.toString(),
      description: `Created user: ${user.name} (@${user.username}) with role: ${user.role}`,
      changes: { name, username, role: user.role },
      req,
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Owner
const updateUser = async (req, res) => {
  try {
    const { name, email, role, active, password } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Track changes
    const changes = {};
    if (name && name !== user.name)
      changes.name = { from: user.name, to: name };
    if (email && email !== user.email)
      changes.email = { from: user.email, to: email };
    if (role && role !== user.role)
      changes.role = { from: user.role, to: role };
    if (active !== undefined && active !== user.active)
      changes.active = { from: user.active, to: active };
    if (password) changes.password = "changed";

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (active !== undefined) user.active = active;
    if (password) user.password = password;

    await user.save();

    // Create audit log
    await createAuditLog({
      user: req.user,
      action: "UPDATE",
      resourceType: "User",
      resourceId: user._id.toString(),
      description: `Updated user: ${user.name} (${user.email})`,
      changes,
      req,
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Owner
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    await User.findByIdAndDelete(req.params.id);

    // Create audit log
    await createAuditLog({
      user: req.user,
      action: "DELETE",
      resourceType: "User",
      resourceId: user._id.toString(),
      description: `Deleted user: ${user.name} (${user.email})`,
      changes: { name: user.name, email: user.email, role: user.role },
      req,
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
