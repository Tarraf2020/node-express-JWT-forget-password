const express = require("express");
const router = express.Router();
const ItemController = require("../controllers/itemController");

const auth = require("../controllers/userController");

router.get("/getAll", auth.protect, ItemController.getItems);
router.get("/get/:id", auth.protect, ItemController.getOneItem);
router.post("/create", auth.protect, ItemController.createItem);
router.patch("/update", auth.protect, ItemController.updateItem);
router.delete("/delete/:id", auth.protect, ItemController.deleteItem);

module.exports = router;
