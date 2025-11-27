import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaBookmark, FaRegBookmark, FaHeart, FaRegComment, FaRegHeart, FaHome, FaSearch, FaPlusSquare, FaUser } from "react-icons/fa";
import { CiBookmark, CiHeart, CiChat1, CiShare2 } from "react-icons/ci";
import BottomNav from "./BottomNav";
import Lefthome from "./Lefthome";
import Footer from "./Footer";

export default function Saved() {
  const { userdata } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${ServerUrl}/api/savedposts`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setSavedPosts(response.data.savedPosts || []);
        
      
        const initialLiked = new Set();
        response.data.savedPosts.forEach((post) => {
          if (post.likes && post.likes.includes(userdata?._id)) {
            initialLiked.add(post._id);
          }
        });
        setLikedPosts(initialLiked);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      toast.error("Failed to load saved posts");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    const originalLiked = new Set(likedPosts);
    const wasLiked = likedPosts.has(postId);

    try {
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

      
      setSavedPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? {
                ...post,
                likes: wasLiked
                  ? post.likes.filter(id => id !== userdata?._id)
                  : [...post.likes, userdata?._id],
              }
            : post
        )
      );

      toast.success(wasLiked ? "Post unliked" : "Post liked");
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
      setLikedPosts(originalLiked);
    }
  };

  const handleUnsave = async (postId) => {
    try {
      const response = await axios.get(`${ServerUrl}/api/saved/${postId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setSavedPosts(prev => prev.filter(post => post._id !== postId));
        toast.success("Post removed from saved");
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error unsaving post:", error);
      toast.error("Failed to remove post from saved");
    }
  };

  const handleUserProfileClick = (username) => {
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
      
        <div className="hidden lg:flex w-1/5 border-r border-gray-200">
          <Lefthome />
        </div>
      
        <div className="flex-1 flex flex-col">
        
          <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-50 shadow-sm">
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-wide">
              Saved <span className="text-blue-500">Posts</span>
            </h1>
          </div>

         
          <div className="flex-1 flex items-center justify-center pt-16 lg:pt-0">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading saved posts...</p>
            </div>
          </div>

        
          <div className="lg:hidden">
            <BottomNav />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
    
      <div className="hidden lg:flex w-1/5 border-r border-gray-200">
        <Lefthome />
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        <ToastContainer position="top-center" autoClose={3000} />

        <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-50 shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-wide">
            Saved <span className="text-blue-500">Posts</span>
          </h1>
        </div>

        <div className="flex-1 pt-16 lg:pt-0">
         
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <FaBookmark className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Saved Posts</h1>
                <p className="text-gray-600">
                  {savedPosts.length} {savedPosts.length === 1 ? 'post' : 'posts'} saved
                </p>
              </div>
            </div>
          </div>

          {savedPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaRegBookmark className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2 text-center">
                No saved posts yet
              </h3>
              <p className="text-gray-500 text-center mb-4">
                Save posts you'd like to keep for later
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                Explore Posts
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {savedPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                 
                  <div 
                    className="relative aspect-square bg-black cursor-pointer"
                    onClick={() => handlePostClick(post._id)}
                  >
                    {post.mediatype === "image" ? (
                      <img
                        src={post.media}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={post.media}
                        className="w-full h-full object-cover"
                        muted
                        loop
                      />
                    )}

                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(post._id);
                          }}
                          className={`flex items-center gap-2 text-white ${
                            likedPosts.has(post._id) ? 'text-red-500' : ''
                          }`}
                        >
                          {likedPosts.has(post._id) ? (
                            <FaHeart className="w-5 h-5" />
                          ) : (
                            <FaRegHeart className="w-5 h-5" />
                          )}
                          <span>{post.likes?.length || 0}</span>
                        </button>
                        
                        <button 
                          className="flex items-center gap-2 text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaRegComment className="w-5 h-5" />
                          <span>{post.comments?.length || 0}</span>
                        </button>
                      </div>
                    </div>

                 
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnsave(post._id);
                      }}
                      className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100 transition-all duration-200"
                    >
                      <FaBookmark className="text-yellow-500 w-4 h-4" />
                    </button>
                  </div>

                 
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserProfileClick(post.author?.username);
                        }}
                      >
                        <img
                          src={post.author?.profileimg || "https://cdn-icons-png.flaticon.com/128/1144/1144760.png"}
                          alt={post.author?.username}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm font-semibold text-gray-800 hover:text-blue-500 transition-colors">
                          {post.author?.username}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatPostTime(post.createdAt)}
                      </span>
                    </div>

                    {post.caption && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.caption}
                      </p>
                    )}

                  
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-gray-500">
                        <div className="flex items-center gap-1">
                          <CiHeart className="w-4 h-4" />
                          <span className="text-xs">{post.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CiChat1 className="w-4 h-4" />
                          <span className="text-xs">{post.comments?.length || 0}</span>
                        </div>
                      </div>
                      <CiShare2 className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

     
        <div className="hidden lg:block w-full mt-auto">
          <Footer />
        </div>

      
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}