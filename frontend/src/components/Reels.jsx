import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CiHeart, CiBookmark } from "react-icons/ci";
import {
  FaHeart,
  FaBookmark,
  FaRegComment,
  FaPlay,
  FaPause,
  FaRegSmile,
  FaArrowLeft,
} from "react-icons/fa";
import { MdMoreHoriz, MdClose } from "react-icons/md";
import BottomNav from "./BottomNav";
import Righthome from "./Righthome";
import Lefthome from "./Lefthome";

export default function ReelsPage() {
  const { userdata } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [likedReels, setLikedReels] = useState(new Set());
  const [savedReels, setSavedReels] = useState(new Set());
  const [commentTexts, setCommentTexts] = useState({});
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedReel, setSelectedReel] = useState(null);
  const videoRefs = useRef([]);

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    if (reels.length > 0 && userdata) {
      const initialLiked = new Set();
      reels.forEach((reel) => {
        if (reel.likes && reel.likes.includes(userdata._id)) {
          initialLiked.add(reel._id);
        }
      });
      setLikedReels(initialLiked);
    }
  }, [reels, userdata]);

  const fetchReels = async () => {
    try {
      const response = await axios.get(`${ServerUrl}/api/allreels`, {
        withCredentials: true,
      });
      setReels(response.data);
    } catch (error) {
      console.error("Error fetching reels:", error);
      toast.error("Failed to load reels");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reelId) => {
    const originalReels = [...reels];
    const wasLiked = likedReels.has(reelId);

    try {
      setReels((prevReels) =>
        prevReels.map((reel) =>
          reel._id === reelId
            ? {
                ...reel,
                likes: wasLiked
                  ? (reel.likes || []).filter(
                      (id) => id.toString() !== userdata?._id.toString()
                    )
                  : [...(reel.likes || []), userdata?._id],
              }
            : reel
        )
      );

      if (wasLiked) {
        setLikedReels((prev) => {
          const newSet = new Set(prev);
          newSet.delete(reelId);
          return newSet;
        });
      } else {
        setLikedReels((prev) => new Set(prev).add(reelId));
      }

      await axios.put(
        `${ServerUrl}/api/reel/${reelId}/like`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Error liking reel:", error);
      toast.error("Failed to like reel");
      setReels(originalReels);
    }
  };

  const handleSave = async (reelId) => {
    const wasSaved = savedReels.has(reelId);

    try {
      if (wasSaved) {
        setSavedReels((prev) => {
          const newSet = new Set(prev);
          newSet.delete(reelId);
          return newSet;
        });
      } else {
        setSavedReels((prev) => new Set(prev).add(reelId));
      }

      await axios.put(
        `${ServerUrl}/api/reel/${reelId}/save`,
        {},
        {
          withCredentials: true,
        }
      );

      toast.success(wasSaved ? "Reel removed from saved" : "Reel saved");
    } catch (error) {
      console.error("Error saving reel:", error);
      toast.error("Failed to save reel");
    }
  };

  const handleAddComment = async (reelId) => {
    const comment = commentTexts[reelId];
    if (!comment?.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      const tempComment = {
        _id: `temp-${Date.now()}`,
        message: comment,
        author: userdata,
        createdAt: new Date().toISOString(),
      };

      setReels((prevReels) =>
        prevReels.map((reel) =>
          reel._id === reelId
            ? {
                ...reel,
                comments: [...(reel.comments || []), tempComment],
              }
            : reel
        )
      );

      if (showCommentsModal && selectedReel && selectedReel._id === reelId) {
        setSelectedReel((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), tempComment],
        }));
      }

      setCommentTexts((prev) => ({ ...prev, [reelId]: "" }));

      await axios.post(
        `${ServerUrl}/api/reel/${reelId}/comment`,
        { message: comment },
        { withCredentials: true }
      );

      await fetchReels();
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
      await fetchReels();
    }
  };

  const handleCommentChange = (reelId, text) => {
    setCommentTexts((prev) => ({
      ...prev,
      [reelId]: text,
    }));
  };

  const togglePlay = () => {
    const currentVideo = videoRefs.current[currentReelIndex];
    if (currentVideo) {
      if (playing) {
        currentVideo.pause();
      } else {
        currentVideo.play();
      }
      setPlaying(!playing);
    }
  };

  const handleScroll = (e) => {
    const container = e.target;
    const reelHeight = container.clientHeight;
    const scrollTop = container.scrollTop;
    const newIndex = Math.round(scrollTop / reelHeight);

    if (newIndex !== currentReelIndex) {
      if (videoRefs.current[currentReelIndex]) {
        videoRefs.current[currentReelIndex].pause();
      }

      setCurrentReelIndex(newIndex);
      setPlaying(true);

      setTimeout(() => {
        if (videoRefs.current[newIndex]) {
          videoRefs.current[newIndex].play().catch(console.error);
        }
      }, 100);
    }
  };

  const openCommentsModal = async (reel) => {
    try {
      const response = await axios.get(`${ServerUrl}/api/allreels`, {
        withCredentials: true,
      });
      const updatedReels = response.data;
      const updatedReel = updatedReels.find((r) => r._id === reel._id);

      setSelectedReel(updatedReel || reel);
      setShowCommentsModal(true);
    } catch (error) {
      console.error("Error fetching updated reel:", error);
      setSelectedReel(reel);
      setShowCommentsModal(true);
    }
  };

  const closeCommentsModal = () => {
    setShowCommentsModal(false);
    setSelectedReel(null);
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Just now";

    try {
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
    } catch (error) {
      return "Just now";
    }
  };

  const getAuthorInfo = (author) => {
    if (!author)
      return {
        username: "Unknown User",
        profileimg:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      };

    return {
      username: author.username || "Unknown User",
      profileimg:
        author.profileimg ||
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    };
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-md h-full bg-black flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-white text-sm">Loading reels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white overflow-hidden flex justify-center items-center">
      <Lefthome />
      <ToastContainer position="top-center" autoClose={2000} theme="dark" />

      <div className="w-full max-w-md h-full relative bg-black shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-40 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:text-gray-300 transition-colors p-2 -ml-2"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white absolute left-1/2 -translate-x-1/2">
              Reels
            </h1>
            <div className="w-9"></div>
          </div>
        </div>

        <div
          className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {reels.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <CiHeart className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No reels yet
              </h3>
              <p className="text-gray-400 text-center mb-6">
                Be the first to create a reel!
              </p>
              <button
                onClick={() => navigate("/upload")}
                className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Create Reel
              </button>
            </div>
          ) : (
            reels.map((reel, index) => {
              const authorInfo = getAuthorInfo(reel.author);
              const commentsCount = reel.comments ? reel.comments.length : 0;
              const likesCount = reel.likes ? reel.likes.length : 0;
              const isLiked =
                likedReels.has(reel._id) ||
                (reel.likes && reel.likes.includes(userdata?._id));

              return (
                <div
                  key={reel._id}
                  className="h-screen w-full snap-start relative flex items-center justify-center"
                >
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={reel.media}
                    className="absolute inset-0 w-full h-full object-cover"
                    loop
                    muted={false}
                    autoPlay={index === currentReelIndex}
                    onClick={togglePlay}
                  />

                  {!playing && index === currentReelIndex && (
                    <div
                      className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                      onClick={togglePlay}
                    >
                      <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center">
                        <FaPlay className="text-3xl text-white ml-1" />
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-32 pb-20 px-4 z-20">
                    {reel.caption && (
                      <p className="text-white text-sm mb-3 leading-relaxed">
                        {reel.caption}
                      </p>
                    )}

                    <div className="flex items-center space-x-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5 cursor-pointer"
                        onClick={() =>
                          navigate(`/profile/${authorInfo.username}`)
                        }
                      >
                        <img
                          src={authorInfo.profileimg}
                          alt={authorInfo.username}
                          className="w-full h-full rounded-full object-cover border-2 border-black"
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className="font-semibold text-white cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            navigate(`/profile/${authorInfo.username}`)
                          }
                        >
                          {authorInfo.username}
                        </p>
                        <p className="text-xs text-gray-300">
                          {formatTime(reel.createdAt)}
                        </p>
                      </div>
                      <button className="text-white/80 hover:text-white">
                        <MdMoreHoriz className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-5">
                        <button
                          onClick={() => handleLike(reel._id)}
                          className="flex items-center space-x-1.5"
                        >
                          {isLiked ? (
                            <FaHeart className="w-6 h-6 text-red-500" />
                          ) : (
                            <CiHeart
                              className="w-6 h-6 text-white"
                              strokeWidth={1}
                            />
                          )}
                          <span className="text-white text-sm font-medium">
                            {likesCount}
                          </span>
                        </button>

                        <button
                          onClick={() => openCommentsModal(reel)}
                          className="flex items-center space-x-1.5"
                        >
                          <FaRegComment className="w-5 h-5 text-white" />
                          <span className="text-white text-sm font-medium">
                            {commentsCount}
                          </span>
                        </button>
                      </div>

                      <button onClick={() => handleSave(reel._id)}>
                        {savedReels.has(reel._id) ? (
                          <FaBookmark className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <CiBookmark
                            className="w-6 h-6 text-white"
                            strokeWidth={1}
                          />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-4 py-2.5">
                      <FaRegSmile className="text-white/70 text-lg mr-3 cursor-pointer hover:text-white" />
                      <input
                        type="text"
                        value={commentTexts[reel._id] || ""}
                        onChange={(e) =>
                          handleCommentChange(reel._id, e.target.value)
                        }
                        placeholder="Add a comment..."
                        className="flex-1 text-sm text-white bg-transparent border-none focus:outline-none placeholder-white/50"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddComment(reel._id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(reel._id)}
                        className={`ml-2 text-sm font-semibold ${
                          commentTexts[reel._id]?.trim()
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-white/30 cursor-not-allowed"
                        }`}
                        disabled={!commentTexts[reel._id]?.trim()}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showCommentsModal && selectedReel && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md mx-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Comments</h3>
              <button
                onClick={closeCommentsModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {selectedReel.comments && selectedReel.comments.length > 0 ? (
                <div className="space-y-5">
                  {selectedReel.comments.map((comment, index) => {
                    const commentAuthor = getAuthorInfo(comment.author);
                    return (
                      <div
                        key={comment._id || index}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5 flex-shrink-0 cursor-pointer"
                          onClick={() =>
                            navigate(`/profile/${commentAuthor.username}`)
                          }
                        >
                          <img
                            src={commentAuthor.profileimg}
                            alt={commentAuthor.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-800 rounded-2xl px-4 py-2.5">
                            <p
                              className="font-semibold text-sm text-white cursor-pointer hover:opacity-80"
                              onClick={() =>
                                navigate(`/profile/${commentAuthor.username}`)
                              }
                            >
                              {commentAuthor.username}
                            </p>
                            <p className="text-sm mt-0.5 text-gray-200 break-words leading-relaxed">
                              {comment.message}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1.5 ml-3">
                            {formatTime(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <FaRegComment className="w-16 h-16 mx-auto mb-3 text-gray-600" />
                  <p className="text-lg font-medium">No comments yet</p>
                  <p className="text-sm mt-1">Be the first to comment!</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-700 px-5 py-4">
              <div className="flex items-center bg-gray-800 rounded-full px-4 py-2.5">
                <FaRegSmile className="text-gray-400 text-lg mr-3 cursor-pointer hover:text-yellow-400" />
                <input
                  type="text"
                  value={commentTexts[selectedReel._id] || ""}
                  onChange={(e) =>
                    handleCommentChange(selectedReel._id, e.target.value)
                  }
                  placeholder="Add a comment..."
                  className="flex-1 text-sm text-white bg-transparent border-none focus:outline-none placeholder-gray-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddComment(selectedReel._id);
                    }
                  }}
                />
                <button
                  onClick={() => handleAddComment(selectedReel._id)}
                  className={`ml-2 text-sm font-semibold ${
                    commentTexts[selectedReel._id]?.trim()
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-gray-600 cursor-not-allowed"
                  }`}
                  disabled={!commentTexts[selectedReel._id]?.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Righthome />

      <BottomNav />
    </div>
  );
}
