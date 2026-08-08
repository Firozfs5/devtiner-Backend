const mongoose = require("mongoose");

async function ConnectDB() {
  await mongoose.connect(
    "mongodb+srv://firozshabir567_db_user:Firoz12345@cluster0.gen8fby.mongodb.net/devtinder",
  );
}

module.exports = ConnectDB;
