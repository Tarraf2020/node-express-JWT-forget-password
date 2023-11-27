const Category = require("../models/categoryModel");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res
      .status(200)
      .json({ message: "Categories found successfully.", data: categories });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllOneCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({ _id: id });
    return res.status(200).json({
      message: `Category of ${id} found successfully.`,
      data: category,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.createCategory = async function (req, res) {
  try {
    let { name } = req.body;
    const checkCategory = await Category.findOne({ name });
    if (checkCategory) {
      return res.status(409).json({ message: "Category already exist." });
    }

    const newCat = await Category.create({ name });
    return res
      .status(201)
      .json({ message: "Category created successfully.", data: newCat });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCategory = async function (req, res) {
  try {
    let { name, _id } = req.body;
    const checkCategory = await Category.findOne({ _id });
    if (!checkCategory) {
      return res.status(409).json({ message: "Category doest not exist." });
    }
    if (name == checkCategory.name) {
      return res.status(409).json({ message: "Category have the same name." });
    }

    const newCat = await Category.updateOne({ _id }, { name });
    return res
      .status(200)
      .json({ message: "Category updated successfully.", data: newCat });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try { 
    const { id } = req.params;
    await Category.deleteOne({ _id: id });
    return res.status(200).json({
      message: `Category of ${id} deleted successfully.`,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
