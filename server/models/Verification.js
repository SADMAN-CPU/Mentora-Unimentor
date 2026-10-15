
const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    // User requesting verification
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    // Type of verification document
    documentType: {
      type: String,
      enum: ["graduation_record", "company_id"],
      required: true
    },

    // Private storage reference for the document
    documentPath: {
      type: String,
      required: true
    },

    // Verification status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    // Admin feedback
    adminNote: {
      type: String,
      default: ""
    },

    // Admin who reviewed the request
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    reviewedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Verification",
  verificationSchema
);
