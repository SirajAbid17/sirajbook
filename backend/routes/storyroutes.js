const express = require("express");
const isauth = require("../middleware/isauth");
const upload = require("../middleware/multer");
const { 
    uploadstory, 
    getstoryusername, 
    viewstory, 
    getallstories, 
    deletestory 
} = require("../controller/storycontroler");
const checkFileSize = require("../middleware/fileSizeCheck");

const storyrouter = express.Router();

storyrouter.post("/story", isauth, upload.single("media"), checkFileSize, uploadstory);
storyrouter.get("/getstoryusername/:username", isauth, getstoryusername);
storyrouter.put("/view/:storyid", isauth, viewstory);
storyrouter.get("/getallstories", isauth, getallstories);
storyrouter.delete("/deletestory/:storyid", isauth, deletestory);

module.exports = storyrouter;