const mongoose = require("mongoose");
const Item = require("../models/itemModel");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: "string",
      required: [true, "Please enter a name."],
      trim: true, // remove white spaces
      unique: true,
    },
  },
  { timestamps: true }
);

// Define a pre-remove middleware that checks for linked items
categorySchema.pre("remove", async function (next) {
  const category = this;

  // Check if there are any items linked to this category
  const items = await Item.find({ category: category._id });

  if (items.length > 0) {
    // There are linked items, prevent category deletion
    const err = new Error("Cannot delete category with linked items.");
    return next(err);
  }

  // No linked items found, proceed with category deletion
  next();
});

module.exports = mongoose.model("Category", categorySchema);
