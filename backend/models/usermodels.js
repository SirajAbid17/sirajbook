const mongoose = require('mongoose')

const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profileimg: {
        type: String,
    },
    bio: {
        type: String,
    },
    profession: {
        type: String,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'male'
    },
   
isOnline: {
  type: Boolean,
  default: false
},
    location: {  
        type: String,
        default: "Pakistan"
    },
    website: {   
        type: String,
        default: ""
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    ],
     isPrivate: {
    type: Boolean,
    default: false
  },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Posts'
        }
    ],
    savedposts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Posts'
        }
    ],
    reels: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reels'
        }
    ],
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story'
    },
    resetotp: {
        type: String
    },
    otpexpire: {
        type: Date
    },
    otpverify: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Users = mongoose.model('Users', userschema)
module.exports = Users