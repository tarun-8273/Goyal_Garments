const express = require("express");
const router = express.Router();
const {
  getBills,
  getBillById,
  getBillsByUserId,
  createBill,
  updateBill,
  recordPayment,
  getChartData,
} = require("../controllers/billController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getBills).post(protect, createBill);
router.route("/chart-data").get(protect, getChartData);
router.route("/user/:userId").get(protect, getBillsByUserId);
router.route("/:id").get(protect, getBillById).put(protect, updateBill);
router.route("/:id/pay").put(protect, recordPayment);

module.exports = router;
