const socket = require("socket.io");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    //Handle Events
    socket.on("joinchat", ({ firstName, userId, targetUserId }) => {
      // console.log(userId + "  " + targetUserId);
      const roomId = [userId, targetUserId].sort().join("-");
      // console.log(roomId);

      console.log(firstName + " joining " + roomId);

      socket.join(roomId);
    });

    socket.on("sendMessage", (messageObj) => {
      const roomId = [messageObj.userId, messageObj.targetUserId]
        .sort()
        .join("-"); //its important to make a room id.
      console.log(messageObj.sender + ":" + messageObj.text);
      io.to(roomId).emit("messageRecieved", messageObj);
    });

    socket.on("disconnect", () => {});
  });
};
module.exports = initializeSocket;
