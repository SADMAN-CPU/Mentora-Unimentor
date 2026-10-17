
const mongoose = require("mongoose");

// ========================================
// CAREER JOURNEY SCHEMA
// ========================================

const careerJourneySchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      enum: [
        "University",
        "Internship",
        "Job",
        "Current Role"
      ],
      required: true
    },

    organization: {
      type: String,
      required: true,
      trim: true
    },

    role: {
      type: String,
      required: true,
      trim: true
    },

    startDate: {
      type: Date,
      default: null
    },

    endDate: {
      type: Date,
      default: null
    },

    description: {
      type: String,
      default: "",
      trim: true
    },

    skillsLearned: {
      type: [String],
      default: []
    }
  },
  { _id: true }
);


const mentorProfileSchema = new mongoose.Schema(
  {
    // Connect mentor profile to registered user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    // Academic department
    department: {
      type: String,
      required: true,
      trim: true
    },

    // Mentor skills
    skills: {
      type: [String],
      default: []
    },

    // Current company
    company: {
      type: String,
      default: "",
      trim: true
    },

    // Area of expertise
    expertise: {
      type: String,
      default: "",
      trim: true
    },

    // Weekly mentoring availability
    weeklyAvailability: [
      {
        day: {
          type: String,
          enum: [
            "Saturday",
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday"
          ]
        },

        startTime: {
          type: String
        },

        endTime: {
          type: String
        }
      }
    ],

    // Alumni career history
    careerJourney: {
      type: [careerJourneySchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "MentorProfile",
  mentorProfileSchema
);
