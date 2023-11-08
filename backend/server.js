const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const color = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes")
const MessageRoutes = require("./routes/MessageRoutes") 
const { errorHandler, notFound } = require("./middleWare/errorMiddleware");
dotenv.config();
connectDB();
const app = express();

const PORT = process.env.PORT;
app.use(express.json());

app.use("/user", userRoutes);
app.use("/chats",chatRoutes)
app.use("/messages",MessageRoutes)
app.use(errorHandler);
app.use(notFound);
app.listen(
  5000,
  console.log(`Server started on PORT ${PORT}`.cyan.bold.underline)
);
