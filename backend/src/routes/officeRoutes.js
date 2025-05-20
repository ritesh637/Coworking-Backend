const express = require("express");
const router = express.Router();
const officeController = require("../controllers/officeController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");
const { uploadOfficeImages } = require("../config/cloudinary");

// Get office by ID
router.get("/:id", officeController.getOfficeById);

// Get all offices with search and pagination
router.get("/", officeController.getAllOffices);

// Create a new office
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  uploadOfficeImages,
  officeController.createOffice
);

// Update an existing office
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  uploadOfficeImages,
  officeController.updateOffice
);

// Delete an office by ID
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  officeController.deleteOffice
);

module.exports = router;
