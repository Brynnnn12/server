const { Category } = require("../models");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({
      status: "success",
      results: categories.length,
      data: {
        categories,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params; // Get the category ID from the request parameters
  try {
    const [updated] = await Category.update(req.body, {
      where: { id },
    });

    if (updated) {
      const updatedCategory = await Category.findOne({ where: { id } });
      return res.status(200).json({
        status: "success",
        data: {
          category: updatedCategory,
        },
      });
    }

    return res.status(404).json({
      status: "fail",
      message: "Category not found",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params; // Get the category ID from the request parameters
  try {
    const deleted = await Category.destroy({
      where: { id },
    });

    if (deleted) {
      return res.status(200).json({
        status: "success",
        message: "Category deleted successfully",
      });
    }

    return res.status(404).json({
      status: "fail",
      message: "Category not found",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
