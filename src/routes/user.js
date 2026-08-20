const express = require("express");
const { userAuth } = require("../middleware/auth");
const userRouter = express.Router();
const connectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequestsObject = await connectionRequest
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", ["firstName", "lastName"])
      .select("fromUserId")
      .lean();

    const users = connectionRequestsObject.map((request) => ({
      ...request.fromUserId,
      requestId: request._id,
    }));

    res.json({ message: "The request u recieved", users });
  } catch (err) {
    res.status(400).send("ERROR:" + err);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  const loggedInUser = req.user;

  const connections = await connectionRequest
    .find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
    .populate("fromUserId", [
      "firstName",
      "lastName",
      "photoUrl",
      "gender",
      "age",
      "about",
    ])
    .populate("toUserId", [
      "firstName",
      "lastName",
      "photoUrl",
      "gender",
      "age",
      "about",
    ]);

  const data = connections.map((item) => {
    if (item.fromUserId._id.equals(loggedInUser._id)) {
      return item.toUserId;
    }
    return item.fromUserId;
  });

  res.json({ data });
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const limit =
      parseInt(req.query.limit) <= 100 ? parseInt(req.query.limit) : 3;
    const page = parseInt(req.query.page) || 1;
    let skip = (page - 1) * limit;

    const connectionRequests = await connectionRequest
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      })
      .select(["fromUserId", "toUserId"]);
    const hideUsersInFeed = new Set();

    connectionRequests.forEach((req) => {
      hideUsersInFeed.add(req.fromUserId.toString());
      hideUsersInFeed.add(req.toUserId.toString());
    });

    const data = await User.find({
      _id: { $nin: [...hideUsersInFeed] },
    })
      .select("firstName lastName photoUrl gender age about skills ")
      .skip(skip)
      .limit(limit);

    res.send(data);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = userRouter;
