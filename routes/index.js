const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const categoryRoutes = require("./categoryRoutes");
const articleRoutes = require("./articleRoutes");

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/articles", articleRoutes);

module.exports = router;
