const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: [
        "Junior Student",
        "Senior Student",
        "Alumni",
        "Industry Expert",
        "Admin"
      ],
      default: "Junior Student"
    },

    department: {
      type: String,
      default: ""
    },
    skills: {
  type: [String],
  default: []
  },

  interests: {
  type: [String],
  default: []
  },

  careerGoal: {
  type: String,
  default: "",
  trim: true
  },
    verified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);