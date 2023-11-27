const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");

router.post("/signup", UserController.signup);
router.post("/login", UserController.login);
router.post("/forgotPassword", UserController.forgotPassword);
router.post("/resetPassword/:token", UserController.resetPassword);

module.exports = router;
