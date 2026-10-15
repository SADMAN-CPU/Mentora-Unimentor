
const Verification = require("../models/Verification");
const MentorProfile = require("../models/MentorProfile");
const fs = require("fs/promises");

 

const submitVerification = async (req, res) => {
  // Remove an uploaded file if the request fails
  const removeUpload = async () => {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
  };

  try {
    const user = req.user;

    // Only Alumni and Industry Experts can apply
    const allowedDocuments = {
      "Alumni": "graduation_record",
      "Industry Expert": "company_id"
    };

    const expectedType = allowedDocuments[user.role];

    if (!expectedType) {
      await removeUpload();
      return res.status(403).json({
        message: "This role cannot request verification"
      });
    }

    // Check document type
   const { documentType } = req.body || {};

    if (documentType !== expectedType) {
      await removeUpload();
      return res.status(400).json({
        message: `Document type must be ${expectedType}`
      });
    }

    // Check uploaded proof
    if (!req.file) {
      return res.status(400).json({
        message: "Verification document is required"
      });
    }

    // Check mentor profile exists
    const mentorProfile = await MentorProfile.findOne({
      userId: user._id
    });

    if (!mentorProfile) {
      await removeUpload();
      return res.status(400).json({
        message: "Create your mentor profile first"
      });
    }

    // Prevent duplicate applications
    const existingRequest = await Verification.findOne({
      userId: user._id
    });

    if (existingRequest) {
      await removeUpload();
      return res.status(409).json({
        message: "Verification request already exists"
      });
    }

    // Save verification request
    const verification = await Verification.create({
      userId: user._id,
      documentType,
      documentPath: req.file.path,
      status: "pending"
    });

    return res.status(201).json({
      message: "Verification request submitted successfully",
      verification: {
        id: verification._id,
        documentType: verification.documentType,
        status: verification.status
      }
    });

  } catch (error) {
    await removeUpload();
    console.error("Verification Error:", error);

    return res.status(500).json({
      message: "Failed to submit verification"
    });
  }
};

 

const getMyVerification = async (req, res) => {
  try {
    const verification = await Verification.findOne({
      userId: req.user._id
    }).select(
      "documentType status adminNote reviewedAt createdAt"
    );

    if (!verification) {
      return res.status(404).json({
        message: "No verification request found"
      });
    }

    return res.status(200).json({
      message: "Verification status fetched successfully",
      verification
    });

  } catch (error) {
    console.error("Verification Error:", error);

    return res.status(500).json({
      message: "Failed to fetch verification status"
    });
  }
};



module.exports = {
  submitVerification,
  getMyVerification
};
