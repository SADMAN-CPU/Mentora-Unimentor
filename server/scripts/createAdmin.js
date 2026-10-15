
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const connectDB = require("../config/db");

// Create first Admin account
const createAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 12) {
    console.error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters) in .env"
    );
    process.exitCode = 1;
    return;
  }

  try {
    // Connect to MongoDB
    await connectDB();

    // Check if admin email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("This email already exists. No changes made.");
      return;
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create Admin
    await User.create({
      name: "Mentora Admin",
      email,
      password: hashedPassword,
      role: "Admin",
      department: "Administration"
    });

    console.log("Admin account created successfully!");

  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
