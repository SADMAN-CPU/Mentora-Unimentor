const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createMentorProfile,
  getMyMentorProfile,
  updateMentorProfile
} = require("../controllers/mentorController");

// All mentor routes require login
router.use(protect);

// Create Mentor Profile
router.post("/profile", createMentorProfile);

// Get My Mentor Profile
router.get("/profile/me", getMyMentorProfile);

// Update My Mentor Profile
router.put("/profile/me", updateMentorProfile);

module.exports = router;