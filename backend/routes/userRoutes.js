const express = require("express");
const router = express.Router();
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userController");

const { protect } = require("../middleWare/authMiddleware");

router.post("/login", authUser);

router.get(
  "/",
  protect,
  allUsers
  // async() =>{
  //   //  allUsers
  // }
);

router.post("/register", registerUser);

module.exports = router;
