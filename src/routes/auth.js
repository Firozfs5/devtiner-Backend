const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const ConnectionRequestModel = require("../models/connectionRequest");
const sendEmail = require("../utils/sendEmail");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req.body);

    //recieving data from frontend
    const { emailId, password, firstName, lastName } = req.body;

    const exisitngUser = await User.findOne({ emailId });
    if (exisitngUser) throw new Error("Email already exists");

    //hashing password
    const hashPassword = await bcrypt.hash(password, 10);

    //account creation
    const newUser = new User({
      emailId,
      password: hashPassword,
      firstName,
      lastName,
    });

    await newUser.save();

    //sending email
    sendEmail(newUser.emailId, newUser.firstName).catch((err) =>
      console.error("Email sending failed:", err),
    );
    res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPassowrdValid = await user.validatePassword(password);
    if (!isPassowrdValid) {
      throw new Error("Invalid Credentials");
    } else {
      const userConnections = await ConnectionRequestModel.find({
        status: "accepted",
        $or: [{ fromUserId: user._id }, { toUserId: user._id }],
      });

      const requestCount = await ConnectionRequestModel.countDocuments({
        status: "interested",
        toUserId: user._id,
      });

      const data = {
        ...user.toObject(),
        userConnections: userConnections.length,
        requestCount,
      };
      const token = await user.getJWT();
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.send(data);
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
