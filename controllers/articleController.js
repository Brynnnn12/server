const { Article, Category } = require("../models");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const path = require("path");

exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.findAll({
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      results: articles.length,
      data: {
        articles,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { title, description, content, categoryId } = req.body;

    const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-");

    const article = await Article.create({
      id: uuidv4(),
      slug,
      title,
      description,
      content,
      categoryId,
      image: `/uploads/${req.file.filename}`,
    });

    res.status(201).json({
      status: "success",
      data: {
        article,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!article) {
      return res.status(404).json({
        status: "fail",
        message: "Article not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        article,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.updateArticle = async (req, res) => {
  const { id } = req.params; // Ambil ID artikel dari params

  try {
    const article = await Article.findOne({ where: { id } });

    if (!article) {
      return res.status(404).json({
        status: "fail",
        message: "Article not found",
      });
    }

    console.log("File Upload:", req.file);
    console.log("Body Data:", req.body);

    let newImagePath = article.image; // Default tetap gambar lama

    if (req.file) {
      // Hapus gambar lama jika ada
      if (article.image) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          "public",
          article.image
        );

        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Error deleting old image:", err);
          } else {
            console.log("Old image deleted:", oldImagePath);
          }
        });
      }

      // Simpan path gambar baru
      newImagePath = `/uploads/${req.file.filename}`;
    }

    // Update data lain
    const { title, description, content, categoryId } = req.body;

    const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-");

    await article.update({
      slug,
      title,
      description,
      content,
      categoryId,
      image: newImagePath, // Pastikan path gambar baru tersimpan
    });

    res.status(200).json({
      status: "success",
      data: { article },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.deleteArticle = async (req, res) => {
  const { id } = req.params;
  try {
    const article = await Article.findOne({ where: { id } });

    if (!article) {
      return res.status(404).json({
        status: "fail",
        message: "Article not found",
      });
    }

    // Path gambar
    const imagePath = path.join(__dirname, "..", "public", article.image);
    
    // Cek apakah file gambar ada sebelum menghapus
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image:", err);
        } else {
          console.log("Image deleted successfully:", article.image);
        }
      });
    } else {
      console.log("Image not found, skipping deletion:", article.image);
    }

    // Hapus artikel dari database
    await article.destroy();

    res.status(200).json({
      status: "success",
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
