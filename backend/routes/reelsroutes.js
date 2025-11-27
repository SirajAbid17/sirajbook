const express = require("express");
const upload = require("../middleware/multer");
const isauth = require("../middleware/isauth");
const { 
  uploadreels, 
  likeReel, 
  commentReel, 
  getallreels,
  saveReel 
} = require("../controller/reelscontroler");
const checkFileSize = require("../middleware/fileSizeCheck");
const Reels = require("../models/reelsmodels");

const reelsrouter = express.Router();

reelsrouter.post("/reels", isauth, upload.single("media"), checkFileSize, uploadreels);
reelsrouter.get("/allreels", isauth, getallreels);
reelsrouter.put("/reel/:id/like", isauth, likeReel);
reelsrouter.post("/reel/:id/comment", isauth, commentReel);
reelsrouter.put("/reel/:id/save", isauth, saveReel);

reelsrouter.get('/user/reels/:userId', isauth, async (req, res) => {
  try {
    const reels = await Reels.find({ author: req.params.userId })
      .populate("author", "name username profileimg")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, reels });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching reels" });
  }
});

module.exports = reelsrouter;