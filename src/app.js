const express = require("express");
const app = express();
const port = 3000;
const ConnectDB = require("./config/database");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
app.use(express.json());

app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    console.log(emailId + " " + password);
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPassowrdValid = await bcrypt.compare(password, user.password);
    if (!isPassowrdValid) {
      throw new Error("Invalid Credentials");
    } else {
      res.send("Login successfull");
    }
  } catch (err) {
    res.status(400).send("ERROR :" + err.message);
  }
});

app.get("/user", async (req, res) => {
  console.log(req.body.emailId);
  try {
    let user = await User.find({});
    res.send(user);
  } catch (err) {
    console.error("there was some error");
    res.status(401).send("there was some error");
  }
});

app.get("/feed", async (req, res) => {
  try {
    let users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(401).send("there was some error");
  }
});

app.get("/user/:id", async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    res.send(user);
  } catch (err) {
    res.status(401).send("there is some errpr");
  }
});

app.delete("/user", async (req, res) => {
  try {
    let user = await User.findByIdAndDelete(req.body.id);
    res.send(user);
  } catch {
    res.status(401).send("error exist");
  }
});

app.patch("/user/:userId", async (req, res) => {
  try {
    const ALLOWED_UPDATES = [
      "age",
      "about",
      "gender",
      "photoUrl",
      "about",
      "skills",
    ];

    const isUpdateAllowed = Object.keys(req.body).every((ele) => {
      console.log(ele);
      return ALLOWED_UPDATES.includes(ele);
    });

    if (!isUpdateAllowed) {
      res.status(401).send("THERE are some data which cant be updated");
    }
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    res.send(user);
  } catch (err) {
    res.status(401).send("theres a error");
  }
});

ConnectDB()
  .then(() => {
    console.log("Connected succesfully to database");
    app.listen(port, () => {
      console.log("the server is listening at post 3000");
    });
  })
  .catch((err) => {
    console.log("there was error to connect to the databse");
    console.error(err);
  });

// {
//   firstName: "Firoz",
//   lastName: "s",
//   gender: "male",
//   password: "12345678",
//   emailId: "firoz@gmail.com",
// }
