const mongoose = require("mongoose");

const PricingPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  features: [String],
  badge: String,
  highlight: { type: Boolean, default: false },
});

module.exports = mongoose.model("PricingPlan", PricingPlanSchema);
