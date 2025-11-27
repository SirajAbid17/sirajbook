import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ServerUrl } from "../App";
import { ArrowLeft, Heart, MessageCircle, Share, Bookmark } from "lucide-react";
import { useSelector } from "react-redux";
import Lefthome from "./Lefthome";
import Footer from "./Footer";

export default function Reel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.user);
  const [reel, setReel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const videoRef = useRef(null);

  const defaultImg = "https://cdn-icons-png.flaticon.com/128/1144/1144760.png";

  const fetchReel = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${ServerUrl}/api/reels`, {
        withCredentials: true,
      });
      
      const allReels = response.data.reels || [];
      const foundReel = allReels.find(r => r._id === id);
      
      if (foundReel) {
        setReel(foundReel);
        setLikesCount(foundReel.likes?.length || 0);
        setLiked(foundReel.likes?.some(like => like._id === userdata?._id) || false);
        setComments(foundReel.comments || []);
        setError(null);
      } else {
        setError("Reel not found");
      }
    } catch (err) {
      console.error("Error fetching reel:", err);
      setError("Failed to load reel");
    } finally {
      setLoading(false);
    }
  };

  
  const fetchReelFromPosts = async () => {
    try {
      setLoading(true);
      
     
      const response = await axios.get(`${ServerUrl}/api/posts`, {
        withCredentials: true,
      });
      
      const allPosts = response.data.posts || [];
      const foundPost = allPosts.find(p => p._id === id && p.mediatype === "video");
      
      if (foundPost) {
        setReel({
          ...foundPost,
        
        });
        setLikesCount(foundPost.likes?.length || 0);
        setLiked(foundPost.likes?.some(like => like._id === userdata?._id) || false);
        setComments(foundPost.comments || []);
        setError(null);
      } else {
        setError("Reel not found");
      }
    } catch (err) {
      console.error("Error fetching reel from posts:", err);
      setError("Failed to load reel");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!userdata) {
      navigate('/login');
      return;
    }

    try {
      if (liked) {
        await axios.delete(`${ServerUrl}/api/unlike/${id}`, {
          withCredentials: true,
        });
        setLikesCount(prev => prev - 1);
      } else {
        await axios.post(`${ServerUrl}/api/like/${id}`, {}, {
          withCredentials: true,
        });
        setLikesCount(prev => prev + 1);
      }
      setLiked(!liked);
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!userdata || !newComment.trim()) return;

    try {
      const response = await axios.post(
        `${ServerUrl}/api/comment/${id}`,
        { text: newComment },
        { withCredentials: true }
      );

      setComments(prev => [response.data.comment, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  useEffect(() => {
    if (id) {
    
      fetchReel().catch(() => {
        fetchReelFromPosts();
      });
    }
  }, [id]);

  if (loading)
    return (
      <div className="flex min-h-screen bg-black">
        <div className="hidden lg:flex w-1/5 border-r border-gray-800">
          <Lefthome />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-lg">Loading reel...</p>
          </div>
        </div>
      </div>
    );

  if (error || !reel)
    return (
      <div className="flex min-h-screen bg-black">
        <div className="hidden lg:flex w-1/5 border-r border-gray-800">
          <Lefthome />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">{error || "Reel not found"}</p>
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-black text-white">
    
      <div className="hidden lg:flex w-1/5 border-r border-gray-800">
        <Lefthome />
      </div>

      <div className="flex-1 flex flex-col">
       
        <div className="sticky top-0 bg-black border-b border-gray-800 z-10">
          <div className="flex items-center px-4 py-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-800 rounded-full transition duration-200 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Reel</h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full">
        
          <div className="lg:w-3/5 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md">
              <video
                ref={videoRef}
                src={reel.media}
                controls
                autoPlay
                loop
                className="w-full h-full max-h-[80vh] rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

      
          <div className="lg:w-2/5 border-l border-gray-800 flex flex-col h-[calc(100vh-80px)]">
           
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <img
                  src={reel.userId?.profileimg || defaultImg}
                  alt={reel.userId?.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <Link 
                    to={`/profile/${reel.userId?.username}`}
                    className="font-semibold hover:underline"
                  >
                    {reel.userId?.username}
                  </Link>
                  <p className="text-sm text-gray-400">{reel.userId?.name}</p>
                </div>
              </div>
              {reel.caption && (
                <p className="mt-3 text-gray-300">{reel.caption}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {new Date(reel.createdAt).toLocaleDateString()}
              </p>
            </div>

     
            <div className="flex-1 overflow-y-auto p-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3 mb-4">
                    <img
                      src={comment.userId?.profileimg || defaultImg}
                      alt={comment.userId?.username}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <Link 
                          to={`/profile/${comment.userId?.username}`}
                          className="font-semibold text-sm hover:underline"
                        >
                          {comment.userId?.username}
                        </Link>
                        <p className="text-gray-300 mt-1">{comment.text}</p>
                      </div>
                      <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No comments yet</p>
                </div>
              )}
            </div>

      
            <div className="border-t border-gray-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex space-x-4">
                  <button
                    onClick={handleLike}
                    className={`p-2 rounded-full transition duration-200 ${
                      liked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
                  </button>
                  <button className="p-2 rounded-full text-gray-400 hover:text-blue-400 transition duration-200">
                    <MessageCircle className="w-6 h-6" />
                  </button>
                  <button className="p-2 rounded-full text-gray-400 hover:text-green-400 transition duration-200">
                    <Share className="w-6 h-6" />
                  </button>
                </div>
                <button className="p-2 rounded-full text-gray-400 hover:text-yellow-400 transition duration-200">
                  <Bookmark className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-3">
                <p className="font-semibold">{likesCount} likes</p>
              </div>

            
              {userdata && (
                <form onSubmit={handleComment} className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 border border-gray-700 bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    Post
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

    
      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
}