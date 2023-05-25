const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const port = 3001;
let users = [];

app.get("/", (req, res) => {
  res.send("Hello there");
});

const addUser = (user, roomId) => users.push({ user, roomId });

const removeUser = (user) => {
  users = users.filter((usr) => usr.user != user);
};

const getRoomUsers = (roomId) => users.filter((usr) => usr.roomId == roomId);

io.on("connection", (socket) => {
  console.log("Someone just connected");
  socket.on("join-room", ({ user, roomId }) => {
    console.log(user, " joined room ", roomId);
    if (roomId && user) {
      socket.join(roomId);
      addUser(user, roomId);
      socket.to(roomId).emit("connected", user);
      io.to(roomId).emit("room-users", getRoomUsers(roomId));
    }

    socket.on("disconnect", () => {
      console.log("disconnected");
      socket.leave(roomId);
      removeUser(user);
      io.to(roomId).emit("room-users", getRoomUsers(roomId));
    });
  });
});

server.listen(port, () => {
  console.log(`Zoom Clone Api listenning on localhost:3001`);
});
