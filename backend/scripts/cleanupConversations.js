const mongoose = require('mongoose');
const Conversation = require('../models/conversationModel');
require('dotenv').config();

const cleanupDuplicates = async () => {
  try {
    console.log('🔧 Starting conversation cleanup...');
    
 
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name');
    console.log('✅ Connected to MongoDB');

    
    const conversations = await Conversation.find({}).populate('participants');
    
    console.log(`📊 Found ${conversations.length} total conversations`);
    
    const seen = new Map();
    const duplicates = [];
    const validConversations = [];

    for (const conv of conversations) {

      if (!conv.participants || conv.participants.length !== 2) {
        console.log(`❌ Invalid conversation ${conv._id}: wrong participant count`);
        duplicates.push(conv._id);
        continue;
      }

      const key = conv.participants
        .map(p => p._id.toString())
        .sort()
        .join('-');
      
      if (seen.has(key)) {
        console.log(`🔍 Duplicate found: ${conv._id} for participants ${key}`);
        duplicates.push(conv._id);
      } else {
        seen.set(key, conv._id);
        validConversations.push(conv._id);
      }
    }
    
    if (duplicates.length > 0) {
      console.log(`🗑️ Found ${duplicates.length} duplicate conversations to remove`);
     
      await Conversation.deleteMany({ _id: { $in: duplicates } });
      console.log('✅ Duplicate conversations removed successfully');
      
      console.log(`✅ Kept ${validConversations.length} valid conversations`);
    } else {
      console.log('✅ No duplicate conversations found');
    }
    
    await mongoose.disconnect();
    console.log('✅ Cleanup completed successfully');
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
};


if (require.main === module) {
  cleanupDuplicates();
}

module.exports = cleanupDuplicates;