const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', 
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', 
    required: true
  },
  message: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;