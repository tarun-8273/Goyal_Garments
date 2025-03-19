const Bill = require("../models/Bill");
const User = require("../models/User");

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private
const getBills = async (req, res) => {
  try {
    const bills = await Bill.find({}).populate("user", "name mobile");
    res.json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bills by user ID
// @route   GET /api/bills/user/:userId
// @access  Private
const getBillsByUserId = async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.params.userId });
    res.json(bills);
  } catch (error) {
    console.error("Error fetching user bills:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bill by ID
// @route   GET /api/bills/:id
// @access  Private
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate(
      "user",
      "name mobile address"
    );

    if (bill) {
      res.json(bill);
    } else {
      res.status(404).json({ message: "Bill not found" });
    }
  } catch (error) {
    console.error(`Error fetching bill ${req.params.id}:`, error);
    // Check if it's a valid ObjectId but not found
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a bill
// @route   POST /api/bills
// @access  Private
const createBill = async (req, res) => {
  try {
    const { userId, items, paid, notes } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    // Calculate total amount
    const amount = items.reduce(
      (total, item) =>
        total + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
      0
    );

    // Calculate due amount
    const paidAmount = parseFloat(paid) || 0;
    const due = Math.max(0, amount - paidAmount);

    // Determine status
    let status = "Unpaid";
    if (due === 0) {
      status = "Paid";
    } else if (due < amount) {
      status = "Partial";
    }

    const bill = await Bill.create({
      user: userId,
      items: items.map((item) => ({
        name: item.name,
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0,
      })),
      amount,
      paid: paidAmount,
      due,
      status,
      notes,
    });

    if (bill) {
      // Update user's total spent and amount due
      const user = await User.findById(userId);
      if (user) {
        user.totalSpent += amount;
        user.amountDue += due;
        user.lastVisit = Date.now();
        await user.save();
      }

      res.status(201).json(bill);
    } else {
      res.status(400).json({ message: "Invalid bill data" });
    }
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a bill
// @route   PUT /api/bills/:id
// @access  Private
const updateBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const { items, paid, notes } = req.body;

    // Calculate previous values for user update
    const previousAmount = bill.amount;
    const previousDue = bill.due;

    // Update items if provided
    if (items && items.length > 0) {
      bill.items = items.map((item) => ({
        name: item.name,
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0,
      }));

      // Recalculate amount
      bill.amount = items.reduce(
        (total, item) =>
          total +
          (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
        0
      );
    }

    // Update paid amount if provided
    if (paid !== undefined) {
      bill.paid = parseFloat(paid) || 0;
    }

    // Recalculate due amount
    bill.due = Math.max(0, bill.amount - bill.paid);

    // Update status
    if (bill.due === 0) {
      bill.status = "Paid";
    } else if (bill.due < bill.amount) {
      bill.status = "Partial";
    } else {
      bill.status = "Unpaid";
    }

    // Update notes if provided
    if (notes !== undefined) {
      bill.notes = notes;
    }

    const updatedBill = await bill.save();

    // Update user's total spent and amount due
    const user = await User.findById(bill.user);
    if (user) {
      user.totalSpent = user.totalSpent - previousAmount + bill.amount;
      user.amountDue = user.amountDue - previousDue + bill.due;
      await user.save();
    }

    res.json(updatedBill);
  } catch (error) {
    console.error(`Error updating bill ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record payment for a bill
// @route   PUT /api/bills/:id/pay
// @access  Private
const recordPayment = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Valid payment amount is required" });
    }

    // Previous due amount for user update
    const previousDue = bill.due;

    // Update paid and due amounts
    bill.paid += parseFloat(amount);
    bill.due = Math.max(0, bill.amount - bill.paid);

    // Update status
    if (bill.due === 0) {
      bill.status = "Paid";
    } else {
      bill.status = "Partial";
    }

    const updatedBill = await bill.save();

    // Update user's amount due
    const user = await User.findById(bill.user);
    if (user) {
      user.amountDue = Math.max(0, user.amountDue - previousDue + bill.due);
      await user.save();
    }

    res.json(updatedBill);
  } catch (error) {
    console.error(`Error recording payment for bill ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chart data for dashboard
// @route   GET /api/bills/chart-data
// @access  Private
const getChartData = async (req, res) => {
  try {
    // Get data for visitor chart (daily for the past week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const dailyUsers = await User.aggregate([
      {
        $match: {
          lastVisit: { $gte: oneWeekAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastVisit" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const dailyBills = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get data for payment status chart with improved handling
    const paymentStatus = await Bill.aggregate([
      {
        $group: {
          _id: { $toLower: "$status" }, // Convert to lowercase for consistency
          count: { $sum: 1 },
        },
      },
    ]);

    // Format data for charts
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    const dayLabels = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dayLabels.push(days[date.getDay()]);
    }

    const visitorData = dayLabels.map((day) => {
      const date = new Date(today);
      date.setDate(date.getDate() - dayLabels.indexOf(day));
      const dateString = date.toISOString().split("T")[0];
      const userEntry = dailyUsers.find((entry) => entry._id === dateString);
      return userEntry ? userEntry.count : 0;
    });

    const purchaseData = dayLabels.map((day) => {
      const date = new Date(today);
      date.setDate(date.getDate() - dayLabels.indexOf(day));
      const dateString = date.toISOString().split("T")[0];
      const billEntry = dailyBills.find((entry) => entry._id === dateString);
      return billEntry ? billEntry.count : 0;
    });

    // Format payment status data with better handling
    const statusLabels = ["paid", "partial", "unpaid"];
    const statusData = statusLabels.map((status) => {
      const entry = paymentStatus.find((item) => item._id === status);
      return entry ? entry.count : 0;
    });

    const chartData = {
      visitors: {
        labels: dayLabels,
        datasets: [
          {
            label: "Daily Visitors",
            data: visitorData,
            backgroundColor: "rgba(74, 111, 220, 0.2)",
            borderColor: "rgba(74, 111, 220, 1)",
          },
          {
            label: "Purchases",
            data: purchaseData,
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            borderColor: "rgba(153, 102, 255, 1)",
          },
        ],
      },
      payments: {
        labels: ["Paid", "Partial", "Unpaid"], // Proper case for display
        data: statusData,
        backgroundColor: [
          "rgba(40, 167, 69, 0.6)",
          "rgba(255, 193, 7, 0.6)",
          "rgba(220, 53, 69, 0.6)",
        ],
        borderColor: [
          "rgba(40, 167, 69, 1)",
          "rgba(255, 193, 7, 1)",
          "rgba(220, 53, 69, 1)",
        ],
      },
    };

    res.json(chartData);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBills,
  getBillsByUserId,
  getBillById,
  createBill,
  updateBill,
  recordPayment,
  getChartData,
};
