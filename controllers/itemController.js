const Item = require("../models/itemModel");
const Category = require("../models/categoryModel");

exports.getItems = async (req, res) => {
  try {
    const items = await Item.find().populate({
      path: "category",
      select: "name", // Specify the fields you want to retrieve from the populated category
    });
    return res
      .status(200)
      .json({ message: "Items found successfully.", data: items });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getOneItem = async (req, res) => {
  try {
    let { id } = req.params;
    const item = await Item.findOne({ _id: id }).populate({
      path: "category",
      select: "name", // Specify the fields you want to retrieve from the populated category
    });
    if (!item) {
      return res.status(409).json({ message: "Item not found." });
    }
    return res
      .status(200)
      .json({ message: "Item found successfully.", data: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    let { title, description, category } = req.body;
    const checkCategory = await Category.findOne({ _id: category });
    if (!checkCategory) {
      return res.status(409).json({ message: "Category doest not exist." });
    }
    const newItem = await Item.create({ title, description, category });
    return res
      .status(201)
      .json({ message: "Items created successfully.", data: newItem });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    let { title, description, category } = req.body;

    const item = await Item.findOne({ _id: id });
    if (!item) {
      return res.status(409).json({ message: "Item not found." });
    }

    const checkCategory = await Category.findOne({ _id: category });
    if (!checkCategory) {
      return res.status(409).json({ message: "Category doest not exist." });
    }

    const newItem = await Item.updateOne({ _id: id}, { title, description, category });
    return res
      .status(200)
      .json({ message: "Items updated successfully.", data: newItem });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteItem = async (req, res) => {
    try {
      const { id } = req.params;
      await Item.deleteOne({ _id: id });
      return res.status(200).json({
        message: `Item of ${id} deleted successfully.`,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
