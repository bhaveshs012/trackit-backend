import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { ApiResponse } from "../utils/ApiResponse.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Set a size limit (in bytes)
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

// Configure Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "pdf"],
    public_id: (req, file) => `${Date.now()}_${file.originalname}`,
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_SIZE }, // Set file size limit
});

// Middleware to handle multer errors
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle multer-specific errors
    return res
      .status(400)
      .json(new ApiResponse(400, "", `File size exceeds the limit of 2 MB!`));
  } else if (err) {
    return res
      .status(500)
      .json(new ApiResponse(500, "", "An unexpected error occurred."));
  }
  next();
};

export { upload, multerErrorHandler };
