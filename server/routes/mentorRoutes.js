const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createMentorProfile,
  getMyMentorProfile,
  updateMentorProfile,
  getAlumniCareerJourneys
} = require("../controllers/mentorController");

// All mentor routes require login
router.use(protect);

// Create Mentor Profile
router.post("/profile", createMentorProfile);

// Get My Mentor Profile
router.get("/profile/me", getMyMentorProfile);

// Update My Mentor Profile
router.put("/profile/me", updateMentorProfile);

// Browse alumni career journeys (any logged-in user)
router.get("/alumni", getAlumniCareerJourneys);

module.exports = router;