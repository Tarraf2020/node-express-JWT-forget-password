const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto"); // built in with node

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: "string",
      required: [true, "please enter your full name"],
      trim: true, //remove white spaces
    },
    username: {
      type: "string",
      required: [true, "please enter your username"],
      trim: true, //remove white spaces
      minLength: 5,
    },
    email: {
      type: "string",
      required: [true, "please enter your email"],
      trim: true,
      unique: true,
      lowercase: true, // accept only lowercase characters
    },
    password: {
      type: "string",
      minLength: 8,
      trim: true,
      maxLength: 30,
    },
    passwordConfirm: {
      type: "string",
      minLength: 8,
      trim: true,
      maxLength: 30,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// automated function for hashing
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("email")) {
      return next(); //if the password field is not modified go to the next function and don't wait
    }
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; // passwordConfirm wont be saved in database since its undifined
    this.pass;
  } catch (err) {
    console.log({ err });
  }
});

// this function will always return boolean
userSchema.methods.checkPassword = async function (
  candidatePass, // coming from the frontend as plain text
  userPass // cpmming from database as hashed value
) {
  return await bcrypt.compare(candidatePass, userPass);
};

// this function will create a random reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex"); // will be sent via email

  // saved in the database in a hashed way
  this.passwordResetToken = crypto
    .createHash("sha256") // crpto graphic algorithm
    .update(resetToken)
    .digest("hex"); // its shape will be hexa decimal

  // it have 10 min of validaty
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// This function will check if the password was changed after issuing the jwt token
userSchema.methods.passwordChangedAfterTokenIssued = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangeTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return passwordChangeTime > JWTTimestamp;
  }
  return false;
};

module.exports = mongoose.model("User", userSchema);
