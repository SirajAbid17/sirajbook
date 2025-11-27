const uploadoncloudinary = require("../config/cloudinary");
const Story = require("../models/storymodel");
const Users = require("../models/usermodels");

const uploadstory = async (req, res) => {
    try {
        const user = await Users.findById(req.userid);
        const { mediatype } = req.body;
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

   
        if (user.story) {
            await Story.findByIdAndDelete(user.story);
            user.story = null;
            await user.save();
        }

        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'Media is required!' 
            });
        }

        if (!mediatype || !['image', 'video'].includes(mediatype)) {
            return res.status(400).json({ 
                success: false,
                message: 'Valid mediatype (image/video) is required!' 
            });
        }

   
        const media = await uploadoncloudinary(req.file.buffer, {
            resource_type: mediatype === "video" ? "video" : "image",
            folder: "sirajbook/stories"
        });

    
        const story = await Story.create({
            author: req.userid,
            mediatype,
            media: media.secure_url
        });

       
        user.story = story._id;
        await user.save();

     
        const populatestory = await Story.findById(story._id)
            .populate("author", "name username profileimg")
            .populate("viewers", "name username profileimg");

        return res.status(201).json({
            success: true,
            message: "Story uploaded successfully",
            story: populatestory
        });

    } catch (error) {
        console.error("Upload story error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Upload story error",
            error: error.message 
        });
    }
};

const viewstory = async (req, res) => {
    try {
        const storyid = req.params.storyid;
        
        if (!storyid) {
            return res.status(400).json({ 
                success: false,
                message: "Story ID is required" 
            });
        }

        const story = await Story.findById(storyid);
        
        if (!story) {
            return res.status(404).json({ 
                success: false,
                message: "Story not found" 
            });
        }

       
        const alreadyViewed = story.viewers.some(viewer => 
            viewer.toString() === req.userid.toString()
        );
        
        if (!alreadyViewed) {
            story.viewers.push(req.userid);
            await story.save();
        }

       
        const populatestory = await Story.findById(storyid)
            .populate("author", "name username profileimg")
            .populate("viewers", "name username profileimg");

        return res.status(200).json({
            success: true,
            message: "Story viewed successfully",
            story: populatestory
        });

    } catch (error) {
        console.error("View story error:", error);
        return res.status(500).json({ 
            success: false,
            message: "View story error",
            error: error.message 
        });
    }
};

const getstoryusername = async (req, res) => {
    try {
        const username = req.params.username;
        
        if (!username) {
            return res.status(400).json({ 
                success: false,
                message: "Username is required" 
            });
        }

        const user = await Users.findOne({ username });
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        const stories = await Story.find({ author: user._id })
            .populate("author", "name username profileimg")
            .populate("viewers", "name username profileimg")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            stories: stories
        });

    } catch (error) {
        console.error("Get story by username error:", error);
        return res.status(500).json({ 
            success: false,
            message: 'Get story by username error',
            error: error.message 
        });
    }
};


const getallstories = async (req, res) => {
    try {
      
        const currentUser = await Users.findById(req.userid);
        const followingIds = currentUser.following || [];
        
      
        const storyAuthors = [...followingIds, req.userid];

        const stories = await Story.find({ 
            author: { $in: storyAuthors } 
        })
        .populate("author", "name username profileimg")
        .populate("viewers", "name username profileimg")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            stories: stories
        });

    } catch (error) {
        console.error("Get all stories error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Get all stories error",
            error: error.message 
        });
    }
};


const deletestory = async (req, res) => {
    try {
        const storyid = req.params.storyid;
        const userid = req.userid;

        const story = await Story.findById(storyid);
        
        if (!story) {
            return res.status(404).json({ 
                success: false,
                message: "Story not found" 
            });
        }

        
        if (story.author.toString() !== userid.toString()) {
            return res.status(403).json({ 
                success: false,
                message: "Unauthorized to delete this story" 
            });
        }

        await Story.findByIdAndDelete(storyid);

        
        await Users.findByIdAndUpdate(userid, { 
            $unset: { story: "" } 
        });

        return res.status(200).json({
            success: true,
            message: "Story deleted successfully"
        });

    } catch (error) {
        console.error("Delete story error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Delete story error",
            error: error.message 
        });
    }
};

module.exports = { 
    uploadstory, 
    viewstory, 
    getstoryusername, 
    getallstories, 
    deletestory 
};