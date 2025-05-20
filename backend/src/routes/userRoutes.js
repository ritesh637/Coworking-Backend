const express = require("express");
const router = express.Router();
const axios = require("axios");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");
const {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  otpGenerate,
  resetPassword,
  verifyOtp,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  removeProfilePicture,
} = require("../controllers/userController");
const upload = require("../middlewares/upload");

// Register a new user
router.post("/register", registerUser);

// User login
router.post("/login", loginUser);

// Send OTP
router.post("/send-otp", sendOTP);

// Verify OTP and login
router.post("/verify-otp", verifyOTP);

// Generate OTP
router.post("/generateotp", otpGenerate);

// Verify otp
router.post("/verifyotp", verifyOtp);

// Reset Password
router.post("/forgotpassword", resetPassword);

// User profile routes
router.get("/profile", authMiddleware, getUserProfile);
router.put("/update-profile", authMiddleware, updateUserProfile);
router.post(
  "/upload-profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  uploadProfilePicture
);
router.delete("/remove-profile-picture", authMiddleware, removeProfilePicture);

module.exports = router;
