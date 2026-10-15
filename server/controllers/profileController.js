
const User = require("../models/User");

// Get My Profile
const getMyProfile = (req, res) => {
  res.status(200).json({
    message: "Profile fetched successfully",
    user: req.user
  });
};

// Update Junior Student Profile
const updateMyProfile = async (req, res) => {
  try {
    const { skills, interests, careerGoal } = req.body;

    // Only junior students can use this endpoint
    if (req.user.role !== "Junior Student") {
      return res.status(403).json({
        message: "Only junior students can update this profile"
      });
    }

    // Validate input
    if (
      !Array.isArray(skills) ||
      !Array.isArray(interests) ||
      skills.some(skill => typeof skill !== "string") ||
      interests.some(interest => typeof interest !== "string") ||
      typeof careerGoal !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid profile information"
      });
    }

    // Update MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          skills: skills.map(skill => skill.trim()),
          interests: interests.map(interest => interest.trim()),
          careerGoal: careerGoal.trim()
        }
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Profile update failed"
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile
};
