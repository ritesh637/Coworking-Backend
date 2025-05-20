// models/Payment.js
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  cartItems: [
    {
      plan: String,
      price: Number,
      startDate: String,
      endDate: String,
      startTime: String,
      endTime: String,
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  invoiceNumber: {
    type: Number,
    default: 1,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  invoiceId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);

// const express = require("express");
// const moment = require("moment");
// const Invoice = require("../models/invoice"); // Use imported model

// const router = express.Router();

// // Function to generate invoice serial number
// const generateInvoiceSerialNumber = async () => {
//   const today = moment().format("MMMDD"); // Get 'Apr25' format
//   const count = await Invoice.countDocuments({}); // Count all invoices
//   const serialNumber = `Pro_${today}_${(count + 1)
//     .toString()
//     .padStart(3, "0")}`;
//   return serialNumber;
// };

// // Route to create an invoice after successful or failed payment
// router.post("/create", async (req, res) => {
//   const { customer, amount, gst, paymentStatus } = req.body;

//   try {
//     const serialNumber = await generateInvoiceSerialNumber();

//     const newInvoice = new Invoice({
//       serialNumber,
//       customer,
//       amount,
//       gst,
//       status: paymentStatus,
//     });

//     await newInvoice.save();
//     res.status(201).json(newInvoice);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating invoice", error });
//   }
// });

// module.exports = router;
