const socket = require("socket.io");
const Chat = require("../models/chat");

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

    socket.on("sendMessage", async (messageObj) => {
      const { userId, targetUserId, text } = messageObj;
      const roomId = [userId, targetUserId].sort().join("-"); //its important to make a room id.
      // console.log(messageObj.sender + ":" + messageObj.text);

      // Save message in database
      try {
        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [targetUserId, userId],
            messages: [],
          });
        }

        chat.messages.push({
          senderId: userId,
          text: text,
        });

        await chat.save();

        const savedMessage = chat.messages[chat.messages.length - 1];
        console.log(savedMessage);
        io.to(roomId).emit("messageRecieved", savedMessage);
      } catch (err) {
        console.log(err);
      }
      //
    });

    socket.on("disconnect", () => {});
  });
};
module.exports = initializeSocket;
