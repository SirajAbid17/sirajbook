const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

conversationSchema.pre('save', function(next) {
  if (this.participants && this.participants.length === 2) {
    try {
     
      const participantStrings = this.participants.map(p => {
        if (p instanceof mongoose.Types.ObjectId) {
          return p.toString();
        }
        if (typeof p === 'string' && mongoose.Types.ObjectId.isValid(p)) {
          return p;
        }
        throw new Error(`Invalid participant ID: ${p}`);
      });
      
      const uniqueParticipants = [...new Set(participantStrings)];
      
      if (uniqueParticipants.length !== 2) {
        return next(new Error('Conversation must have exactly 2 unique participants'));
      }
      
    
      this.participants = uniqueParticipants
        .sort((a, b) => a.localeCompare(b))
        .map(id => new mongoose.Types.ObjectId(id)); 
      
    } catch (error) {
      return next(error);
    }
  }
  next();
});

conversationSchema.statics.findOrCreate = async function(userId1, userId2) {
  try {
    if (!userId1 || !userId2) {
      throw new Error('Both user IDs are required');
    }

   
    if (!mongoose.Types.ObjectId.isValid(userId1) || !mongoose.Types.ObjectId.isValid(userId2)) {
      throw new Error('Invalid user ID format');
    }

    const participantStrings = [userId1, userId2]
      .map(id => id.toString())
      .sort((a, b) => a.localeCompare(b));

    console.log('🔍 Looking for conversation between:', participantStrings);

    let conversation = await this.findOne({
      participants: { 
        $all: participantStrings.map(id => new mongoose.Types.ObjectId(id)),
        $size: 2
      }
    })
    .populate('participants')
    .populate('lastMessage');

    if (conversation) {
      console.log('✅ Found existing conversation:', conversation._id);
      return conversation;
    }

    console.log('🆕 Creating new conversation');
    
    conversation = new this({
      participants: participantStrings.map(id => new mongoose.Types.ObjectId(id)),
      messages: [],
      lastMessage: null
    });
    
    await conversation.save();
    
    console.log('✅ New conversation created successfully:', conversation._id);
    
    return conversation;

  } catch (error) {
    console.error('❌ Error in findOrCreate:', error);
   
    if (error.code === 11000) {
      console.log('🔄 Duplicate key error, finding existing conversation...');
      
      const participantStrings = [userId1, userId2]
        .map(id => id.toString())
        .sort((a, b) => a.localeCompare(b));
      
      const existingConv = await this.findOne({
        participants: { 
          $all: participantStrings.map(id => new mongoose.Types.ObjectId(id)),
          $size: 2
        }
      });
      
      if (existingConv) {
        console.log('✅ Found conversation after duplicate error');
        return existingConv;
      }
    }
    
    throw error;
  }
};

module.exports = mongoose.model('Conversation', conversationSchema);