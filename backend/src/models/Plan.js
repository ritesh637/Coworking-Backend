// const mongoose = require("mongoose");

// const planSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     price: { type: Number, required: true },
//     category: {
//       type: String,
//       enum: ["hourly", "daily", "monthly"],
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.models.Plan || mongoose.model("Plan", planSchema);

const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: ["hourly", "daily", "monthly"],
      required: true,
    },
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true, // Every plan must be associated with an office
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Plan || mongoose.model("Plan", planSchema);
