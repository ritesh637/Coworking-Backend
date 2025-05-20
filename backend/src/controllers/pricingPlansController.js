const PricingPlan = require("../models/PricingPlan");

// Create a new pricing plan
exports.createPricingPlan = async (req, res) => {
  try {
    const { name, price, features, badge, highlight } = req.body;

    const newPlan = new PricingPlan({
      name,
      price,
      features,
      badge,
      highlight,
    });

    await newPlan.save();
    res
      .status(201)
      .json({ message: "Pricing plan created successfully", newPlan });
  } catch (error) {
    res.status(500).json({ message: "Error creating pricing plan", error });
  }
};

// Get all pricing plans
exports.getAllPricingPlans = async (req, res) => {
  try {
    const plans = await PricingPlan.find();
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pricing plans", error });
  }
};

// Get a single pricing plan by ID
exports.getPricingPlanById = async (req, res) => {
  try {
    const plan = await PricingPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Pricing plan not found" });
    }
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pricing plan", error });
  }
};

// Update a pricing plan by ID
exports.updatePricingPlan = async (req, res) => {
  try {
    const updatedPlan = await PricingPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: "Pricing plan not found" });
    }

    res
      .status(200)
      .json({ message: "Pricing plan updated successfully", updatedPlan });
  } catch (error) {
    res.status(500).json({ message: "Error updating pricing plan", error });
  }
};

// Delete a pricing plan by ID
exports.deletePricingPlan = async (req, res) => {
  try {
    const plan = await PricingPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Pricing plan not found" });
    }

    res.status(200).json({ message: "Pricing plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting pricing plan", error });
  }
};
