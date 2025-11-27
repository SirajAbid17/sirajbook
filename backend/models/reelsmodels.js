const mongoose = require('mongoose');

const reelsschema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  media: {
    type: String,
    required: true
  },
  caption: {
    type: String
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
    }
  ],
  comments: [
    {
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
      },
      message: {
        type: String
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

const Reels = mongoose.model('Reels', reelsschema);
module.exports = Reels;
