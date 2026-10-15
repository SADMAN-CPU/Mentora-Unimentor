require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const connectDB = require("../config/db");

const resetAdminPassword = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const newPassword = process.env.ADMIN_PASSWORD;

    if (
      !email ||
      !newPassword ||
      newPassword.length < 16 ||
      newPassword === "YOUR_STRONG_ADMIN_PASSWORD"
    ) {
      throw new Error("Set a new strong Admin password in .env");
    }

    await connectDB();

    const admin = await User.findOne({
      email: email.toLowerCase().trim(),
      role: "Admin"
    });

    if (!admin) {
      throw new Error("Admin account not found");
    }

    admin.password = await bcrypt.hash(newPassword, 12);

    await admin.save();

    console.log("Admin password updated successfully!");

  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

resetAdminPassword();