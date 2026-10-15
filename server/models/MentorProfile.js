
const mongoose = require("mongoose");

const mentorProfileSchema = new mongoose.Schema(
  {
    // Connect mentor profile to a registered user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    department: {
      type: String,
      required: true,
      trim: true
    },

    skills: {
      type: [String],
      default: []
    },

    company: {
      type: String,
      default: ""
    },

    expertise: {
      type: String,
      default: ""
    },

    weeklyAvailability: [
      {
        day: {
          type: String,
          enum: [
            "Saturday", "Sunday", "Monday",
            "Tuesday", "Wednesday",
            "Thursday", "Friday"
          ]
        },
        startTime: String,
        endTime: String
      }
    ],

    careerJourney: [
      {
        stage: String,
        organization: String,
        role: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "MentorProfile",
  mentorProfileSchema
);
