const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const {
  validateEditProfileData,
  validateOldPassword,
} = require("../utils/validation");
const validator = require("validator");
ConnectionRequestModel = require("../models/connectionRequest");
const bcrypt = require("bcrypt");
const user = require("../models/user");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  const userConnections = await ConnectionRequestModel.find({
    status: "accepted",
    $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }],
  });
  const requestCount = await ConnectionRequestModel.countDocuments({
    status: "interested",
    toUserId: req.user._id,
  });
  const data = {
    ...req.user.toObject(),
    userConnections: userConnections.length,
    requestCount,
  };
  res.send(data);
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Sensetive fields cant be updated");
    }

    const updatedData = await user.findByIdAndUpdate(req.user._id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    res.json({ message: "Profile is updated", updatedData });
  } catch (err) {
    res.send(err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { oldPasswordByUser, newPasswordByuser } = req.body;
    await validateOldPassword(oldPasswordByUser, req.user.password);

    if (validator.isStrongPassword(newPasswordByuser)) {
      req.user.password = await bcrypt.hash(newPasswordByuser, 10);
      await req.user.save();
      res.send("password is updated");
    } else {
      throw new Error("New password is not strong enough");
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

profileRouter.delete("/profile/delete", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    await ConnectionRequestModel.deleteMany({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    });

    const userData = await user.findByIdAndDelete(userId);

    if (!userData) {
      return res.status(404).send("User not found");
    }

    res.send("Account deleted successfully");
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).send("Something went wrong");
  }
});

module.exports = profileRouter;
