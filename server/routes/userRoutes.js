const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getUsers).post(protect, createUser);
router.route("/stats").get(protect, getUserStats);
router
  .route("/:id")
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, deleteUser);

module.exports = router;
