const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

 const {
  getPendingVerifications,
  getVerificationDocument,
  approveVerification,
  rejectVerification
} = require("../controllers/adminVerificationController");

// Protect all admin routes
router.use(protect);
router.use(adminOnly);

// View pending requests
router.get(
  "/verifications",
  getPendingVerifications
);

// Approve Mentor Verification
router.patch(
  "/verifications/:id/approve",
  approveVerification
);

// Reject Mentor Verification
router.patch(
  "/verifications/:id/reject",
  rejectVerification
);
// View a verification document
router.get(
  "/verifications/:id/document",
  getVerificationDocument
);

module.exports = router;