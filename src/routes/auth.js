const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { validateSignUpData } = require("../utils/validation");

authRouter.post("/signup", async (req, res) => {
  try {
    //validating Data
    validateSignUpData(req);

    const { firstName, lastName, password, emailId } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save();
    console.log("data is saved");
    res.send("data saved");
  } catch (err) {
    console.error("there was error ", err);
    res.send("data couldnt saved");
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    const { emailId, password } = req.body;
    console.log(emailId + " " + password);
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPassowrdValid = await user.validatePassword(password);
    if (!isPassowrdValid) {
      throw new Error("Invalid Credentials");
    } else {
      const token = await user.getJWT();
      res.cookie("token", token);
      res.send("Login successfull");
    }
  } catch (err) {
    res.status(400).send("ERROR :" + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  // res.clearCookie("token");
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("user is logged out");
});

module.exports = authRouter;
