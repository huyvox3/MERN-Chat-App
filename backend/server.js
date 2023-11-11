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

// const server =app.listen(
//   5000,
//   console.log(`Server started on PORT ${PORT}`.cyan.bold.underline)
// );
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
    methods: ["GET", "POST"],
    credential: true,
    rejectUnauthorized: false,
  },
});
io.on("connection", (socket) => {
  console.log("Connected to socket.io".blue.bold.underline);
  socket.on("setup", (userData) => {
    socket.join(userData._id);

    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined Room: " + room);
  });
  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users  not defined");
    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("fetch my chat", async (room) => {
    // if (!room.users) return console.log("room.users not defined");
    // socket.in(room).emit("my chat update", room);
    // room.users.forEach((user) => {
    //   console.log(user._id);
    // });

    const chat = await Chat.findById(room);
    if (!chat.users) return console.log("users not defined");
    socket.in(chat).emit("my chat update", chat);
  });

  socket.on("typing", (room) => socket.to(room).emit("typing"));
  socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));
});

server.listen(5000, () => {
  console.log(`Server started on PORT ${PORT}`.cyan.bold.underline);
});
