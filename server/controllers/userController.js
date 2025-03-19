const User = require("../models/User");
const Bill = require("../models/Bill");

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);
    // Check if it's a valid ObjectId but not found
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a user
// @route   POST /api/users
// @access  Private
const createUser = async (req, res) => {
  try {
    const { name, mobile, email, address } = req.body;

    // Validate required fields
    if (!name || !mobile) {
      return res
        .status(400)
        .json({ message: "Name and mobile number are required" });
    }

    // Validate mobile number format (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      return res
        .status(400)
        .json({ message: "Mobile number must be exactly 10 digits" });
    }

    // Check if mobile number already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "A user with this mobile number already exists" });
    }

    // Create new user
    const user = await User.create({
      name,
      mobile,
      email,
      address,
      joinDate: Date.now(),
      lastVisit: Date.now(),
      totalSpent: 0,
      amountDue: 0,
    });

    if (user) {
      res.status(201).json(user);
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    const { name, mobile, email, address } = req.body;

    // Find the user to update
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If mobile number is changing, validate it
    if (mobile && mobile !== user.mobile) {
      // Validate mobile number format (10 digits)
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(mobile)) {
        return res
          .status(400)
          .json({ message: "Mobile number must be exactly 10 digits" });
      }

      // Check if new mobile number already exists
      const existingUser = await User.findOne({ mobile });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res
          .status(400)
          .json({ message: "A user with this mobile number already exists" });
      }
    }

    // Update user fields
    user.name = name || user.name;
    user.mobile = mobile || user.mobile;
    user.email = email !== undefined ? email : user.email;
    user.address = address !== undefined ? address : user.address;
    user.lastVisit = Date.now(); // Update the last visit date

    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    console.error(`Error updating user ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has any bills
    const userBills = await Bill.countDocuments({ user: req.params.id });

    if (userBills > 0) {
      return res.status(400).json({
        message:
          "Cannot delete user with existing bills. Please delete all user bills first.",
      });
    }

    await user.deleteOne();

    res.json({ message: "User removed successfully" });
  } catch (error) {
    console.error(`Error deleting user ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayVisitors = await User.countDocuments({
      lastVisit: { $gte: today },
    });

    const totalDue = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amountDue" },
        },
      },
    ]);

    const pendingPayments = totalDue.length > 0 ? totalDue[0].total : 0;

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const monthlyRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: oneMonthAgo },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$paid" },
        },
      },
    ]);

    res.json({
      totalCustomers,
      todayVisitors,
      pendingPayments,
      monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
};
