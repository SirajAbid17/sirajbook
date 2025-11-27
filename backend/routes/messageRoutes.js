const express = require('express');
const { sendmessage, getallmessage, previosuserchat, resetUserConversations } = require('../controller/messageController');
const isauth = require('../middleware/isauth');
const upload = require('../middleware/multer');

const messageRouter = express.Router();

messageRouter.post('/sendmsg/:receiverid', isauth, upload.single('image'), sendmessage);
messageRouter.get('/getallmsg/:receiverid', isauth, getallmessage);
messageRouter.get('/previouschat', isauth, previosuserchat);

messageRouter.delete('/reset-my-conversations', isauth, resetUserConversations);

module.exports = messageRouter;