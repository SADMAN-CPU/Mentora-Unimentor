
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const {
  getMyProfile,
  updateMyProfile
} = require("../controllers/profileController");

// Register User
router.post("/register", registerUser);

// Login User
router.post("/login", loginUser);

// Get Logged-in User Profile
router.get("/me", protect, getMyProfile);

// Update Junior Student Profile
router.put("/me", protect, updateMyProfile);

module.exports = router;
