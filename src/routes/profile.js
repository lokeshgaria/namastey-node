const express = require("express");
const { SUCCESS } = require("../utils/constants/Success/index");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res, next) => {
  try {
    res.send({ message: SUCCESS.DATA_FETCHED, success: true, user: req.user });
  } catch (error) {
    res.status(400).send({ message: error.message, success: false });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res, next) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid edit request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();
    res.status(200).send({
      message: "Profile updated successfuly",
      user: loggedInUser,
    });
  } catch (error) {
    res.status(400).send({ message: error.message, success: false });
  }
});

module.exports = profileRouter;
