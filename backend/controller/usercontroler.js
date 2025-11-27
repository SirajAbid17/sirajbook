const uploadoncloudinary = require("../config/cloudinary");
const Notification = require("../models/notificationModel");
const Users = require("../models/usermodels");
const mongoose = require("mongoose");


const editprofilepage = async (req, res) => {
    try {
        console.log("Request file:", req.file);
        
        const { name, username, bio, gender, profession, location, website } = req.body; 
        const userid = req.userid;

        if (username) {
            const existingUser = await Users.findOne({ 
                username, 
                _id: { $ne: userid } 
            });
            if (existingUser) {
                return res.status(400).json({ message: "Username already taken!" });
            }
        }
        
        const updateData = {
            ...(name && { name }),
            ...(username && { username }),
            ...(bio && { bio }),
            ...(profession && { profession }),
            ...(gender && { gender }),
            ...(location && { location }), 
            ...(website && { website })   
        };

        if (req.file) {
            try {
                const result = await uploadoncloudinary(req.file.buffer, {
                    resource_type: "image",
                    folder: "sirajbook/profiles"
                });
                updateData.profileimg = result.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary upload failed:", uploadError);
                return res.status(500).json({ message: "Profile image upload failed" });
            }
        }

        const user = await Users.findByIdAndUpdate(
            userid,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
        
    } catch (error) {
        console.error("Edit profile error:", error);
        return res.status(500).json({ 
            message: error.message || "Internal server error" 
        });
    }
}

const getcurrectuser = async (req, res) => {
    try {
        const userid = req.userid;
        const user = await Users.findById(userid)
            .populate("posts reels followers following")
            .select('-password');
            
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error("Get current user error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

const suggestuser = async (req, res) => {
    try {
        const currentUserId = req.userid;
        
        
        const currentUser = await Users.findById(currentUserId);
        const followingIds = currentUser.following || [];
        
        const users = await Users.find({
            _id: { 
                $ne: currentUserId,
                $nin: followingIds
            }
        })
        .select('username name profileimg bio profession followers following location website') 
        .limit(10)
        .lean();

        return res.status(200).json(users);
    } catch (error) {
        console.error("Suggested users error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

const getprofile = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await Users.findOne({ username })
            .select("-password")
            .populate('followers', 'username name profileimg')
            .populate('following', 'username name profileimg')
            .populate('posts');

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Getprofile error:", error);
        return res.status(500).json({ message: "Getprofile error" });
    }
};


const getFollowStats = async (req, res) => {
    try {
        const { username } = req.params;
        
        const user = await Users.findOne({ username })
            .select('followers following')
            .populate('followers', 'username name profileimg')
            .populate('following', 'username name profileimg');

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        return res.status(200).json({
            followers: user.followers,
            following: user.following,
            followersCount: user.followers.length,
            followingCount: user.following.length
        });

    } catch (error) {
        console.error("Get follow stats error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}


const checkFollowStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.userid;

        const currentUser = await Users.findById(currentUserId);
        const isFollowing = currentUser.following.includes(userId);

        return res.status(200).json({ isFollowing });

    } catch (error) {
        console.error("Check follow status error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.userid;

    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: "Search query is required" 
      });
    }

   
    const users = await Users.find({
      $and: [
        { _id: { $ne: currentUserId } }, 
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } },
            { profession: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username name profileimg bio profession followers following location website')
    .limit(50)
    .lean();

    return res.status(200).json({
      success: true,
      users: users,
      count: users.length
    });

  } catch (error) {
    console.error("Search users error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error during search" 
    });
  }
}


const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userid;

    
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({ message: "Invalid user ID!" });
    }

    if (userId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself!" });
    }

    const currentUser = await Users.findById(currentUserId);
    const userToFollow = await Users.findById(userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isAlreadyFollowing = currentUser.following.includes(userId);
    
    if (isAlreadyFollowing) {

      await Users.findByIdAndUpdate(
        currentUserId,
        { $pull: { following: userId } }
      );
      
      await Users.findByIdAndUpdate(
        userId,
        { $pull: { followers: currentUserId } }
      );

      return res.status(200).json({ 
        message: "Unfollowed successfully", 
        action: "unfollowed",
        isFollowing: false
      });
    } else {
     
      await Users.findByIdAndUpdate(
        currentUserId,
        { $addToSet: { following: userId } }
      );
      
      await Users.findByIdAndUpdate(
        userId,
        { $addToSet: { followers: currentUserId } }
      );

     
      const notification = new Notification({
        recipient: userId, 
        sender: currentUserId,
        type: 'follow',
        message: `${currentUser.username} started following you`
      });

      await notification.save();

      return res.status(200).json({ 
        message: "Followed successfully", 
        action: "followed",
        isFollowing: true
      });
    }

  } catch (error) {
    console.error("Follow/Unfollow error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { 
    getcurrectuser, 
    suggestuser, 
    editprofilepage, 
    getprofile, 
    followUser, 
    getFollowStats, 
    checkFollowStatus,
    searchUsers
};