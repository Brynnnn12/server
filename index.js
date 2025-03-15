// File: index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

const routes = require("./routes");
const sequelize = require("./config/database");
const errorHandler = require("./middleware/error");



const app = express();

const fs = require("fs");

const uploadDir = path.join(__dirname, "public/uploads");

// Cek apakah folder ada, jika tidak buat folder
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 Folder 'public/uploads' telah dibuat.");
}

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://articles-new.vercel.app",
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true, // Jika menggunakan cookie atau token
  })
);

// Handle preflight request secara manual (opsional, jika masih error)
app.options("*", cors());


app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

// Database connection and server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // Sync database (in development only)
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("Database synced");
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
