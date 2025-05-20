require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/UserModel");
const Otp = require("../models/OtpModel");
const otpGenerator = require("otp-generator");
const otpStore = new Map();

const cloudinary = require("../config/cloudinary");

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const registerUser = async (req, res) => {
  try {
    const { email, password, username, phoneNumber, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      phoneNumber,
      role: role || "user",
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        email: newUser.email,
        username: newUser.username,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "👤 User does not exist!" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is deactivated. Contact support!" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      userId: user._id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      role: user.role,
      profilePicture: user.profilePicture,
      message:
        user.role === "admin"
          ? "✅ Admin login successful!"
          : "✅ User login successful!",
    });
  } catch (error) {
    res.status(500).json({ message: "⚠️ Server error. Please try again." });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "📱 Phone number is required!" });
    }

    const cleanPhone = phoneNumber.replace(/[^\d]/g, "");
    const user = await User.findOne({ phoneNumber: cleanPhone });

    if (!user) {
      return res.status(400).json({ message: "👤 User does not exist!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore.set(cleanPhone, { otp, expiresAt });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your OTP for Login",
      text: `Hi ${
        user.username || "User"
      },\n\nYour OTP is ${otp}. It is valid for 5 minutes.\n\nRegards,\nSpace Hub Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "✅ OTP sent to your registered email." });
  } catch (error) {
    console.error("Nodemailer OTP Send Error:", error?.message || error);
    res.status(500).json({ message: "⚠️ Failed to send OTP via Email." });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res
        .status(400)
        .json({ message: "❗ Phone number and OTP required." });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ message: "👤 User does not exist!" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is deactivated. Contact support!" });
    }

    const stored = otpStore.get(phoneNumber);

    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
      return res.status(401).json({ message: "❌ Invalid or expired OTP." });
    }

    otpStore.delete(phoneNumber);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      userId: user._id,
      username: user.username,
      phoneNumber: user.phoneNumber,
      email: user.email,
      createdAt: user.createdAt,
      role: user.role,
      profilePicture: user.profilePicture,
      message:
        user.role === "admin"
          ? "✅ Admin OTP login successful!"
          : "✅ User OTP login successful!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "⚠️ Server error. Please try again." });
  }
};

const otpGenerate = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User does not exist!" });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ user: user._id });
    await Otp.create({ user: user._id, otp: generatedOtp });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${generatedOtp}. It is valid for 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Error sending email. Try again." });
      }
      res.json({ message: "OTP sent to your email!" });
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).json({ message: "Server error. Try again." });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User does not exist!" });
    }

    const otpEntry = await Otp.findOne({ user: user._id, otp }).sort({
      createdAt: -1,
    });
    if (!otpEntry) {
      return res.json({ message: "Invalid or expired OTP!" });
    }

    res.json({ message: "OTP verified successfully!" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Server error. Try again." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "👤 User does not exist!" });
    }

    const otpEntry = await Otp.findOne({ user: user._id, otp });
    if (!otpEntry) {
      return res.json({ message: "⚠️ Invalid or expired OTP!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();
    await Otp.deleteMany({ user: user._id });

    res.json({ message: "Password reset successfully!", color: "green" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error. Try again." });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "-password -__v -createdAt -updatedAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { username, phoneNumber, address, companyName, gstNumber } = req.body;

    user.username = username || user.username;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.address = address || user.address;
    user.companyName = companyName || user.companyName;
    user.gstNumber = gstNumber || user.gstNumber;

    const updatedUser = await user.save();

    updatedUser.password = undefined;
    updatedUser.__v = undefined;

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old profile picture if exists
    if (user.profilePicturePublicId) {
      await cloudinary.uploader.destroy(user.profilePicturePublicId);
    }

    // Update user with new profile picture
    user.profilePicture = req.file.path;
    user.profilePicturePublicId = req.file.filename;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading profile picture",
      error: error.message,
    });
  }
};

const removeProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.profilePicturePublicId) {
      await cloudinary.uploader.destroy(user.profilePicturePublicId);
    }

    user.profilePicture = "";
    user.profilePicturePublicId = "";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture removed successfully",
    });
  } catch (error) {
    console.error("Error removing profile picture:", error);
    res.status(500).json({
      success: false,
      message: "Error removing profile picture",
      error: error.message,
    });
  }
};

module.exports = {
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
};
