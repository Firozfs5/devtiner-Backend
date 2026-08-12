const express = require("express");
const profileRouter = express.Router();
const user = require("../models/user");
const { userAuth } = require("../middleware/auth");
const {
  validateEditProfileData,
  validateOldPassword,
} = require("../utils/validation");
const validator = require("validator");
const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  res.send(req.user);
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
    res.status(401).send(err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { oldPasswordByUser, newPasswordByuser } = req.body;
    await validateOldPassword(oldPasswordByUser, req.user.password);

    if (validator.isStrongPassword(newPasswordByuser)) {
      req.user.password = await bcrypt.hash(newPasswordByuser, 10);
      await req.user.save();
      res.send("password is updates");
    } else {
      throw new Error("New password is not strong enough");
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});
// $2b$10$Hq1goRXR6lalAOOjNQRBgeK9cM9feLgLrF7fFRFZCp4lrT.5NMRL2

module.exports = profileRouter;
