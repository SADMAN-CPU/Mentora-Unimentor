
const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const uploadVerification = require(
  "../middleware/verificationUpload"
);

const {
  submitVerification,
  getMyVerification
} = require("../controllers/verificationController");

// Submit Verification Request
router.post(
  "/submit",
  protect,
  uploadVerification,
  submitVerification
);

// Check Verification Status
router.get(
  "/me",
  protect,
  getMyVerification
);

module.exports = router;
