const { Article, Category } = require("../models");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

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
      // image: `/uploads/${req.file.filename}`,
      image: req.file.path, // URL gambar dari Cloudinary
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

// exports.updateArticle = async (req, res) => {
//   const { id } = req.params; // Ambil ID artikel dari params

//   try {
//     const article = await Article.findOne({ where: { id } });

//     if (!article) {
//       return res.status(404).json({
//         status: "fail",
//         message: "Article not found",
//       });
//     }

//     console.log("File Upload:", req.file);
//     console.log("Body Data:", req.body);

//     let newImagePath = article.image; // Default tetap gambar lama

//     if (req.file) {
//       // Hapus gambar lama jika ada
//       if (article.image) {
//         const oldImagePath = path.join(
//           __dirname,
//           "..",
//           "public",
//           article.image
//         );

//         fs.unlink(oldImagePath, (err) => {
//           if (err) {
//             console.error("Error deleting old image:", err);
//           } else {
//             console.log("Old image deleted:", oldImagePath);
//           }
//         });
//       }

//       // Simpan path gambar baru
//       newImagePath = `/uploads/${req.file.filename}`;
//     }

//     // Update data lain
//     const { title, description, content, categoryId } = req.body;

//     const slug = title
//       .toLowerCase()
//       .replace(/[^a-zA-Z0-9]/g, "-")
//       .replace(/-+/g, "-");

//     await article.update({
//       slug,
//       title,
//       description,
//       content,
//       categoryId,
//       image: newImagePath, // Pastikan path gambar baru tersimpan
//     });

//     res.status(200).json({
//       status: "success",
//       data: { article },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "fail",
//       message: error.message,
//     });
//   }
// };
exports.updateArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await Article.findOne({ where: { id } });

    if (!article) {
      return res.status(404).json({
        status: "fail",
        message: "Article not found",
      });
    }

    let newImagePath = article.image; // Default tetap gambar lama

    // ✅ Jika ada gambar baru, hapus gambar lama terlebih dahulu
    if (req.file && article.image && article.image.includes("cloudinary.com")) {
      try {
        const imageUrlParts = article.image.split("/");
        const imagePublicId = imageUrlParts.slice(-2).join("/").split(".")[0];

        // console.log("🛠 Deleting old Cloudinary image:", imagePublicId);

        await cloudinary.uploader.destroy(imagePublicId)
          // .then(result => console.log("✅ Old image deleted:", result))
          // .catch(error => console.error("❌ Error deleting old image:", error));
      } catch (error) {
        console.error("❌ Error extracting public_id:", error);
      }

      // ✅ Simpan URL gambar baru dari Cloudinary
      newImagePath = req.file.path;
    }

    const { title, description, content, categoryId } = req.body;
    const slug = title.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-");

    // ✅ Update artikel dengan data baru
    await article.update({
      slug,
      title,
      description,
      content,
      categoryId,
      image: newImagePath, // Simpan URL baru jika ada
    });

    res.status(200).json({
      status: "success",
      data: { article },
    });
  } catch (error) {
    console.error("❌ Error in updateArticle:", error);
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// exports.deleteArticle = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const article = await Article.findOne({ where: { id } });

//     if (!article) {
//       return res.status(404).json({
//         status: "fail",
//         message: "Article not found",
//       });
//     }

//     // Path gambar
//     const imagePath = path.join(__dirname, "..", "public", article.image);
    
//     // Cek apakah file gambar ada sebelum menghapus
//     if (fs.existsSync(imagePath)) {
//       fs.unlink(imagePath, (err) => {
//         if (err) {
//           console.error("Error deleting image:", err);
//         } else {
//           console.log("Image deleted successfully:", article.image);
//         }
//       });
//     } else {
//       console.log("Image not found, skipping deletion:", article.image);
//     }

//     // Hapus artikel dari database
//     await article.destroy();

//     res.status(200).json({
//       status: "success",
//       message: "Article deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting article:", error);
//     res.status(400).json({
//       status: "fail",
//       message: error.message,
//     });
//   }
// };


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

    // Jika gambar ada, hapus dari Cloudinary
    if (article.image) {
      // Contoh URL: "https://res.cloudinary.com/dulrbyirx/image/upload/v1742031956/uploads/1742031951318-73144551.jpg"
      const imageUrlParts = article.image.split("/"); // Pisahkan berdasarkan "/"
      const imageName = imageUrlParts[imageUrlParts.length - 1].split(".")[0]; // Ambil nama file tanpa ekstensi
      const folderName = imageUrlParts[imageUrlParts.length - 2]; // Ambil nama folder (uploads)

      const imagePublicId = `${folderName}/${imageName}`; // Hasilnya: "uploads/1742031951318-73144551"

      // Hapus dari Cloudinary
      await cloudinary.uploader.destroy(imagePublicId)
        // .then(result => console.log("✅ Image deleted from Cloudinary:", result))
        // .catch(error => console.error("❌ Error deleting image from Cloudinary:", error));
    }

    // Hapus artikel dari database
    await article.destroy();

    res.status(200).json({
      status: "success",
      message: "Article deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};