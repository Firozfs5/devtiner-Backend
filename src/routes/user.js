const express = require("express");
const { userAuth } = require("../middleware/auth");
const userRouter = express.Router();
const User = require("../models/user");
const ConnectionRequestModel = require("../models/connectionRequest");

userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequestsObject = await connectionRequest
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", ["firstName", "lastName", "photoUrl"])
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
    hideUsersInFeed.add(loggedInUser._id.toString());

    const data = await User.find({
      profileVisibility: "public",
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

userRouter.get("/user/:userId", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select(
      "firstName lastName photoUrl age gender about skills profileVisibility",
    );
    if (!user) return res.status(404).send("User Not Found");

    if (user.profileVisibility === "private") {
      const isConnected = await ConnectionRequestModel.findOne({
        status: "accepted",
        $or: [
          {
            fromUserId: req.user._id,
            toUserId: userId,
          },
          {
            fromUserId: userId,
            toUserId: req.user._id,
          },
        ],
      });

      if (!isConnected) {
        return res.status(404).send("User Not Found");
      }
    }

    const relationShip = await ConnectionRequestModel.findOne({
      $or: [
        { fromUserId: req.user._id, toUserId: userId },
        {
          fromUserId: userId,
          toUserId: req.user._id,
        },
      ],
    });

    const userConnections = await ConnectionRequestModel.find({
      status: "accepted",
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    });

    let connectionStatus = "none";
    if (relationShip) {
      if (relationShip.status === "accepted") {
        connectionStatus = "connected";
      } else if (relationShip.status === "interested") {
        if (relationShip.fromUserId.toString() === req.user._id.toString()) {
          connectionStatus = "sent";
        } else {
          connectionStatus = "received";
        }
      }
    }

    const data = {
      ...user.toObject(),
      connectionStatus,
      userConnections: userConnections.length,
    };

    res.send(data);
  } catch (err) {
    console.error("GET /user/:userId error:", err);
    return res.status(500).send("Something went wrong");
  }
});

module.exports = userRouter;
