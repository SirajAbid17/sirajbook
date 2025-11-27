import axios from "axios";
import React, { useEffect, useState } from "react";
import { ServerUrl } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setprofiledata } from "../redux/userslice";
import Lefthome from "./Lefthome";
import { ArrowLeft, MapPin, Calendar, Link as LinkIcon, Edit3 } from "lucide-react"; 
import { Link } from "react-router-dom";
import Footer from "./Footer";
import { MdOutlineVideoCameraBack, MdPhotoLibrary, MdBookmarkBorder } from "react-icons/md";
import { CiHeart, CiChat1,  CiPlay1 } from "react-icons/ci";
import { TbUserCheck, TbUserPlus } from "react-icons/tb";

export default function Profile() {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { profiledata, userdata } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [reels, setReels] = useState([]);

  const defaultImg = "https://cdn-icons-png.flaticon.com/128/1144/1144760.png";


  const handleProfile = async () => {
    try {
      setLoading(true);
      const result = await axios.get(
        `${ServerUrl}/api/getprofile/${username}`,
        { withCredentials: true }
      );

      const userData = result.data.user || result.data;
      dispatch(setprofiledata(userData));

     
      if (userdata && userData.followers) {
        setIsFollowing(userData.followers.some(follower => follower._id === userdata._id));
      }
      await fetchUserPosts(userData._id);
      
      
      if (userData._id === userdata?._id) {
        await fetchSavedPosts();
      }

 
      await fetchUserReels(userData._id);

      setError(null);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile!");
    } finally {
      setLoading(false);
    }
  };

  

  const fetchUserPosts = async (userId) => {
    try {
      const response = await axios.get(`${ServerUrl}/api/user/posts/${userId}`, {
        withCredentials: true
      });
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchSavedPosts = async () => {
    try {
      const response = await axios.get(`${ServerUrl}/api/savedposts`, {
        withCredentials: true
      });
      setSavedPosts(response.data.savedPosts || []);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    }
  };

  const fetchUserReels = async (userId) => {
    try {
      const response = await axios.get(`${ServerUrl}/api/user/reels/${userId}`, {
        withCredentials: true
      });
      setReels(response.data.reels || []);
    } catch (error) {
      console.error("Error fetching reels:", error);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axios.delete(`${ServerUrl}/api/unfollow/${profiledata._id}`, {
          withCredentials: true
        });
      } else {
        await axios.post(`${ServerUrl}/api/follow/${profiledata._id}`, {}, {
          withCredentials: true
        });
      }
      setIsFollowing(!isFollowing);
      handleProfile(); 
    } catch (error) {
      console.error("Follow error:", error);
      toast.error("Failed to follow user");
    }
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return "Joined recently";
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  };

  const editprofile = () => {
    navigate('/editprofile');
  };

  const navigateToMessages = () => {
    navigate('/messages', { state: { user: profiledata } });
  };

  useEffect(() => {
    if (username) {
      handleProfile();
    }
  }, [username]);

  if (loading)
    return (
      <div className="flex min-h-screen bg-white">
      
        <div className="hidden lg:flex w-1/5 border-r border-gray-200">
          <Lefthome />
        </div>

       
        <div className="flex-1 flex flex-col min-h-screen">
        
          <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
            <div className="flex items-center px-4 py-3">
              <div className="p-2 rounded-full transition duration-200 mr-4">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </div>
              <div>
                <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="flex-1">
          
            <div className="bg-white border-b border-gray-200 mt-16">
              
              <div className="px-4 pb-6">
               
                <div className="flex justify-between items-start -mt-16 mb-4">
                  <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                  
                  <div className="flex space-x-3 mt-4">
                    <div className="w-32 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="w-24 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>

               
                <div className="mb-4">
                  <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>

               
                <div className="mb-4">
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="flex flex-wrap gap-4">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

              
                <div className="flex space-x-6">
                  <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

            
              <div className="flex border-b border-gray-200">
                <div className="flex-1 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-12 h-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex-1 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-12 h-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex-1 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-12 h-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

           
            <div className="max-w-4xl mx-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-gray-200 rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                    <div className="w-full h-64 bg-gray-300"></div>
                    <div className="p-3">
                      <div className="w-full h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="w-3/4 h-4 bg-gray-300 rounded mb-3"></div>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                          <div className="w-12 h-4 bg-gray-300 rounded"></div>
                          <div className="w-12 h-4 bg-gray-300 rounded"></div>
                        </div>
                        <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

         
          <div className="w-full mt-auto">
            <Footer />
          </div>
        </div>
      </div>
    );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button 
          onClick={handleProfile}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const isOwnProfile = profiledata?._id === userdata?._id;


  const VideoPlayer = ({ src, className, onClick, isReel = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div 
        className={`relative overflow-hidden ${className} group cursor-pointer`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        <video
          src={src}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          preload="metadata"
          muted={!isReel}
          loop={isReel}
        >
          Your browser does not support the video tag.
        </video>
       
        <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center ${isReel ? 'bg-gradient-to-t from-black/40 to-transparent' : ''}`}>
          {isReel && (
            <div className="absolute bottom-3 left-3 flex items-center space-x-2 text-white">
              <CiPlay1 className="w-4 h-4" />
              <span className="text-sm font-medium">Play</span>
            </div>
          )}
          
          {isHovered && !isReel && (
            <div className="flex items-center space-x-4 text-white">
              <div className="flex items-center space-x-1">
                <CiHeart className="w-5 h-5" />
                <span className="text-sm font-medium">Like</span>
              </div>
              <div className="flex items-center space-x-1">
                <CiChat1 className="w-5 h-5" />
                <span className="text-sm font-medium">Comment</span>
              </div>
            </div>
          )}
        </div>

       
        {isReel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <CiPlay1 className="w-6 h-6 text-black" />
            </div>
          </div>
        )}
      </div>
    );
  };

  
  const PostCard = ({ post, onClick }) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition duration-200 cursor-pointer">
        {post.mediatype === "image" ? (
          <img
            src={post.media}
            alt={post.caption}
            className="w-full h-64 object-cover"
            onClick={onClick}
          />
        ) : (
          <VideoPlayer
            src={post.media}
            className="h-64"
            onClick={onClick}
          />
        )}
        <div className="p-3">
          <p className="text-sm text-gray-700 line-clamp-2 mb-2">
            {post.caption}
          </p>
          <div className="flex justify-between items-center text-gray-500 text-sm">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-1">
                <CiHeart className="w-4 h-4" />
                <span>{post.likes?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CiChat1 className="w-4 h-4" />
                <span>{post.comments?.length || 0}</span>
              </div>
            </div>
           
          </div>
        </div>
      </div>
    );
  };

  const ReelCard = ({ reel, onClick }) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition duration-200 cursor-pointer">
        <VideoPlayer
          src={reel.media}
          className="h-80"
          onClick={onClick}
          isReel={true}
        />
        <div className="p-3">
          <p className="text-sm text-gray-700 line-clamp-2">
            {reel.caption}
          </p>
          <div className="flex justify-between items-center text-gray-500 text-sm mt-2">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-1">
                <CiHeart className="w-4 h-4" />
                <span>{reel.likes?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CiChat1 className="w-4 h-4" />
                <span>{reel.comments?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-white">
      
      <div className="hidden lg:flex w-1/5 border-r border-gray-200">
        <Lefthome />
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
       
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center px-4 py-3">
            <Link
              to="/"
              className="p-2 hover:bg-gray-100 rounded-full transition duration-200 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">{profiledata?.name || "User"}</h1>
              <p className="text-sm text-gray-500">{posts.length} posts</p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          
          <div className="bg-white border-b border-gray-200 mt-16">
           

           
            <div className="px-4 pb-6">
             
              <div className="flex justify-between items-start -mt-16 mb-4">
                <img
                  src={profiledata?.profileimg || defaultImg}
                  alt={profiledata?.username}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                
                <div className="flex space-x-3 mt-4">
                  {isOwnProfile ? (
                    <button 
                      onClick={editprofile}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition duration-200"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={handleFollow}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-full font-medium transition duration-200 ${
                          isFollowing 
                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                      >
                        {isFollowing ? <TbUserCheck className="w-5 h-5" /> : <TbUserPlus className="w-5 h-5" />}
                        <span>{isFollowing ? 'Following' : 'Follow'}</span>
                      </button>
                      <button 
                        onClick={navigateToMessages}
                        className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition duration-200 font-medium"
                      >
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>

             
              <div className="mb-4">
                <h2 className="text-2xl font-bold">{profiledata?.name}</h2>
                <p className="text-gray-500">@{profiledata?.username}</p>
              </div>

       
<div className="mb-4">
  <p className="text-gray-800 mb-3">
    {profiledata?.bio || "No bio yet."}
  </p>
  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
    {profiledata?.location && (
      <div className="flex items-center space-x-1">
        <MapPin className="w-4 h-4" />
        <span>{profiledata.location}</span>
      </div>
    )}

    {profiledata?.website && (
      <div className="flex items-center space-x-1">
        <LinkIcon className="w-4 h-4" />
        <a 
          href={profiledata.website.startsWith('http') ? profiledata.website : `https://${profiledata.website}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {profiledata.website.replace(/(^\w+:|^)\/\//, '')}
        </a>
      </div>
    )}

   
  </div>
   <div className="flex items-center space-x-1 mt-2">
      <Calendar className="w-4 h-4" />
      <span>{formatJoinDate(profiledata?.createdAt)}</span>
    </div>
</div>

             
              <div className="flex space-x-6">
                <div className="flex items-center space-x-1">
                  <span className="font-bold">{profiledata?.following?.length || 0}</span>
                  <span className="text-gray-500">Following</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-bold">{profiledata?.followers?.length || 0}</span>
                  <span className="text-gray-500">Followers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-bold">{posts.length}</span>
                  <span className="text-gray-500">Posts</span>
                </div>
              </div>
            </div>

            
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 py-4 text-center font-medium border-b-2 transition duration-200 ${
                  activeTab === "posts" 
                    ? "border-black text-black" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <MdPhotoLibrary className="w-5 h-5" />
                  <span>Posts</span>
                </div>
              </button>
              {isOwnProfile && (
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`flex-1 py-4 text-center font-medium border-b-2 transition duration-200 ${
                    activeTab === "saved" 
                      ? "border-black text-black" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <MdBookmarkBorder className="w-5 h-5" />
                    <span>Saved</span>
                  </div>
                </button>
              )}
              <button
                onClick={() => setActiveTab("reels")}
                className={`flex-1 py-4 text-center font-medium border-b-2 transition duration-200 ${
                  activeTab === "reels" 
                    ? "border-black text-black" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <MdOutlineVideoCameraBack className="w-5 h-5" />
                  <span>Reels</span>
                </div>
              </button>
            </div>
          </div>

         
          <div className="max-w-4xl mx-auto p-4">
            {activeTab === "posts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard 
                      key={post._id} 
                      post={post}
                      onClick={() => navigate(`/post/${post._id}`)}
                    />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <MdPhotoLibrary className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-500">
                      {isOwnProfile ? "Share your first post with the world!" : "This user hasn't posted anything yet."}
                    </p>
                    {isOwnProfile && (
                      <button 
                        onClick={() => navigate('/upload')}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-200"
                      >
                        Create Post
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "saved" && isOwnProfile && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedPosts.length > 0 ? (
                  savedPosts.map((post) => (
                    <PostCard 
                      key={post._id} 
                      post={post}
                      onClick={() => navigate(`/post/${post._id}`)}
                    />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <MdBookmarkBorder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No saved posts</h3>
                    <p className="text-gray-500">Save posts you'd like to keep for later.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reels" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reels.length > 0 ? (
                  reels.map((reel) => (
                    <ReelCard 
                      key={reel._id} 
                      reel={reel}
                      onClick={() => navigate(`/reel/${reel._id}`)}
                    />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <MdOutlineVideoCameraBack className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reels yet</h3>
                    <p className="text-gray-500">
                      {isOwnProfile ? "Create your first reel!" : "This user hasn't created any reels yet."}
                    </p>
                    {isOwnProfile && (
                      <button 
                        onClick={() => navigate('/upload')}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-200"
                      >
                        Create Reel
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

       
        <div className="w-full mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}