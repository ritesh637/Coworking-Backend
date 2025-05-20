const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configurations
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    return {
      folder:
        file.fieldname === "imageThumbnail"
          ? "office_spaces/thumbnails"
          : "office_spaces/center_images",
      allowed_formats: ["jpg", "jpeg", "png"],
      transformation:
        file.fieldname === "imageThumbnail"
          ? [{ width: 800, height: 600, crop: "limit" }]
          : [{ width: 1200, height: 800, crop: "limit" }],
    };
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};
 

// Upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// Combined middleware
exports.uploadOfficeImages = upload.fields([
  { name: "imageThumbnail", maxCount: 1 },
  { name: "centerImages", maxCount: 10 },
]);

exports.cloudinary = cloudinary;
