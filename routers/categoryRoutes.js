const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/categoryController");

const auth = require("../controllers/userController");

router.get("/getAll", auth.protect, CategoryController.getAllCategories);
router.get("/get/:id", auth.protect, CategoryController.getAllOneCategory);
router.post("/create", auth.protect, CategoryController.createCategory);
router.patch("/update", auth.protect, CategoryController.updateCategory);
router.delete("/delete/:id", auth.protect, CategoryController.deleteCategory);

module.exports = router;
