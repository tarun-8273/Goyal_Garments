// server/scripts/createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email: "admin@example.com" });
    if (adminExists) {
      mongoose.disconnect();
      return;
    }

    // Create new admin user
    const admin = await Admin.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123", // This will be hashed by the pre-save hook in your model
    });

    mongoose.disconnect();
  } catch (error) {
    mongoose.disconnect();
  }
}

createAdmin();
