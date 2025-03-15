// const multer = require("multer");
// const path = require("path");

// // Konfigurasi penyimpanan file
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/uploads"); // Simpan di folder public/uploads
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
//     cb(null, filename);
//   },
// });

// // Filter jenis file yang diperbolehkan
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error("Hanya file gambar (JPG, PNG, GIF) yang diperbolehkan"),
//       false
//     );
//   }
// };

// // Batas ukuran file 2MB
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
//   fileFilter: fileFilter,
// });

// // Ekspor instance multer, bukan sebagai objek
// module.exports = upload;
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Filter format file yang diperbolehkan
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar (JPG, PNG, GIF) yang diperbolehkan"), false);
  }
};

// Konfigurasi penyimpanan di Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // Folder di Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
    transformation: [
      { width: 800, height: 600, crop: "limit", quality: "auto" },
    ], // Optimasi gambar
    public_id: (req, file) => `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  },
});

// Middleware upload dengan batas ukuran 2MB
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: fileFilter,
});

module.exports = upload;
