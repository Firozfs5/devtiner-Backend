const mongoose = require("mongoose");

async function ConnectDB() {
  await mongoose.connect(process.env.DB_CONNECTION_SECRET);
}

module.exports = ConnectDB;
