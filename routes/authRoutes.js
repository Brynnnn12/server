const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth"); // Pastikan middleware di-import

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getUser);

module.exports = router;
