const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs/promises");
const Verification = require("../models/Verification");
const User = require("../models/User");

 

const getPendingVerifications = async (req, res) => {
  try {
    // Find all pending verification requests
    const verifications = await Verification.find({
      status: "pending"
    })
      .select("userId documentType status createdAt")
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    // Send response
    return res.status(200).json({
      message: "Pending verification requests fetched successfully",
      count: verifications.length,
      verifications
    });

  } catch (error) {
    console.error("Admin Verification Error:", error);

    return res.status(500).json({
      message: "Failed to fetch verification requests"
    });
  }
};


  

const getVerificationDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate verification ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid verification ID"
      });
    }

    // Find verification request
    const verification = await Verification.findById(id);

    if (!verification) {
      return res.status(404).json({
        message: "Verification request not found"
      });
    }

    // Define permitted private directory
    const privateDirectory = path.resolve(
      __dirname,
      "..",
      "private_uploads",
      "verification"
    );

    const documentPath = path.resolve(
      verification.documentPath
    );

    // Prevent access to files outside private directory
    if (path.dirname(documentPath) !== privateDirectory) {
      return res.status(403).json({
        message: "Invalid document location"
      });
    }

    // Check file exists
    await fs.access(documentPath);

    // Download document securely
    const extension = path.extname(documentPath);

    return res.download(
      documentPath,
      `verification-document${extension}`,
      (error) => {
        if (error) {
          console.error("Document Download Error:", error);

          if (!res.headersSent) {
            res.status(404).json({
              message: "Document unavailable"
            });
          }
        }
      }
    );

  } catch (error) {
    console.error("Verification Document Error:", error);

    if (!res.headersSent) {
      return res.status(
        error.code === "ENOENT" ? 404 : 500
      ).json({
        message: "Unable to retrieve document"
      });
    }
  }
};

 

const approveVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote = "" } = req.body || {};

    // Validate verification ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid verification ID"
      });
    }

    if (
      typeof adminNote !== "string" ||
      adminNote.length > 500
    ) {
      return res.status(400).json({
        message: "Invalid admin note"
      });
    }

    let approvedVerification;

    // Update Verification and User together
    await mongoose.connection.transaction(async (session) => {

      const verification = await Verification.findById(id)
        .session(session);

      if (!verification) {
        const error = new Error("Verification request not found");
        error.status = 404;
        throw error;
      }

      // Only pending requests can be approved
      if (verification.status !== "pending") {
        const error = new Error("Request already reviewed");
        error.status = 409;
        throw error;
      }

      // Update verification
      verification.status = "approved";
      verification.adminNote = adminNote.trim();
      verification.reviewedBy = req.user._id;
      verification.reviewedAt = new Date();

      await verification.save({ session });

      // Update mentor verified status
      const user = await User.findOneAndUpdate(
        {
          _id: verification.userId,
          role: { $in: ["Alumni", "Industry Expert"] }
        },
        { $set: { verified: true } },
        { new: true, session }
      );

      if (!user) {
        throw new Error("Eligible mentor account not found");
      }

      approvedVerification = verification;
    });

    return res.status(200).json({
      message: "Mentor verification approved successfully",
      verification: {
        id: approvedVerification._id,
        status: approvedVerification.status,
        adminNote: approvedVerification.adminNote,
        reviewedAt: approvedVerification.reviewedAt
      }
    });

  } catch (error) {
    console.error("Approval Error:", error);

    return res.status(error.status || 500).json({
      message: error.status
        ? error.message
        : "Failed to approve verification"
    });
  }
};

 

const rejectVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body || {};

    // Check valid verification ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid verification ID"
      });
    }

    // Admin must provide a rejection reason
    if (
      typeof adminNote !== "string" ||
      !adminNote.trim() ||
      adminNote.length > 500
    ) {
      return res.status(400).json({
        message: "A rejection reason is required (max 500 characters)"
      });
    }

    // Only pending requests can be rejected
    const verification = await Verification.findOneAndUpdate(
      {
        _id: id,
        status: "pending"
      },
      {
        $set: {
          status: "rejected",
          adminNote: adminNote.trim(),
          reviewedBy: req.user._id,
          reviewedAt: new Date()
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!verification) {
      const exists = await Verification.exists({ _id: id });

      return res.status(exists ? 409 : 404).json({
        message: exists
          ? "Verification request already reviewed"
          : "Verification request not found"
      });
    }

    return res.status(200).json({
      message: "Mentor verification rejected successfully",
      verification: {
        id: verification._id,
        status: verification.status,
        adminNote: verification.adminNote,
        reviewedAt: verification.reviewedAt
      }
    });

  } catch (error) {
    console.error("Rejection Error:", error);

    return res.status(500).json({
      message: "Failed to reject verification"
    });
  }
};

module.exports = {
  getPendingVerifications,
  getVerificationDocument,
  approveVerification,
  rejectVerification
};