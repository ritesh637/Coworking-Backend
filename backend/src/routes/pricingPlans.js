const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");
const express = require("express");
const router = express.Router();
const pricingPlanController = require("../controllers/pricingPlansController");

// Create a new pricing plan
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  pricingPlanController.createPricingPlan
);

// Get all pricing plans
router.get("/", pricingPlanController.getAllPricingPlans);

// Get a single pricing plan by ID
router.get("/:id", pricingPlanController.getPricingPlanById);

// Update a pricing plan by ID
router.put("/:id", pricingPlanController.updatePricingPlan);

// Delete a pricing plan by ID
router.delete("/:id", pricingPlanController.deletePricingPlan);

module.exports = router;
