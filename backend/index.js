require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Middleware and config imports
const errorHandler = require("./src/middlewares/errorHandler");
const connectDB = require("./src/config/dbConfig");
const { createDefaultAdmin } = require("./src/controllers/adminController");

// Route imports
const userRoutes = require("./src/routes/userRoutes");
const officeRoutes = require("./src/routes/officeRoutes");
const contactRoutes = require("./src/routes/contactRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const promoRoutes = require("./src/routes/promoRoutes");
const pricingPlanRouter = require("./src/routes/pricingPlans");
const planRoutes = require("./src/routes/planRoutes");
// const invoiceRoutes = require("./src/routes/invoice");

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/user", userRoutes);
app.use("/api/office", officeRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/promocode", promoRoutes);
app.use("/api/pricing-plans", pricingPlanRouter);
app.use("/api/plans", planRoutes);
// app.use("/api/invoice", invoiceRoutes);

app.use(errorHandler);

const initializeApp = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");

    await createDefaultAdmin();
    console.log("✅ Admin user checked/created");
  } catch (error) {
    console.error("❌ Initialization failed:", error.message);

    process.exit(1);
  }
};

const startServer = () => {
  const PORT = process.env.PORT || 4000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    server.close(() => process.exit(1));
  });

  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    server.close(() => process.exit(1));
  });
};

if (require.main === module) {
  initializeApp()
    .then(startServer)
    .catch((error) => {
      console.error("Failed to start application:", error);
      process.exit(1);
    });
}

module.exports = app;
