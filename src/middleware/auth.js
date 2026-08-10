const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) throw new Error("Token is invalid");
    const decoded = await jwt.verify(token, "dev@tinder");
    const user = await User.findById(decoded._id);
    console.log(user);
    if (!user) {
      throw new Error("User doesnt exists");
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err.message);
    res.status(401).send("Invalid token");
  }
};

module.exports = { userAuth };
