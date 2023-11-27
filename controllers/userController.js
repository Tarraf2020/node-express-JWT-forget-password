const User = require("../models/userModel");
const validator = require("validator");
// const bcrypt = require("bcrypt"); //always hash the password
const { sendMail } = require("../utils/email");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { decode } = require("punycode");

// to create a jwt token we should split the process into two parts
// 1: create a function that will sign a token
// to sign a token we should provide 3 main factors.
// factor 1: a unique field from the user: we choose always the id
// factor 2: JWT_SECRET
// factor 3: JWT_EXPIRES_IN

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// 2: create a function that will send the token to the user

const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);

  res
    .status(statusCode)
    .json({ status: "success", token, data: { user, message } });
};

exports.signup = async (req, res) => {
  try {
    let { email, fullName, username, password, passwordConfirm } = req.body;
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email." });
    }
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(409).json({ message: "User already exist." });
    }
    if (password !== passwordConfirm) {
      return res
        .status(400)
        .json({ message: "Password and password confirm are not the same." });
    }

    // we use this or we use the function in the user models in the buttum
    // const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      fullName,
      email,
      password,
      username,
      //   password: hashedPassword,
    });
    let message = "User created successfully.";
    createSendToken(newUser, 201, res, message);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({ message: "User not found." });
    }
    // we can use this or the function in the userModels
    // const comparePass = await blurred.compare(password, user.password);
    // if (!comparePass) {
    //   res.status(401).json({ message: "incorrect credentials" });
    // }

    if (!(await user.checkPassword(password, user.password))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    let message = "User logged in successfully.";
    createSendToken(user, 200, res, message);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    // 1 - check if the user with provided email exist
    // const user = await User.findOne({$or:[{ email: req.body.email },{ phoneNumber: req.body.phoneNumber }]});
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "The user with the provided email does not exist" });
    }

    // 2 - create the reset token to be sended via email
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3 - send token via email
    // HTTP://localhost:3000/api/auth/resetPassword/ygoeufgyoqeryfg7373rfy
    // 3.1 : Create this url
    const url = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/resetPasord/${resetToken}`;

    const message = `Forgot your password? Reset it by visiting the following link: ${url}`;

    try {
      await sendMail({
        email: user.email,
        subject: "Your password reset token: (valid for 10 minutes)",
        message,
      });
      res.status(200).send({
        status: "success",
        message: "The reset link was delivered to your email successfully.",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(500).json({
        message:
          "An error occured while trying to reset your password, please try again in a moment.",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256") // crpto graphic algorithm
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        message:
          "The token is invalid or expired. Please try again in a moment",
      });
    }
    if (req.body.password.length < 8) {
      return res.status(400).json({
        message: "Password length is too short.",
      });
    }
    if (req.body.password !== req.body.passwordConfirm) {
      return res
        .status(400)
        .json({ message: "Password and password confirm are not the same." });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (err) {
    console.log(err);
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1: check if the token owner still exist
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({
        message: "You are not logged in. Please login to get access.",
      });
    }
    // 2: verify the token
    let decoded;
    try {
      // jwt verify is synchronous and this will create a problem since we can't stop everything and wait for it so we use promisify to make the function asynchronous
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ message: "Invalid JWT token, login again." });
      } else if (error.name === "TokenExpiredError") {
        return res
          .status(403)
          .json({ message: "Your session token has expired" });
      }
    }
    // 3: check if the token owner exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        message: "The user belonging to this session does not longer exist.",
      });
    }
    // 4: check if the owner change the password after the token was created
    // iat: the time where token was created
    // exp: the time when the token expired
    if (currentUser.passwordChangedAfterTokenIssued(decoded.id)) {
      return res.status(401).json({
        message: "Your password has been changed. please login again.",
      });
    }
    // 5: if everything is okay; add the user to all the requests (req.user = currentUser)
    req.user = currentUser;
    next();
  } catch (error) {
    console.log(error);
  }
};
