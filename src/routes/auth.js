const express = require("express");
const { validateSingupData } = require("../utils/validation");
const { User } = require("../model/userSchema");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const { ERRORS } = require("../utils/constants/Errors/index");
 


authRouter.post("/signup", async (req, res, next) => {
  validateSingupData(req);

  const { password, lastName, email, firstName } = req.body;
  // Encrypt the passwprd
  const passwordHash = await bcrypt.hash(password, 10);
  console.log("pass", passwordHash);
  try {
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });
    await user.save();
    res.status(201).send({ message: "user added successfully", user });
  } catch (e) {
    res.status(400).send("ERROR : " + e.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // never expose the DB terms
      throw new Error(ERRORS.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      // Create a jwt token
      const token = await user.getJWT();

      // Add the token to cookie and send to response back to the user
      res.cookie("token", token);
      res.send({ message: "Login Succesful!!", success: true });
    } else {
      res
        .status(400)
        .send({ message: ERRORS.INVALID_CREDENTIALS, success: false });
    }
  } catch (error) {
    res.status(400).send({ message: error.message, success: false });
  }
});


authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token",null,{
        expires: new Date(Date.now())
    })
    res.send({
        message:"Logout success", 
        success:true
    })
  } catch (error) {
    res.status(400).send({ message: error.message, success: false });
  }
});
module.exports=authRouter
