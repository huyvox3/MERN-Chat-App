const express = require('express')
const router = express.Router();
const {sendMessage,getAllMessages} = require("../controllers/messageController")
const { protect } = require("../middleWare/authMiddleware");
router.post('/',protect,sendMessage)
router.get('/:chatId',protect,getAllMessages)

module.exports = router;