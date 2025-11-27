const uploadoncloudinary = require("../config/cloudinary");
const Posts = require("../models/postmodels");
const Users = require("../models/usermodels");
const mongoose = require("mongoose"); 

const uploadpost = async (req, res) => {
    try {
        const { caption, mediatype } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: "Media is required" });
        }

      
        const media = await uploadoncloudinary(req.file.buffer, {
            resource_type: mediatype === "video" ? "video" : "image",
            folder: "sirajbook/posts"
        });

        const post = await Posts.create({
            caption,
            media: media.secure_url,
            mediatype,
            author: req.userid
        });

        const user = await Users.findById(req.userid);
        user.posts.push(post._id);
        await user.save();

        const populatedpost = await Posts.findById(post._id)
            .populate("author", "name username profileimg")
            .populate("comments.author", "name username profileimg");

        return res.status(201).json(populatedpost);
    } catch (error) {
        console.error("Upload post error:", error);
        return res.status(500).json({ message: 'Upload post error' });
    }
};

const getallposts = async (req, res) => {
    try {
        const posts = await Posts.find({})
            .populate("author", "name username profileimg")
            .populate("comments.author", "name username profileimg")
            .sort({ createdAt: -1 });
        return res.status(200).json(posts);
    } catch (error) {
        console.error("Get all posts error:", error);
        return res.status(500).json({ message: 'Get all posts error' });
    }
};

const like = async (req, res) => {
    try {
        const postid = req.params.postid;
        const userid = req.userid;
        
        const post = await Posts.findById(postid);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
     
        const alreadyLiked = post.likes.includes(userid);
        
        if (alreadyLiked) {
            
            post.likes = post.likes.filter(id => id.toString() !== userid.toString());
        } else {
          
            post.likes.push(userid);
        }
        
        await post.save();
        
       
        await post.populate("author", "name username profileimg");
        await post.populate("comments.author", "name username profileimg");
        
        return res.status(200).json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            post: post
        });
    } catch (error) {
        console.error("Like error:", error);
        return res.status(500).json({ message: 'Like error' });
    }
};

const comments = async (req, res) => {
    try {
        const { message, postId } = req.body;
        const userid = req.userid;
        
        if (!postId || !message) {
            return res.status(400).json({ message: "Post ID and message are required" });
        }
        
        const post = await Posts.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
    
        const newComment = {
            author: userid,
            message: message,
            createdAt: new Date()
        };
        
        post.comments.push(newComment);
        await post.save();
        
       
        await post.populate("author", "name username profileimg");
        await post.populate("comments.author", "name username profileimg");
        
        return res.status(200).json({
            message: "Comment added successfully",
            post: post
        });
    } catch (error) {
        console.error("Comments error:", error);
        return res.status(500).json({ message: 'Comments error' });
    }
};

const saved = async (req, res) => {
  try {
    const { postid } = req.params;
    const userid = req.userid;

    console.log("Received postid:", postid);

  
    if (!postid || postid === "posts" || postid === "saved") {
      return res.status(400).json({ 
        success: false,
        message: "Invalid post ID" 
      });
    }

    
    if (!mongoose.Types.ObjectId.isValid(postid)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid post ID format" 
      });
    }

    const user = await Users.findById(userid);
    const post = await Posts.findById(postid);
    
    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: "Post not found" 
      });
    }
    
 
    const alreadySaved = user.savedposts.includes(postid);
    
    if (alreadySaved) {
     
      user.savedposts = user.savedposts.filter(id => id.toString() !== postid.toString());
      await user.save();
      
      return res.status(200).json({
        success: true,
        message: "Post removed from saved",
        isSaved: false
      });
    } else {
      
      user.savedposts.push(postid);
      await user.save();
      
      return res.status(200).json({
        success: true,
        message: "Post saved successfully",
        isSaved: true
      });
    }

  } catch (error) {
    console.error("Saved post error:", error);
    return res.status(500).json({ 
      success: false,
      message: 'Error saving post',
      error: error.message 
    });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const userid = req.userid;
    
    const user = await Users.findById(userid)
      .populate({
        path: 'savedposts',
        populate: [
          {
            path: 'author',
            select: 'name username profileimg'
          },
          {
            path: 'comments.author',
            select: 'name username profileimg'
          }
        ]
      })
      .sort({ 'savedposts.createdAt': -1 });


    const sortedSavedPosts = user.savedposts.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({
      success: true,
      savedPosts: sortedSavedPosts || []
    });

  } catch (error) {
    console.error("Get saved posts error:", error);
    return res.status(500).json({ 
      success: false,
      message: 'Error fetching saved posts',
      error: error.message 
    });
  }
};

module.exports = { uploadpost, getallposts, like, comments, saved, getSavedPosts };