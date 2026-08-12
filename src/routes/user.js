const express = require("express");
const { userAuth } = require("../middleware/auth");
const userRouter = express.Router();
const connectionRequests = require("../models/connectionRequest");

userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequestsObject = await connectionRequests
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", ["firstName", "lastName"]);

    res.json({ message: "The request u recieved", connectionRequestsObject });
  } catch (err) {
    res.status(400).send("ERROR:" + err);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  const loggedInUser = req.user;

  const connections = await connectionRequests
    .find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
    .populate("fromUserId", ["firstName", "lastName"])
    .populate("toUserId", ["firstName", "lastName"]);

  const data = connections.map((item) => {
    if (item.fromUserId._id.equals(loggedInUser._id)) {
      return item.fromUserId;
    }
    return item.toUserId;
  });

  res.json({ data });
});

module.exports = userRouter;
