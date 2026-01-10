const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^(\+91|0)?[6-9]\d{9}$/,
        "Please enter a valid Indian phone number",
      ],
     default: "9999999999",
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    age: { type: Number },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error(
            "Invalid Gender gender, Allowed genders are male, female, others"
          );
        }
      },
    },
    password: { type: String },
    photoUrl: {
      type: String,
      default:
        "https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg?semt=ais_hybrid&w=740&q=80",
    },
    about: {
      type: String,
      default: "this is a default url here",
    },
    skills: {
      type: [String],
    },
    isPremium: {
      type: Boolean,
      default: false, // All new users start as non-premium
    },
    membershipType: {
      type: String,
      default: "free",
    },
  },
  {
    timestamps: true,
  }
);
//always use og function methods not arrow method

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_ENCODE_KEY, {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = this.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );

  return isPasswordValid;
};
const User = mongoose.model("User", userSchema);
module.exports = { User };
