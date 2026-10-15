
const MentorProfile = require("../models/MentorProfile");

// Allowed mentor roles
const mentorRoles = [
  "Senior Student",
  "Alumni",
  "Industry Expert"
];

// =================================
// CREATE MENTOR PROFILE
// =================================

const createMentorProfile = async (req, res) => {
  try {
    // Check user role
    if (!mentorRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Only mentors can create a mentor profile"
      });
    }

    const {
      department,
      skills = [],
      company = "",
      expertise = "",
      weeklyAvailability = [],
      careerJourney = []
    } = req.body;

    // Basic validation
    if (typeof department !== "string" || !department.trim()) {
      return res.status(400).json({
        message: "Department is required"
      });
    }

    if (
      !Array.isArray(skills) ||
      !Array.isArray(weeklyAvailability) ||
      !Array.isArray(careerJourney) ||
      typeof company !== "string" ||
      typeof expertise !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid mentor profile information"
      });
    }

    // Career journey is for alumni
    if (req.user.role !== "Alumni" && careerJourney.length > 0) {
      return res.status(400).json({
        message: "Career journey is available for alumni"
      });
    }

    // Check existing profile
    const existingProfile = await MentorProfile.findOne({
      userId: req.user._id
    });

    if (existingProfile) {
      return res.status(409).json({
        message: "Mentor profile already exists"
      });
    }

    // Create profile
    const profile = await MentorProfile.create({
      userId: req.user._id,
      department: department.trim(),
      skills,
      company,
      expertise,
      weeklyAvailability,
      careerJourney
    });

    return res.status(201).json({
      message: "Mentor profile created successfully",
      profile
    });

  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Mentor profile already exists"
      });
    }

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: "Invalid profile data"
      });
    }

    return res.status(500).json({
      message: "Failed to create mentor profile"
    });
  }
};

// =================================
// GET MY MENTOR PROFILE
// =================================

const getMyMentorProfile = async (req, res) => {
  try {
    const profile = await MentorProfile.findOne({
      userId: req.user._id
    });

    if (!profile) {
      return res.status(404).json({
        message: "Mentor profile not found"
      });
    }

    return res.status(200).json({
      message: "Mentor profile fetched successfully",
      profile
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch mentor profile"
    });
  }
};

// =================================
// UPDATE MY MENTOR PROFILE
// =================================

const updateMentorProfile = async (req, res) => {
  try {
    if (!mentorRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Only mentors can update mentor profiles"
      });
    }

    // Only allow profile fields to be updated
    const allowedFields = [
      "department",
      "skills",
      "company",
      "expertise",
      "weeklyAvailability"
    ];

    if (req.user.role === "Alumni") {
      allowedFields.push("careerJourney");
    }

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided"
      });
    }

    const profile = await MentorProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!profile) {
      return res.status(404).json({
        message: "Mentor profile not found"
      });
    }

    return res.status(200).json({
      message: "Mentor profile updated successfully",
      profile
    });

  } catch (error) {
    console.error(error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: "Invalid profile data"
      });
    }

    return res.status(500).json({
      message: "Failed to update mentor profile"
    });
  }
};



module.exports = {
  createMentorProfile,
  getMyMentorProfile,
  updateMentorProfile
};
