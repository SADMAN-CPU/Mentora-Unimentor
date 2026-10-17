const MentorProfile = require("../models/MentorProfile");
const { validateCareerJourney } = require("../utils/careerJourney");

// Allowed mentor roles
const mentorRoles = [
  "Senior Student",
  "Alumni",
  "Industry Expert"
];

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

    // Validate and clean the career journey (alumni only)
    let journeyEntries = [];

    if (req.user.role === "Alumni") {
      const result = validateCareerJourney(careerJourney);

      if (result.error) {
        return res.status(400).json({ message: result.error });
      }

      journeyEntries = result.entries;
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
      careerJourney: journeyEntries
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

    // Validate and clean the career journey before saving
    if (updates.careerJourney !== undefined) {
      const result = validateCareerJourney(updates.careerJourney);

      if (result.error) {
        return res.status(400).json({ message: result.error });
      }

      updates.careerJourney = result.entries;
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

// Students can read alumni career journeys (no email or private data)
const getAlumniCareerJourneys = async (req, res) => {
  try {
    const profiles = await MentorProfile.find({
      "careerJourney.0": { $exists: true }
    })
      .populate({
        path: "userId",
        match: { role: "Alumni" },
        select: "name department verified"
      })
      .select("userId department company expertise careerJourney")
      .limit(100)
      .lean();

    const alumni = profiles
      .filter((profile) => profile.userId)
      .map((profile) => ({
        id: profile.userId._id,
        name: profile.userId.name,
        verified: Boolean(profile.userId.verified),
        department: profile.department || profile.userId.department || "",
        company: profile.company,
        expertise: profile.expertise,
        careerJourney: profile.careerJourney
      }))
      // Verified alumni first
      .sort((a, b) => Number(b.verified) - Number(a.verified));

    return res.status(200).json({
      message: "Alumni career journeys fetched successfully",
      count: alumni.length,
      alumni
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch alumni career journeys"
    });
  }
};

module.exports = {
  createMentorProfile,
  getMyMentorProfile,
  updateMentorProfile,
  getAlumniCareerJourneys
};