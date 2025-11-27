const express = require('express')
const { getcurrectuser, suggestuser, editprofilepage, getprofile, followUser, getFollowStats, checkFollowStatus, searchUsers } = require('../controller/usercontroler')
const isauth = require('../middleware/isauth')
const upload = require('../middleware/multer')
const Posts = require('../models/postmodels')
const Notification = require('../models/notificationModel')
const Users = require('../models/usermodels')
const Message = require('../models/messageModel') 
const Conversation = require('../models/conversationModel') 

const userrouter = express.Router()


userrouter.get('/user/currentuser', isauth, getcurrectuser) 
userrouter.get('/getprofile/:username', isauth, getprofile)
userrouter.get("/suggestedusers", isauth, suggestuser)
userrouter.post('/editprofile', isauth, upload.single('profileimg'), editprofilepage)
userrouter.post('/follow/:userId', isauth, followUser)
userrouter.get('/check-follow/:userId', isauth, checkFollowStatus)
userrouter.get('/follow-stats/:username', getFollowStats)
userrouter.get('/search', searchUsers)


userrouter.get('/allusers', isauth, async (req, res) => {
  try {
    const currentUserId = req.userid;
    const users = await Users.find({
      _id: { $ne: currentUserId }
    }).select('username profileimg name email profession location');
    
    return res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
})


userrouter.post('/test-conversation', isauth, async (req, res) => {
  try {
    const currentUserId = req.userid;
    
    console.log('🔄 Creating test conversation for user:', currentUserId);
    
  
    const otherUser = await Users.findOne({ _id: { $ne: currentUserId } });
    
    if (!otherUser) {
      return res.status(404).json({ error: "No other users found" });
    }
    
    console.log('👤 Found other user:', otherUser.username);
    
   
    const participants = [currentUserId, otherUser._id].sort();
    
   
    let conversation = await Conversation.findOne({
      participants: { 
        $all: participants,
        $size: 2
      }
    });
    
    if (!conversation) {
     
      const testMessage = await Message.create({
        sender: currentUserId,
        receiver: otherUser._id,
        message: "Hello! This is a test message"
      });
      
      console.log('💬 Test message created:', testMessage._id);
      
     
      conversation = await Conversation.create({
        participants: participants,
        messages: [testMessage._id],
        lastMessage: testMessage._id
      });
      
      console.log('✅ Conversation created successfully');
    } else {
      console.log('✅ Conversation already exists');
    }
    
    return res.status(200).json({ 
      success: true,
      message: "Test conversation handled successfully!",
      conversation: {
        _id: conversation._id,
        participants: conversation.participants
      },
      otherUser: {
        _id: otherUser._id,
        username: otherUser.username,
        name: otherUser.name
      }
    });
    
  } catch (error) {
    console.error("❌ Test conversation error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Test failed: " + error.message 
    });
  }
})

userrouter.get('/user/posts/:userId', isauth, async (req, res) => {
  try {
    const posts = await Posts.find({ author: req.params.userId })
      .populate("author", "name username profileimg")
      .populate("comments.author", "name username profileimg")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching posts" });
  }
})

userrouter.get('/notifications', isauth, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient: req.userid 
    })
    .populate('sender', 'username name profileimg')
    .sort({ createdAt: -1 })
    .limit(50);

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
})


userrouter.put('/notifications/:notificationId/read', isauth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ message: "Error updating notification" });
  }
})


userrouter.put('/notifications/read-all', isauth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userid, read: false },
      { read: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ message: "Error updating notifications" });
  }
})


userrouter.delete('/notifications/:notificationId', isauth, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.notificationId);
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Error deleting notification" });
  }
})

userrouter.delete('/notifications', isauth, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.userid });
    res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
    console.error("Clear all notifications error:", error);
    res.status(500).json({ message: "Error clearing notifications" });
  }
})

module.exports = userrouter