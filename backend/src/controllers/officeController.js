const Office = require("../models/OfficeModel");
const { cloudinary } = require("../config/cloudinary");

// Helper function to delete images from Cloudinary
const deleteImagesFromCloudinary = async (images) => {
  try {
    for (const image of images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
  } catch (error) {
    console.error("Error deleting images from Cloudinary:", error);
  }
};

// @desc    Get office by ID
const getOfficeById = async (req, res) => {
  try {
    const office = await Office.findOne({ id: req.params.id });
    if (!office) return res.status(404).json({ message: "Office not found" });
    res.json(office);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all offices with pagination and search
const getAllOffices = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 6 } = req.query;
    const query = {
      $or: [
        { name: new RegExp(search, "i") },
        { location: new RegExp(search, "i") },
      ],
    };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Office.countDocuments(query);
    const offices = await Office.find(query).skip(skip).limit(parseInt(limit));

    res.json({ total, page: +page, limit: +limit, offices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new office
const createOffice = async (req, res) => {
  console.log("The office create api is activated 👉", req.file);
  try {
    // Process uploaded files
    const imageThumbnail = req.files?.imageThumbnail?.[0]
      ? {
          url: req.files.imageThumbnail[0].path,
          public_id: req.files.imageThumbnail[0].filename,
        }
      : null;

    const centerImages = req.files?.centerImages
      ? req.files.centerImages.map((file) => ({
          url: file.path,
          public_id: file.filename,
        }))
      : [];

    // Prepare office data
    const officeData = {
      ...req.body,
      id: "office_" + Date.now(),
    };

    if (imageThumbnail) {
      officeData.imageThumbnail = imageThumbnail.url;
    }

    if (centerImages.length > 0) {
      officeData.centerImages = centerImages;
    }

    // Parse operatingHours if it's a string
    if (typeof officeData.operatingHours === "string") {
      try {
        officeData.operatingHours = JSON.parse(officeData.operatingHours);
      } catch (e) {
        officeData.operatingHours = {
          "Mon-Sat": "9AM to 9PM",
          Sunday: "Closed",
        };
      }
    }

    // Create and save the office
    const office = new Office(officeData);
    const newOffice = await office.save();
    res.status(201).json(newOffice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an existing office
const updateOffice = async (req, res) => {
  try {
    const office = await Office.findOne({ id: req.params.id });
    if (!office) return res.status(404).json({ message: "Office not found" });

    // Process uploaded files
    let updates = { ...req.body };

    if (req.files?.imageThumbnail?.[0]) {
      // Delete old thumbnail if exists
      if (office.imageThumbnail) {
        await cloudinary.uploader.destroy(office.imageThumbnail.public_id);
      }
      updates.imageThumbnail = {
        url: req.files.imageThumbnail[0].path,
        public_id: req.files.imageThumbnail[0].filename,
      };
    }

    if (req.files?.centerImages && req.files.centerImages.length > 0) {
      const newCenterImages = req.files.centerImages.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
      updates.centerImages = [...office.centerImages, ...newCenterImages];
    }

    // Handle deleted images
    if (req.body.deletedImages) {
      const deletedImages = Array.isArray(req.body.deletedImages)
        ? req.body.deletedImages
        : JSON.parse(req.body.deletedImages);

      const imagesToDelete = office.centerImages.filter((img) =>
        deletedImages.includes(img.public_id)
      );

      await deleteImagesFromCloudinary(imagesToDelete);

      updates.centerImages = office.centerImages.filter(
        (img) => !deletedImages.includes(img.public_id)
      );
    }

    // Parse operatingHours if needed
    if (typeof updates.operatingHours === "string") {
      try {
        updates.operatingHours = JSON.parse(updates.operatingHours);
      } catch (e) {
        // Keep existing operating hours if parsing fails
        delete updates.operatingHours;
      }
    }

    // Update the office
    const updatedOffice = await Office.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true }
    );

    res.json(updatedOffice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an office by ID
const deleteOffice = async (req, res) => {
  try {
    const office = await Office.findOne({ id: req.params.id });
    if (!office) return res.status(404).json({ message: "Office not found" });

    // Delete all images from Cloudinary
    if (office.imageThumbnail) {
      await cloudinary.uploader.destroy(office.imageThumbnail.public_id);
    }
    await deleteImagesFromCloudinary(office.centerImages);

    // Delete the office
    await Office.findOneAndDelete({ id: req.params.id });

    res.json({ message: "Office deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOfficeById,
  getAllOffices,
  createOffice,
  updateOffice,
  deleteOffice,
};
