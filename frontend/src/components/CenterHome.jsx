import React, { useState, useEffect, useRef } from "react";
import { CiBookmark } from "react-icons/ci";
import {
  FaHeart,
  FaBookmark,
  FaImages,
  FaRegComment,
  FaRegSmile,
  FaCheck,
} from "react-icons/fa";
import { LuMessageCircleHeart } from "react-icons/lu";
import { TbMessageChatbot } from "react-icons/tb";
import { IoIosSend, IoIosClose, IoIosPause, IoIosPlay } from "react-icons/io";
import { MdMoreHoriz } from "react-icons/md";
import { CiHeart } from "react-icons/ci";
import { Bell, UserPlus, MessageCircle, X } from "lucide-react"; 
import BottomNav from "./BottomNav";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./Footer";
import EmojiPicker from "emoji-picker-react";

export default function CenterHome() {
  const { userdata } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storyLoading, setStoryLoading] = useState(true);
  const [commentTexts, setCommentTexts] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [expandedCaptions, setExpandedCaptions] = useState({});
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [loadingStates, setLoadingStates] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);


  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const [videoStates, setVideoStates] = useState({});
  const videoRefs = useRef({});
  const emojiPickerRef = useRef({});

  
  const [selectedStory, setSelectedStory] = useState(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const storyVideoRef = useRef(null);
  const progressInterval = useRef(null);

 
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(emojiPickerRef.current).forEach((postId) => {
        if (
          emojiPickerRef.current[postId] &&
          !emojiPickerRef.current[postId].contains(event.target) &&
          !event.target.closest(`[data-emoji-button="${postId}"]`)
        ) {
          setShowEmojiPicker((prev) => (prev === postId ? null : prev));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

 
  useEffect(() => {
    fetchPosts();
    fetchStories();
    fetchFollowingStatus();
    fetchSavedPosts();
    fetchNotifications(); 
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);


  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const response = await axios.get(`${ServerUrl}/api/notifications`, {
        withCredentials: true,
      });
      console.log("🔔 Notifications fetched:", response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      
      const savedNotifications = localStorage.getItem(
        "sirajbook_notifications"
      );
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } finally {
      setNotificationLoading(false);
    }
  };


  useEffect(() => {
    if (posts.length > 0 && userdata) {
      const initialLiked = new Set();
      const initialSaved = new Set();
      const initialVideoStates = {};

      posts.forEach((post) => {
        if (post.likes && post.likes.includes(userdata._id)) {
          initialLiked.add(post._id);
        }
        if (post.savedBy && post.savedBy.includes(userdata._id)) {
          initialSaved.add(post._id);
        }
        if (post.mediatype === "video") {
          initialVideoStates[post._id] = {
            isPlaying: false,
            isMuted: true,
            currentTime: 0,
            duration: 0,
          };
        }
      });

      setLikedPosts(initialLiked);
      setSavedPosts(initialSaved);
      setVideoStates(initialVideoStates);
    }
  }, [posts, userdata]);


  const fetchSavedPosts = async () => {
    try {
      const response = await axios.get(`${ServerUrl}/api/savedposts`, {
        withCredentials: true,
      });

      if (response.data.success) {
        const savedPostIds = response.data.savedPosts.map((post) => post._id);
        setSavedPosts(new Set(savedPostIds));
      }
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    }
  };

  const fetchFollowingStatus = async () => {
    try {
      const response = await axios.get(`${ServerUrl}/api/following`, {
        withCredentials: true,
      });

      if (response.data && Array.isArray(response.data)) {
        const followingSet = new Set(response.data.map((user) => user._id));
        setFollowingUsers(followingSet);
      }
    } catch (error) {
      console.error("Error fetching following status:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${ServerUrl}/api/getallpost`, {
        withCredentials: true,
      });
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${ServerUrl}/api/getallstories`, {
        withCredentials: true,
      });

      const groupedStories = groupStoriesByUser(
        response.data.stories || response.data || []
      );
      setStories(groupedStories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("Failed to load stories");
    } finally {
      setStoryLoading(false);
    }
  };

  const groupStoriesByUser = (stories) => {
    const grouped = {};
    stories.forEach((story) => {
      const userId = story.author?._id || story.author;
      if (!grouped[userId]) {
        grouped[userId] = {
          user: story.author || {
            _id: userId,
            username: "Unknown",
            profileimg: "",
          },
          stories: [],
        };
      }
      grouped[userId].stories.push(story);
    });
    return Object.values(grouped);
  };

  const toggleVideoPlay = (postId) => {
    const video = videoRefs.current[postId];
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => {
          setVideoStates((prev) => ({
            ...prev,
            [postId]: {
              ...prev[postId],
              isPlaying: true,
            },
          }));
        })
        .catch((err) => {
          console.error("Error playing video:", err);
        });
    } else {
      video.pause();
      setVideoStates((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          isPlaying: false,
        },
      }));
    }
  };

  const toggleVideoMute = (postId) => {
    const video = videoRefs.current[postId];
    if (!video) return;

    video.muted = !video.muted;
    setVideoStates((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        isMuted: !prev[postId]?.isMuted,
      },
    }));
  };

  const handleVideoTimeUpdate = (postId) => {
    const video = videoRefs.current[postId];
    if (!video) return;

    setVideoStates((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        currentTime: video.currentTime,
        duration: video.duration || prev[postId]?.duration || 0,
      },
    }));
  };

  const handleVideoSeek = (postId, value) => {
    const video = videoRefs.current[postId];
    if (!video || !videoStates[postId]?.duration) return;

    const seekTime = (value / 100) * videoStates[postId].duration;
    video.currentTime = seekTime;
    setVideoStates((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        currentTime: seekTime,
      },
    }));
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleStoryClick = (storyGroup, groupIndex) => {
    setSelectedStory(storyGroup);
    setCurrentStoryIndex(0);
    setShowStoryViewer(true);
    setProgress(0);
    setIsPlaying(true);

    // Mark first story as viewed
    if (storyGroup.stories.length > 0) {
      viewStory(storyGroup.stories[0]._id);
    }
  };

 
  const startProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + 100 / (5000 / 50); // 5 seconds total for each story
      });
    }, 50);
  };


  const stopProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  
  const handleNextStory = () => {
    if (selectedStory && currentStoryIndex < selectedStory.stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);

      // Mark next story as viewed
      viewStory(selectedStory.stories[currentStoryIndex + 1]._id);
    } else {
      closeStoryViewer();
    }
  };

  

  
  const viewStory = async (storyId) => {
    try {
      await axios.put(
        `${ServerUrl}/api/view/${storyId}`,
        {},
        {
          withCredentials: true,
        }
      );

      
      setStories((prevStories) =>
        prevStories.map((group) => {
          const updatedStories = group.stories.map((story) =>
            story._id === storyId
              ? {
                  ...story,
                  viewers: [...(story.viewers || []), { _id: userdata._id }],
                }
              : story
          );
          return { ...group, stories: updatedStories };
        })
      );
    } catch (error) {
      console.error("Error viewing story:", error);
    }
  };

  const closeStoryViewer = () => {
    setShowStoryViewer(false);
    setSelectedStory(null);
    setCurrentStoryIndex(0);
    setProgress(0);
    setIsPlaying(true);
    stopProgress();
  };

 
  const toggleStoryPlayPause = () => {
    if (storyVideoRef.current) {
      if (isPlaying) {
        storyVideoRef.current.pause();
        stopProgress();
      } else {
        storyVideoRef.current.play();
        startProgress();
      }
      setIsPlaying(!isPlaying);
    }
  };


  const hasViewedStory = (storyGroup) => {
    return storyGroup.stories.some((story) =>
      story.viewers?.some(
        (viewer) => viewer._id === userdata?._id || viewer === userdata?._id
      )
    );
  };

 
  const handleCreateStory = () => {
    navigate("/upload");
  };

 
  const toggleCaption = (postId) => {
    setExpandedCaptions((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

 
  useEffect(() => {
    if (showStoryViewer && isPlaying) {
      startProgress();
    } else {
      stopProgress();
    }

    return () => stopProgress();
  }, [showStoryViewer, isPlaying, currentStoryIndex]);

  const handleLike = async (postId) => {
    const originalPosts = [...posts];
    const wasLiked = likedPosts.has(postId);

    try {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: wasLiked
                  ? post.likes.filter((id) => id !== userdata?._id)
                  : [...post.likes, userdata?._id],
              }
            : post
        )
      );

      if (wasLiked) {
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        setLikedPosts((prev) => new Set(prev).add(postId));
      }

      await axios.get(`${ServerUrl}/api/like/${postId}`, {
        withCredentials: true,
      });

      toast.success(wasLiked ? "Post unliked" : "Post liked");
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
      setPosts(originalPosts);
    }
  };


  const handleSave = async (postId) => {
    const wasSaved = savedPosts.has(postId);

    try {
      if (wasSaved) {
        setSavedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        setSavedPosts((prev) => new Set(prev).add(postId));
      }

      const response = await axios.get(`${ServerUrl}/api/saved/${postId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchSavedPosts();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error(error.response?.data?.message || "Failed to save post");
      setSavedPosts((prev) => {
        const newSet = new Set(prev);
        if (wasSaved) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
    }
  };

 
  const handleAddComment = async (postId) => {
    const comment = commentTexts[postId];
    if (!comment?.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      const newComment = {
        author: userdata,
        message: comment,
        createdAt: new Date().toISOString(),
        _id: `temp-${Date.now()}`,
      };

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), newComment],
              }
            : post
        )
      );

      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
      setShowEmojiPicker(null); 

      await axios.post(
        `${ServerUrl}/api/comment`,
        {
          postId: postId,
          message: comment,
        },
        { withCredentials: true }
      );

      await fetchPosts();
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
      await fetchPosts();
    }
  };

  
  const handleCommentChange = (postId, text) => {
    setCommentTexts((prev) => ({
      ...prev,
      [postId]: text,
    }));
  };

  
  const handleEmojiClick = (postId, emojiObject) => {
    const currentText = commentTexts[postId] || "";
    setCommentTexts((prev) => ({
      ...prev,
      [postId]: currentText + emojiObject.emoji,
    }));
  };

 
  const toggleEmojiPicker = (postId) => {
    setShowEmojiPicker((prev) => (prev === postId ? null : postId));
  };

 
  const openCommentsModal = (post) => {
    setSelectedPost(post);
    setShowCommentsModal(true);
  };


  const closeCommentsModal = () => {
    setShowCommentsModal(false);
    setSelectedPost(null);
  };

  const handleUserProfileClick = (username) => {
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  const formatPostTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
  };

  const needsSeeMore = (text, maxLength = 100) => {
    return text && text.length > maxLength;
  };

  
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };


  const handleNotificationClick = (notification) => {
    if (notification.sender && notification.sender.username) {
      navigate(`/profile/${notification.sender.username}`);
    }
    setShowNotifications(false);

    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }
  };


  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${ServerUrl}/api/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );

      
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
     
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(
        `${ServerUrl}/api/notifications/read-all`,
        {},
        {
          withCredentials: true,
        }
      );

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    }
  };

  
  const handleClearAllNotifications = async () => {
    try {
      await axios.delete(`${ServerUrl}/api/notifications`, {
        withCredentials: true,
      });
      setNotifications([]);
      localStorage.setItem("sirajbook_notifications", JSON.stringify([]));
    } catch (error) {
      console.error("Error clearing notifications:", error);
     
      setNotifications([]);
      localStorage.setItem("sirajbook_notifications", JSON.stringify([]));
    }
  };

  const handleClearNotification = async (notificationId) => {
    try {
      await axios.delete(`${ServerUrl}/api/notifications/${notificationId}`, {
        withCredentials: true,
      });

      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
     
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
    }
  };

 
  const getNotificationIcon = (type) => {
    switch (type) {
      case "follow":
        return <UserPlus size={16} className="text-blue-500" />;
      case "like":
        return <FaHeart size={16} className="text-red-500" />;
      case "comment":
        return <MessageCircle size={16} className="text-green-500" />;
      case "message":
        return <MessageCircle size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  
  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter((notif) => !notif.read).length;

 
 
  if (loading) {
    return (
      <div className="w-full lg:w-[55%] min-h-screen bg-white lg:ml-[20%] lg:mr-[25%] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[55%] min-h-screen bg-white lg:ml-[20%] lg:mr-[25%] overflow-y-auto">
      <ToastContainer position="top-center" autoClose={3000} />

     
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>
      )}

     
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden z-50 transform transition-all duration-300 scale-100">
           
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-500 hover:text-blue-600 font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAllNotifications}
                      className="text-xs text-red-500 hover:text-red-600 font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

           
            <div className="overflow-y-auto max-h-[60vh]">
              {notificationLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : notifications.length > 0 ? (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-3 rounded-lg mb-2 border-l-4 cursor-pointer ${
                        notification.read
                          ? "bg-gray-50 border-gray-300 hover:bg-gray-100"
                          : "bg-blue-50 border-blue-500 hover:bg-blue-100"
                      } transition-all duration-200 hover:shadow-sm`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                      
                        <div className="flex-shrink-0">
                          {notification.sender?.profileimg ? (
                            <img
                              src={notification.sender.profileimg}
                              alt={notification.sender.username}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 font-medium leading-tight">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`inline-block text-xs px-2 py-1 rounded-full ${
                                notification.type === "follow"
                                  ? "bg-blue-100 text-blue-600"
                                  : notification.type === "like"
                                  ? "bg-red-100 text-red-600"
                                  : notification.type === "comment"
                                  ? "bg-green-100 text-green-600"
                                  : notification.type === "message"
                                  ? "bg-purple-100 text-purple-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {notification.type}
                            </span>
                            <p className="text-xs text-gray-500">
                              {formatNotificationTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1 ml-2 flex-shrink-0">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification._id);
                              }}
                              className="text-xs bg-blue-500 text-white px-2 py-[2px] h-[30px] mt-[8px] rounded hover:bg-blue-600 transition-colors"
                            >
                              Read
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearNotification(notification._id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Your notifications will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

     
      <div
        className={`fnt lg:hidden flex justify-between items-center p-4 border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-50 shadow-sm ${
          showNotifications ? "blur-sm" : ""
        }`}
      >
        <h1 className="text-2xl font-extrabold text-gray-800 tracking-wide">
          Siraj<span className="text-blue-500">Book</span>
        </h1>

       
        <div className="flex items-center gap-4">
        
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group"
            >
              <Bell
                size={26}
                className=" text-gray-600 group-hover:text-blue-500 transition-colors"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>

          <Link to={"/saved"}>
            <CiHeart className="mb-2 text-3xl text-gray-600 hover:text-red-500 transition-colors duration-300 cursor-pointer" />
          </Link>
        </div>
      </div>

      <div className="pt-16 lg:pt-0">
        <div className="p-4  mt-2 border-b border-gray-200 bg-white">
          <div
            className="flex space-x-4 overflow-x-auto pb-2 
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="flex flex-col items-center space-y-2 flex-shrink-0">
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 p-0.5 cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={handleCreateStory}
                >
                  <img
                    src={
                      userdata?.profileimg ||
                      "https://cdn-icons-png.flaticon.com/128/1144/1144760.png"
                    }
                    alt="Your story"
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </div>
                <div className="absolute -bottom-1 right-0 bg-white rounded-full p-0.5">
                  <div className="bg-blue-500 rounded-full p-1.5">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-600 font-medium">
                Your story
              </span>
            </div>

          
            {storyLoading
              ? 
                [...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center space-y-2 flex-shrink-0"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))
              : stories.map((storyGroup, index) => (
                  <div
                    key={storyGroup.user._id || index}
                    className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer"
                    onClick={() => handleStoryClick(storyGroup, index)}
                  >
                    <div className="relative">
                      <div
                        className={`w-16 h-16 rounded-full p-0.5 ${
                          hasViewedStory(storyGroup)
                            ? "bg-gradient-to-r from-gray-300 to-gray-400 border border-gray-300"
                            : "bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500"
                        } hover:scale-105 transition-transform duration-200`}
                      >
                        <img
                          src={
                            storyGroup.user.profileimg ||
                            "https://cdn-icons-png.flaticon.com/128/1144/1144760.png"
                          }
                          alt={storyGroup.user.username}
                          className="w-full h-full rounded-full object-cover border-2 border-white"
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 max-w-[60px] truncate">
                      {storyGroup.user.username || "User"}
                    </span>
                  </div>
                ))}

            {!storyLoading && stories.length === 0 && (
              <div className="flex flex-col items-center justify-center w-full py-4">
                <p className="text-gray-500 text-sm">No stories available</p>
                <button
                  onClick={handleCreateStory}
                  className="text-blue-500 text-sm mt-2 hover:text-blue-600"
                >
                  Create first story
                </button>
              </div>
            )}
          </div>
        </div>

        
        <div className="pb-2">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CiHeart className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-500 text-center mb-4">
                Be the first to share something amazing!
              </p>
              <button
                onClick={() => navigate("/upload")}
                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                Create First Post
              </button>
            </div>
          ) : (
            posts.map((post) => {
             
              const isSaved = savedPosts.has(post._id);

              return (
                <div
                  key={post._id}
                  className="bg-white border-b border-gray-200 mb-4"
                >
                
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 p-0.5 cursor-pointer"
                        onClick={() =>
                          handleUserProfileClick(post.author?.username)
                        }
                      >
                        <img
                          src={
                            post.author?.profileimg ||
                            "https://cdn-icons-png.flaticon.com/128/1144/1144760.png"
                          }
                          alt={post.author?.username}
                          className="w-full h-full rounded-full object-cover border-2 border-white"
                        />
                      </div>
                      <div>
                        <p
                          className="text-sm font-semibold cursor-pointer hover:text-blue-500 transition-colors"
                          onClick={() =>
                            handleUserProfileClick(post.author?.username)
                          }
                        >
                          {post.author?.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPostTime(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-500">
                      {userdata.location}
                    </p>
                  </div>

                 
                  <div className="w-full bg-black relative">
                    {post.mediatype === "image" ? (
                      <img
                        src={post.media}
                        alt="Post"
                        className="w-full h-auto max-h-96 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="relative">
                        <video
                          ref={(el) => (videoRefs.current[post._id] = el)}
                          src={post.media}
                          muted={videoStates[post._id]?.isMuted ?? true}
                          className="w-full h-auto max-h-96 object-contain"
                          onClick={() => toggleVideoPlay(post._id)}
                          onTimeUpdate={() => handleVideoTimeUpdate(post._id)}
                          onLoadedMetadata={() =>
                            handleVideoTimeUpdate(post._id)
                          }
                          playsInline
                          loop
                        />

                       
                        <div className="absolute inset-0 flex items-center justify-center">
                          {!videoStates[post._id]?.isPlaying && (
                            <button
                              onClick={() => toggleVideoPlay(post._id)}
                              className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
                            >
                              <IoIosPlay className="w-8 h-8 text-white" />
                            </button>
                          )}
                        </div>

                        {videoStates[post._id]?.duration > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleVideoPlay(post._id)}
                                className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                              >
                                {videoStates[post._id]?.isPlaying ? (
                                  <IoIosPause className="w-4 h-4 text-white" />
                                ) : (
                                  <IoIosPlay className="w-4 h-4 text-white" />
                                )}
                              </button>

                              <span className="text-xs text-white font-medium">
                                {formatTime(
                                  videoStates[post._id]?.currentTime || 0
                                )}
                              </span>

                             <input
                                type="range"
                                min="0"
                                max="100"
                                value={
                                  videoStates[post._id]?.duration
                                    ? (videoStates[post._id].currentTime /
                                        videoStates[post._id].duration) *
                                      100
                                    : 0
                                }
                                onChange={(e) =>
                                  handleVideoSeek(post._id, e.target.value)
                                }
                                className="flex-1 h-1 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                              />

                              <span className="text-xs text-white font-medium">
                                {formatTime(
                                  videoStates[post._id]?.duration || 0
                                )}
                              </span>

                              <button
                                onClick={() => toggleVideoMute(post._id)}
                                className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                              >
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  {videoStates[post._id]?.isMuted ? (
                                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                  ) : (
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                  )}
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`hover:scale-110 transition-transform duration-200 ${
                            likedPosts.has(post._id)
                              ? "text-red-500"
                              : "text-gray-700"
                          }`}
                        >
                          {likedPosts.has(post._id) ? (
                            <FaHeart className="w-6 h-6" />
                          ) : (
                            <CiHeart className="w-6 h-6" />
                          )}
                        </button>
                        <button
                          onClick={() => openCommentsModal(post)}
                          className="text-gray-700 hover:text-blue-500 hover:scale-110 transition-transform duration-200"
                        >
                          <FaRegComment className="w-5 h-5" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleSave(post._id)}
                        className={`hover:scale-110 transition-transform duration-200 ${
                          isSaved ? "text-yellow-500" : "text-gray-700"
                        }`}
                      >
                        {isSaved ? (
                          <FaBookmark className="w-6 h-6" />
                        ) : (
                          <CiBookmark className="w-6 h-6" />
                        )}
                      </button>
                    </div>

                    
                    {post.likes && post.likes.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-semibold text-gray-800">
                          {post.likes.length}{" "}
                          {post.likes.length === 1 ? "like" : "likes"}
                        </p>
                      </div>
                    )}

                  
                    {post.comments && post.comments.length > 0 && (
                      <div className="mb-2">
                        <button
                          onClick={() => openCommentsModal(post)}
                          className="text-sm text-gray-600 hover:text-blue-500 transition-colors"
                        >
                          View all {post.comments.length}{" "}
                          {post.comments.length === 1 ? "comment" : "comments"}
                        </button>
                      </div>
                    )}

                   
                    {post.caption && (
                      <div className="text-sm mb-2">
                        <span
                          className="font-semibold cursor-pointer hover:text-blue-500 transition-colors"
                          onClick={() =>
                            handleUserProfileClick(post.author?.username)
                          }
                        >
                          {post.author?.username}
                        </span>
                        <span className="ml-2 text-gray-800">
                          {expandedCaptions[post._id] ? (
                            post.caption
                          ) : (
                            <>
                              {needsSeeMore(post.caption) ? (
                                <>
                                  {truncateText(post.caption)}
                                  <button
                                    onClick={() => toggleCaption(post._id)}
                                    className="text-gray-500 hover:text-gray-700 text-sm ml-1 font-medium"
                                  >
                                    See More
                                  </button>
                                </>
                              ) : (
                                post.caption
                              )}
                            </>
                          )}
                          {expandedCaptions[post._id] &&
                            needsSeeMore(post.caption) && (
                              <button
                                onClick={() => toggleCaption(post._id)}
                                className="text-gray-500 hover:text-gray-700 text-sm ml-1 font-medium"
                              >
                                See Less
                              </button>
                            )}
                        </span>
                      </div>
                    )}

                 
                    <div className="flex items-center mt-3 border-t border-gray-200 pt-3 relative">
                      <div className="flex items-center flex-1 bg-gray-100 rounded-full px-4 py-2 transition-all duration-300">
                        <button
                          data-emoji-button={post._id}
                          onClick={() => toggleEmojiPicker(post._id)}
                          className="text-gray-500 text-lg mr-3 cursor-pointer hover:text-yellow-400 transition-colors duration-200"
                        >
                          <FaRegSmile />
                        </button>
                        <input
                          type="text"
                          value={commentTexts[post._id] || ""}
                          onChange={(e) =>
                            handleCommentChange(post._id, e.target.value)
                          }
                          placeholder="Add a comment..."
                          className="flex-1 text-sm text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-400"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddComment(post._id);
                            }
                          }}
                        />
                      </div>

                      <button
                        onClick={() => handleAddComment(post._id)}
                        className={`ml-3 text-sm font-semibold transition-all duration-300 ${
                          commentTexts[post._id]?.trim()
                            ? "text-blue-500 hover:text-blue-600"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!commentTexts[post._id]?.trim()}
                      >
                        Post
                      </button>

                      {showEmojiPicker === post._id && (
                        <div
                          ref={(el) => (emojiPickerRef.current[post._id] = el)}
                          className="absolute bottom-12 left-0 z-50"
                        >
                          <EmojiPicker
                            onEmojiClick={(emojiObject) =>
                              handleEmojiClick(post._id, emojiObject)
                            }
                            width={300}
                            height={400}
                            searchDisabled={false}
                            previewConfig={{
                              showPreview: false,
                            }}
                            skinTonesDisabled
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        
        {showStoryViewer && selectedStory && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <div className="relative w-full h-full max-w-md mx-auto flex items-center justify-center">
             
              <div className="absolute top-4 left-4 right-4 z-10 flex space-x-1">
                {selectedStory.stories.map((_, index) => (
                  <div
                    key={index}
                    className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden"
                  >
                    <div
                      className={`h-full bg-white transition-all duration-100 ${
                        index === currentStoryIndex
                          ? ""
                          : index < currentStoryIndex
                          ? "w-full"
                          : "w-0"
                      }`}
                      style={{
                        width:
                          index === currentStoryIndex
                            ? `${progress}%`
                            : index < currentStoryIndex
                            ? "100%"
                            : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

             
              <button
                onClick={closeStoryViewer}
                className="absolute top-6 right-4 z-10 text-white text-2xl"
              >
                <IoIosClose className="w-8 h-8" />
              </button>

              
              <div className="absolute top-4 left-4 z-10 flex items-center space-x-3">
                <img
                  src={
                    selectedStory.user.profileimg ||
                    "https://cdn-icons-png.flaticon.com/128/1144/1144760.png"
                  }
                  alt={selectedStory.user.username}
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <span className="text-white font-semibold text-sm">
                  {selectedStory.user.username}
                </span>
                <span className="text-gray-300 text-sm">
                  {formatPostTime(
                    selectedStory.stories[currentStoryIndex]?.createdAt
                  )}
                </span>
              </div>

            
              <div className="w-full h-full flex items-center justify-center bg-black">
                {selectedStory.stories[currentStoryIndex]?.mediatype ===
                "image" ? (
                  <img
                    src={selectedStory.stories[currentStoryIndex]?.media}
                    alt="Story"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      ref={storyVideoRef}
                      src={selectedStory.stories[currentStoryIndex]?.media}
                      autoPlay
                      muted
                      className="w-full h-full object-contain"
                      onEnded={handleNextStory}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                 
                    <button
                      onClick={toggleStoryPlayPause}
                      className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-20"
                    >
                      {!isPlaying && (
                        <IoIosPlay className="w-16 h-16 text-white opacity-70" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showCommentsModal && selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
              
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Comments</h3>
                <button
                  onClick={closeCommentsModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IoIosClose className="w-6 h-6" />
                </button>
              </div>

             
              <div className="flex-1 overflow-y-auto p-4">
                {selectedPost.comments && selectedPost.comments.length > 0 ? (
                  <div className="space-y-4">
                    {selectedPost.comments.map((comment, index) => (
                      <div
                        key={comment._id || index}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 p-0.5 flex-shrink-0 cursor-pointer"
                          onClick={() =>
                            handleUserProfileClick(comment.author?.username)
                          }
                        >
                          <img
                            src={
                              comment.author?.profileimg ||
                              "https://cdn-icons-png.flaticon.com/128/1144/1144760.png"
                            }
                            alt={comment.author?.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-2xl p-3 max-w-[280px]">
                            <p
                              className="font-semibold text-sm cursor-pointer hover:text-blue-500 transition-colors"
                              onClick={() =>
                                handleUserProfileClick(comment.author?.username)
                              }
                            >
                              {comment.author?.username}
                            </p>
                            <p className="text-sm mt-1 text-gray-800 break-words">
                              {comment.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <FaRegComment className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No comments yet</p>
                    <p className="text-sm">Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

       
      </div>

      <BottomNav />
      <Footer />
    </div>
  );
}
