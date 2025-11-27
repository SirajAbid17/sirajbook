const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    mediatype: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    media: {
        type: String,
        required: true
    },
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 
    }
}, { timestamps: true });

const Story = mongoose.model('Story', storySchema)
module.exports = Story