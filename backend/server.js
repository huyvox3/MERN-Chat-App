const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const color = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const MessageRoutes = require("./routes/MessageRoutes");

const { errorHandler, notFound } = require("./middleWare/errorMiddleware");

dotenv.config();
connectDB();
const app = express();
const http = require("http");
const { log } = require("console");
const Chat = require("./Models/ChatModel");
const server = http.createServer(app);
const PORT = process.env.PORT;
app.use(express.json());

app.use("/user", userRoutes);
app.use("/chats", chatRoutes);
app.use("/messages", MessageRoutes);
app.use(errorHandler);
app.use(notFound);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
    methods: ["GET", "POST"],
    credential: true,
  },
});
io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData._id);

    socket.emit("connected");
  });
  socket.on("join chat", (room, id) => {
    socket.join(room);
    console.log(`User ${id} join chat ${room} `);
  });
  socket.on("join room", (data) => {
    const roomClients = io.sockets.adapter.rooms.get(data.roomId) || {
      lenght: 0,
    };
    const numberOfClients = roomClients.size;
    socket.join(data.roomId);

    if (numberOfClients == 0) {
      console.log(
        `Creating room ${data.roomId} and emitting room_created socket event`
      );
      socket.join(data.roomId);
      socket.emit("room_created", {
        roomId: data.roomId,
        peerId: socket.id,
      });
    } else {
      console.log(
        `Joining room ${data.roomId} and emitting room_joined socket event`
      );
      socket.join(data.roomId);
      socket.emit("room_joined", {
        roomId: data.roomId,
        peerId: socket.id,
      });
    }

    console.log("User joined Room: " + data.roomId);
  });

  socket.on("start_call", (data) => {
    console.log("start call");
    socket.broadcast.to(data.roomId).emit("start_call", {
      senderId: data.senderId,
    });
  });
  socket.on("webrtc_offer", (event) => {
    socket.broadcast.to(event.receiverId).emit("webrtc_offer", {
      sdp: event.sdp,
      senderId: event.senderId,
    });
  });
  socket.on("webrtc_answer", (event) => {
    socket.broadcast.to(event.receiverId).emit("webrtc_answer", {
      sdp: event.sdp,
      senderId: event.senderId,
    });
  });
  socket.on("webrtc_ice_candidate", (event) => {
    console.log("broadcast ice");
    socket.broadcast.to(event.receiverId).emit("webrtc_ice_candidate", event);
  });

  socket.on("end call request", (data) => {
    console.log('emit end call',data.roomId,data.senderId);
    socket.broadcast.to(data.roomId).emit("end call", {
      senderId: data.senderId,
    });
  });

 
  socket.on("leave chat", (roomId, userId) => {
    console.log("user leave", userId);
    socket.leave(roomId);
  });
  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users  not defined");
    chat.users.forEach((user) => {
      if (user._id != newMessageReceived.sender._id) {
        socket.broadcast
          .in(user._id)
          .emit("message received", newMessageReceived);
      }
    });
    // socket.broadcast.to(room).emit("message received", newMessageReceived);
  });

  socket.on("fetch my chat", async (room) => {
    const chat = await Chat.findById(room);
    if (!chat.users) return console.log("users not defined");
    console.log("emit fetch my chat update");
    socket.in(chat).emit("my chat update", chat);
  });

  socket.on("typing", (room) => {
    socket.to(room).emit("typing", room);
  });
  socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));
});

server.listen(5000, () => {
  console.log(`Server started on PORT ${PORT}`.cyan.bold.underline);
});
