//mongo db user schema
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: "string",
      required: [true, "Please enter a title."],
      trim: true, // remove white spaces
    },
    description: {
      type: "string",
      required: [true, "Please enter your description."],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Assign this item to a category."],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
