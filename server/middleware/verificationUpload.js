
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Private folder for verification documents
const uploadDirectory = path.join(
  __dirname,
  "..",
  "private_uploads",
  "verification"
);

// Create folder if it does not exist
fs.mkdirSync(uploadDirectory, { recursive: true });

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    ).toLowerCase();

    const uniqueName = crypto.randomUUID();

    cb(null, uniqueName + extension);
  }
});

// Allowed file types
const allowedTypes = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png"
};

// Validate uploaded file
const fileFilter = (req, file, cb) => {
  const extension = path.extname(
    file.originalname
  ).toLowerCase();

  if (allowedTypes[extension] === file.mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG and PNG files are allowed"));
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Handle upload errors
const uploadVerification = (req, res, next) => {
  upload.single("document")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.code === "LIMIT_FILE_SIZE"
          ? "File must be smaller than 5 MB"
          : error.message
      });
    }

    next();
  });
};

module.exports = uploadVerification;
