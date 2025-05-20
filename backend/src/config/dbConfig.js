const mongoose = require("mongoose");
require("dotenv").config();

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("⏭ MongoDB already connected. Skipping reconnection.");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {});
    isConnected = true;

    
    console.log("✅ MongoDB Connected successfully.");
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log("DB Connection Failed");
    process.exit(1);
  }
};

module.exports = connectDB;
