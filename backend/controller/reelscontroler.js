const Reels = require("../models/reelsmodels");
const Users = require("../models/usermodels");
const uploadoncloudinary = require("../config/cloudinary"); 

const uploadreels = async (req, res) => {
    try {
        const { caption } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: "Media is required" });
        }

  
        const media = await uploadoncloudinary(req.file.buffer, {
            resource_type: "video",
            folder: "sirajbook/reels"
        });

        const reels = await Reels.create({
            caption,
            media: media.secure_url,
            author: req.userid,
        });

        const user = await Users.findById(req.userid);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        user.reels.push(reels._id);
        await user.save();

        const populatedreel = await Reels.findById(reels._id)
            .populate("author", "name username profileimg");

        return res.status(201).json(populatedreel);
    } catch (error) {
        console.error("Upload Reels Error:", error);
        return res.status(500).json({ message: "Upload reels error" });
    }
};

const getallreels = async (req, res) => {
  try {
    const reels = await Reels.find()
      .sort({ createdAt: -1 })
      .populate("author", "name username profileimg")
      .populate("comments.author", "name username profileimg");

    return res.status(200).json(reels);
  } catch (error) {
    console.error("Get All Reels Error:", error.message);
    return res.status(500).json({ message: "Error getting reels" });
  }
};

const likeReel = async (req, res) => {
  try {
    const reelId = req.params.id;
    const userId = req.userid;

    const reel = await Reels.findById(reelId);
    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    const likeIndex = reel.likes.indexOf(userId);
    
    if (likeIndex > -1) {
     
      reel.likes.splice(likeIndex, 1);
    } else {
      
      reel.likes.push(userId);
    }

    await reel.save();
    
    const populatedReel = await Reels.findById(reelId)
      .populate("author", "name username profileimg")
      .populate("comments.author", "name username profileimg");

    return res.status(200).json({
      message: likeIndex > -1 ? "Reel unliked" : "Reel liked",
      reel: populatedReel
    });
  } catch (error) {
    console.error("Like Reel Error:", error.message);
    return res.status(500).json({ message: "Error liking reel" });
  }
};

const commentReel = async (req, res) => {
  try {
    const reelId = req.params.id;
    const userId = req.userid;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Comment message required" });
    }

    const reel = await Reels.findById(reelId);
    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    const newComment = {
      author: userId,
      message: message.trim(),
      createdAt: new Date()
    };

    reel.comments.push(newComment);
    await reel.save();

    const populatedReel = await Reels.findById(reelId)
      .populate("author", "name username profileimg")
      .populate("comments.author", "name username profileimg");

    return res.status(200).json({
      message: "Comment added successfully",
      reel: populatedReel
    });
  } catch (error) {
    console.error("Comment Reel Error:", error.message);
    return res.status(500).json({ message: "Error commenting on reel" });
  }
};

const saveReel = async (req, res) => {
  try {
    const reelId = req.params.id;
    const userId = req.userid;

    const user = await Users.findById(userId);
    const reel = await Reels.findById(reelId);

    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }


    if (!user.savedreels) {
      user.savedreels = [];
    }

    const reelIndex = user.savedreels.indexOf(reelId);
    
    if (reelIndex > -1) {
     
      user.savedreels.splice(reelIndex, 1);
    } else {
    
      user.savedreels.push(reelId);
    }

    await user.save();

    return res.status(200).json({
      message: reelIndex > -1 ? "Reel unsaved" : "Reel saved",
      savedReels: user.savedreels
    });
  } catch (error) {
    console.error("Save Reel Error:", error.message);
    return res.status(500).json({ message: "Error saving reel" });
  }
};

module.exports = {
  uploadreels,
  getallreels,
  likeReel,
  commentReel,
  saveReel,
};