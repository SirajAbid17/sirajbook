const express = require('express')
const dbconnect = require('./config/db')
const app = express()
const cookie_parser = require('cookie-parser')
const authroute = require('./routes/authroutes')
const cors = require('cors')
const userrouter = require('./routes/userroutes')
const postroute = require('./routes/postroutes')
const reelsrouter = require('./routes/reelsroutes')
const storyrouter = require('./routes/storyroutes')
const messageRouter = require('./routes/messageRoutes')
const http = require('http')
const { Server } = require('socket.io')
const Users = require('./models/usermodels')
const mongoose = require('mongoose')

require('dotenv').config()

let PORT = process.env.PORT || 4000
dbconnect()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

app.use(express.json({ limit: '10mb' }))
app.use(cookie_parser())
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/api', authroute)
app.use('/api', userrouter)
app.use('/api', postroute)
app.use('/api', reelsrouter)
app.use('/api', storyrouter)
app.use('/api', messageRouter)


app.delete('/api/cleanup-conversations', async (req, res) => {
    try {
        const Conversation = require('./models/conversationModel');
        const Message = require('./models/messageModel');
        
        console.log('🔄 Emergency conversation cleanup triggered');
        
        await Conversation.deleteMany({});
        await Message.deleteMany({});
        
        console.log('✅ All conversations and messages reset');
        
        res.status(200).json({ 
            success: true,
            message: "All conversations reset successfully",
            note: "You can now start fresh with messaging"
        });
    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({ 
            success: false,
            error: "Cleanup failed: " + error.message 
        });
    }
});

app.post('/api/user/online', (req, res) => {
    res.json({ success: true, message: "Online status endpoint" });
});

app.post('/api/user/offline', (req, res) => { 
    res.json({ success: true, message: "Offline status endpoint" });
});

app.get('/', (req, res) => {
    res.send('Server is running!')
})


app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
});


const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
})

const onlineUsers = new Map()


app.set('socketio', io);
app.set('onlineUsers', onlineUsers);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

   
    socket.on('user_online', async (userId) => {
        try {
           
            if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                console.log('Invalid user ID:', userId);
                return;
            }

            onlineUsers.set(userId, socket.id)
            socket.userId = userId
            
          
            await Users.findByIdAndUpdate(userId, { 
                isOnline: true,
                lastSeen: new Date()
            })
            
            console.log(`User ${userId} is online`)
            
            socket.broadcast.emit('user_status_changed', {
                userId,
                isOnline: true,
                lastSeen: new Date()
            })

           
            const onlineUserIds = Array.from(onlineUsers.keys());
            socket.emit('online_users_list', onlineUserIds);
            
        } catch (error) {
            console.error('Error setting user online:', error)
        }
    })

    
    socket.on('join_conversation', (conversationId) => {
        if (conversationId) {
            socket.join(conversationId)
            console.log(`User ${socket.id} joined conversation: ${conversationId}`)
        }
    })

    
    socket.on('leave_conversation', (conversationId) => {
        if (conversationId) {
            socket.leave(conversationId)
            console.log(`User ${socket.id} left conversation: ${conversationId}`)
        }
    })

  
    socket.on('send_message', async (data) => {
        try {
            const { conversationId, message, senderId, receiverId } = data
            
            if (!conversationId || !message) {
                socket.emit('message_error', { error: 'Missing conversation ID or message' });
                return;
            }

            console.log(`📤 Socket message in ${conversationId} from ${senderId} to ${receiverId}`);
            
           
            io.to(conversationId).emit('receive_message', message)
            
          
            const receiverSocketId = onlineUsers.get(receiverId)
            if (receiverSocketId && receiverSocketId !== socket.id) {
                io.to(receiverSocketId).emit('new_message_notification', {
                    message: message,
                    conversationId: conversationId,
                    senderId: senderId
                })
            }
            
        } catch (error) {
            console.error('Error sending message via socket:', error)
            socket.emit('message_error', { error: 'Failed to send message' })
        }
    })

    
    socket.on('typing_start', (data) => {
        if (data.conversationId) {
            socket.to(data.conversationId).emit('user_typing', {
                userId: data.userId,
                isTyping: true,
                conversationId: data.conversationId
            })
        }
    })

    socket.on('typing_stop', (data) => {
        if (data.conversationId) {
            socket.to(data.conversationId).emit('user_typing', {
                userId: data.userId,
                isTyping: false,
                conversationId: data.conversationId
            })
        }
    })

  
    socket.on('message_read', (data) => {
        if (data.conversationId && data.messageId) {
            socket.to(data.conversationId).emit('message_read_confirmation', {
                messageId: data.messageId,
                readBy: data.userId,
                readAt: new Date()
            })
        }
    })

   
    socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id)
        
        if (socket.userId) {
            onlineUsers.delete(socket.userId)
            
            try {
                
                await Users.findByIdAndUpdate(socket.userId, { 
                    isOnline: false,
                    lastSeen: new Date()
                })
                
               
                socket.broadcast.emit('user_status_changed', {
                    userId: socket.userId,
                    isOnline: false,
                    lastSeen: new Date()
                })

                console.log(`User ${socket.userId} is offline`)
            } catch (error) {
                console.error('Error updating offline status:', error)
            }
        }
    })

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
})

io.engine.on("connection_error", (err) => {
    console.log('Socket.io connection error:', err);
});


const runCleanupOnStart = async () => {
    try {
        const Conversation = require('./models/conversationModel');
        
        console.log('🔍 Checking for conversation issues...');
        
        
        const invalidConversations = await Conversation.find({
            $or: [
                { participants: { $exists: false } },
                { participants: { $size: 0 } },
                { participants: { $size: 1 } },
                { participants: { $size: { $gt: 2 } } }
            ]
        });
        
        if (invalidConversations.length > 0) {
            console.log(`🗑️ Found ${invalidConversations.length} invalid conversations, removing...`);
            await Conversation.deleteMany({
                _id: { $in: invalidConversations.map(conv => conv._id) }
            });
            console.log('✅ Invalid conversations cleaned up');
        }
        
    } catch (error) {
        console.log('Cleanup check skipped:', error.message);
    }
};


server.listen(PORT, async () => {
    console.log(`🚀 Your server is running on ${PORT}`)
    
   
    try {
        await runCleanupOnStart();
    } catch (error) {
        console.log('Startup cleanup failed:', error.message);
    }
})


process.on('SIGINT', async () => {
    console.log('🛑 Server shutting down...');
    
 
    try {
        const onlineUserIds = Array.from(onlineUsers.keys());
        if (onlineUserIds.length > 0) {
            await Users.updateMany(
                { _id: { $in: onlineUserIds } },
                { 
                    isOnline: false,
                    lastSeen: new Date()
                }
            );
            console.log(`✅ Updated ${onlineUserIds.length} users to offline status`);
        }
    } catch (error) {
        console.error('Error updating users on shutdown:', error);
    }
    
    process.exit(0);
});

module.exports = app;