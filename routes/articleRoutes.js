const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const { protect, restrictTo } = require("../middleware/auth");
const upload = require("../middleware/fileUploads"); // Panggil middleware upload

// Public route untuk mendapatkan semua artikel
router.get("/", articleController.getAllArticles);
// Route untuk mendapatkan artikel berdasarkan slug
router.get("/:slug", articleController.getArticleBySlug);


// Middleware proteksi (aktifkan jika sudah siap)
router.use(protect);
router.use(restrictTo("admin"));

// Route untuk membuat artikel dengan gambar
router.post("/", upload.single("image"), articleController.createArticle);


// Route untuk mengupdate artikel berdasarkan ID
router.put("/:id", upload.single("image"), articleController.updateArticle);

// Route untuk menghapus artikel berdasarkan ID
router.delete("/:id", articleController.deleteArticle);

module.exports = router;
