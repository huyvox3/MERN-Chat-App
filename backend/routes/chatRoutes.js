const express = require('express')
const { protect } = require('../middleWare/authMiddleware')
const { accessChat,fetchChat,createGroup,renameGroup,addToGroup,removeFromGroup } = require('../controllers/chatController')
const router = express.Router()


router.post('/', protect,accessChat)
router.get('/', protect,fetchChat)
router.post('/createGroup', protect,createGroup)
router.put('/renameGroup', protect,renameGroup)
router.put('/groupAdd', protect,addToGroup)
router.put('/groupRemove', protect,removeFromGroup)

module.exports = router



