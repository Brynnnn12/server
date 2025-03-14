const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { protect, restrictTo } = require("../middleware/auth");

// Public route to get all categories
router.get("/", categoryController.getAllCategories);

// Protect all routes after this middleware
router.use(protect);

// Only admin can access routes after this
router.use(restrictTo("admin"));

// Admin routes for creating, updating, and deleting categories
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory); // Route to update a category
router.delete("/:id", categoryController.deleteCategory); // Route to delete a category

module.exports = router;
