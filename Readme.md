#Real time chat system imementation in backend side
-downloading SOCKET.IO
// socket.io
const http = require("http");
const socket = require("socket.io");
const server = http.createServer(app);
const io = socket(server, {
cors: {
origin: "http://localhost:51723",
},
});
io.on("connection", (socket) => {
socket.on("joinchat", () => {});
socket.on("sendMessage", () => {});
socket.on("disconnect", () => { });
});
//socket.io
