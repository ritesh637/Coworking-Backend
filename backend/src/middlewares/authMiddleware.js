const jwt = require("jsonwebtoken");
const User = require("../models/UserModel"); // Assuming you're using the new model name

require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Find the user by ID and exclude the password field
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found." });

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res
      .status(401)
      .json({ message: "Not authorized, token failed or expired" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized." });
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only." });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
