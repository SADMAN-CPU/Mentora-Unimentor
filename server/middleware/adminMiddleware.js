// Check if logged-in user is Admin

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({
      message: "Access denied. Admin only."
    });
  }

  next();
};

module.exports = adminOnly;