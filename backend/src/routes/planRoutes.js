const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");
const express = require("express");
const {
  createPlan,
  getAllPlans,
  updatePlan,
  deletePlan,
  getPlansByOfficeId
} = require("../controllers/planController");

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createPlan); // Create plan
router.get("/", getAllPlans); // Get all plans
router.get("/office/:id", getPlansByOfficeId);
router.put("/:id", authMiddleware, adminMiddleware, updatePlan); // Update plan
router.delete("/:id", authMiddleware, adminMiddleware, deletePlan); // Delete plan

module.exports = router;
