const uploadoncloudinary = require("../config/cloudinary");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const Users = require("../models/usermodels");
const mongoose = require('mongoose');

const sendmessage = async (req, res) => {
  try {
    const senderid = req.userid;
    const receiverid = req.params.receiverid;
    const { message } = req.body;

    console.log('📤 Sending message from:', senderid, 'to:', receiverid);

   
    if (!senderid || !receiverid) {
      return res.status(400).json({ error: "Sender and receiver IDs are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(senderid) || !mongoose.Types.ObjectId.isValid(receiverid)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    
    const receiver = await Users.findById(receiverid);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver user not found" });
    }

 
    if ((!message || message.trim() === '') && !req.file) {
      return res.status(400).json({ error: "Message or image is required" });
    }

    let imageUrl;
    if (req.file) {
      console.log('🖼️ Uploading image...');
      try {
        const uploadResult = await uploadoncloudinary(req.file.path);
        imageUrl = uploadResult.url || uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    let conversation;
    try {
      conversation = await Conversation.findOrCreate(senderid, receiverid);
    } catch (convError) {
      console.error('❌ Conversation error:', convError);
      return res.status(500).json({ error: "Failed to create conversation: " + convError.message });
    }

    if (!conversation) {
      return res.status(500).json({ error: "Could not find or create conversation" });
    }

    console.log('✅ Conversation ready:', conversation._id);

 
    const newmessage = await Message.create({
      sender: senderid,
      receiver: receiverid,
      message: message ? message.trim() : '',
      image: imageUrl
    });

    console.log('💬 Message created:', newmessage._id);

    
    conversation.messages = [...conversation.messages, newmessage._id];
    conversation.lastMessage = newmessage._id;
    

    await Conversation.findByIdAndUpdate(
      conversation._id,
      {
        $push: { messages: newmessage._id },
        lastMessage: newmessage._id
      },
      { new: true }
    );

    console.log('✅ Conversation updated successfully');

   
    const populatedMessage = await Message.findById(newmessage._id)
      .populate('sender', 'username profileimg name isOnline')
      .populate('receiver', 'username profileimg name isOnline');

    console.log('✅ Message sent successfully');
    
 
    if (req.app.get('socketio')) {
      const conversationId = conversation._id.toString();
      req.app.get('socketio').to(conversationId).emit('receive_message', populatedMessage);
      
     
      const receiverSocketId = req.app.get('onlineUsers').get(receiverid);
      if (receiverSocketId) {
        req.app.get('socketio').to(receiverSocketId).emit('new_message_notification', {
          message: populatedMessage,
          conversationId: conversationId
        });
      }
    }

    return res.status(200).json(populatedMessage);

  } catch (error) {
    console.error("❌ Send message error:", error);
    return res.status(500).json({ 
      error: "Failed to send message: " + error.message,
      details: "Please try again"
    });
  }
};

const getallmessage = async (req, res) => {
  try {
    const senderid = req.userid;
    const receiverid = req.params.receiverid;
    
    console.log('📨 Getting messages between:', senderid, 'and', receiverid);
    
    if (!senderid || !receiverid) {
      return res.status(400).json({ error: "Sender and receiver IDs are required" });
    }
    

    const conversation = await Conversation.findOne({
      participants: { 
        $all: [senderid, receiverid]
      }
    })
    .populate({
      path: "messages",
      populate: [
        { path: "sender", select: "username profileimg name isOnline" },
        { path: "receiver", select: "username profileimg name isOnline" }
      ],
      options: { sort: { createdAt: 1 } }
    });

    if (!conversation) {
      console.log('❌ No conversation found');
      return res.status(200).json([]);
    }

    const messages = conversation.messages || [];
    console.log('📄 Found messages:', messages.length);
    
    return res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Get all message error:", error);
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
};

const previosuserchat = async (req, res) => {
  try {
    const currentuserid = req.userid;
    
    console.log('🔍 Fetching conversations for user:', currentuserid);
    
    const conversations = await Conversation.find({
      participants: currentuserid
    })
    .populate({
      path: "participants",
      match: { _id: { $ne: currentuserid } }, 
      select: "username profileimg name email isOnline lastSeen"
    })
    .populate({
      path: "lastMessage",
      populate: [
        { 
          path: "sender", 
          select: "username profileimg name isOnline" 
        },
        { 
          path: "receiver", 
          select: "username profileimg name isOnline" 
        }
      ]
    })
    .sort({ updatedAt: -1 });

    console.log('📨 Found conversations:', conversations.length);

    const validConversations = conversations.filter(conv => 
      conv.participants && conv.participants.length > 0
    );

    const previoususer = validConversations.map(conv => {
      const otherUser = conv.participants[0]; 
      return {
        ...otherUser.toObject(),
        lastMessage: conv.lastMessage || null,
        lastMessageTime: conv.updatedAt,
        conversationId: conv._id
      };
    });

    console.log('📤 Sending previous users:', previoususer.length);
    
    return res.status(200).json(previoususer);
  } catch (error) {
    console.error("❌ Previous user chat error:", error);
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
};


const resetUserConversations = async (req, res) => {
  try {
    const userId = req.userid;
    
    console.log('🔄 Resetting conversations for user:', userId);

    const userConversations = await Conversation.find({
      participants: userId
    });

    const conversationIds = userConversations.map(conv => conv._id);
    
    await Conversation.deleteMany({ _id: { $in: conversationIds } });
    await Message.deleteMany({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    });
    
    console.log('✅ User conversations reset successfully');
    
    return res.status(200).json({ 
      message: "Your conversations have been reset successfully",
      deletedConversations: conversationIds.length
    });
    
  } catch (error) {
    console.error('Error resetting user conversations:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  sendmessage, 
  getallmessage, 
  previosuserchat, 
  resetUserConversations 
};