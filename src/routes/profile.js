const express = require("express");
const profileRouter = express.Router();
const user = require("../models/user");
const { userAuth } = require("../middleware/auth");

profileRouter.get("/profile", userAuth, async (req, res) => {
  res.send(req.user);
});

module.exports = profileRouter;
