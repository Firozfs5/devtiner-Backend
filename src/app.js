const express = require("express");
const app = express();
let port = 3030;
app.listen(port, () => {
  console.log("Listening at port 3030");
});

app.use("/test", (req, res) => {
  res.send("this is the test ones urk");
});

app.use((req, res) => {
  res.send("hello universal response for all url");
});
