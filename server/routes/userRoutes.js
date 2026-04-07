const express = require("express");
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, ownerOnly } = require("../middleware/auth");

// All routes require authentication and owner role
router.use(protect);
router.use(ownerOnly);

router.route("/").get(getUsers).post(createUser);
router.route("/:id").put(updateUser).delete(deleteUser);

module.exports = router;
