
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useSelector } from 'react-redux';
import { ArrowLeft, Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import Lefthome from './Lefthome';
import Footer from './Footer';

export default function Post() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.user);
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const defaultImg = "https://cdn-icons-png.flaticon.com/128/1144/1144760.png";


  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${ServerUrl}/api/post/${id}`, {
        withCredentials: true
      });
      setPost(response.data.post);
      setError(null);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Post not found or failed to load');
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
      const response = await axios.post(
        `${ServerUrl}/api/post/${id}/like`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setPost(prev => ({
          ...prev,
          likes: response.data.isLiked 
            ? [...prev.likes, userdata._id]
            : prev.likes.filter(likeId => likeId !== userdata._id)
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !userdata) return;

    try {
      setIsCommenting(true);
      const response = await axios.post(
        `${ServerUrl}/api/post/${id}/comment`,
        { text: commentText },
        { withCredentials: true }
      );

      if (response.data.success) {
        setPost(prev => ({
          ...prev,
          comments: [...prev.comments, response.data.comment]
        }));
        setCommentText('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  
  const isLiked = post?.likes?.some(like => 
    typeof like === 'object' ? like._id === userdata?._id : like === userdata?._id
  );

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="hidden lg:flex w-1/5 border-r border-gray-200">
          <Lefthome />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="hidden lg:flex w-1/5 border-r border-gray-200">
          <Lefthome />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">{error || 'Post not found'}</p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-200"
            >
              Go Home
            </button>
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

      <div className="flex-1 flex flex-col">
      
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition duration-200 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Post</h1>
          </div>
        </div>

        
        <div className="flex-1 max-w-2xl mx-auto w-full p-4">
         
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Link to={`/profile/${post.userid?.username}`}>
                <img
                  src={post.userid?.profileimg || defaultImg}
                  alt={post.userid?.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </Link>
              <div>
                <Link 
                  to={`/profile/${post.userid?.username}`}
                  className="font-semibold hover:underline"
                >
                  {post.userid?.name}
                </Link>
                <p className="text-gray-500 text-sm">@{post.userid?.username}</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition duration-200">
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="mb-4 rounded-lg overflow-hidden">
            {post.mediatype === 'image' ? (
              <img
                src={post.media}
                alt={post.caption}
                className="w-full h-auto max-h-[600px] object-contain bg-black"
              />
            ) : (
              <video
                src={post.media}
                controls
                className="w-full h-auto max-h-[600px] bg-black"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>

        
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLike}
                className={`p-2 rounded-full transition duration-200 ${
                  isLiked 
                    ? 'text-red-500 hover:bg-red-50' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition duration-200">
                <MessageCircle className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition duration-200">
                <Share className="w-6 h-6" />
              </button>
            </div>
            <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition duration-200">
              <Bookmark className="w-6 h-6" />
            </button>
          </div>

     
          <div className="mb-4 px-2">
            <p className="font-semibold">
              {post.likes?.length || 0} likes
            </p>
          </div>

      
          <div className="mb-6 px-2">
            <p className="text-gray-800">
              <Link 
                to={`/profile/${post.userid?.username}`}
                className="font-semibold hover:underline mr-2"
              >
                {post.userid?.username}
              </Link>
              {post.caption}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

    
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold mb-4 px-2">
              Comments ({post.comments?.length || 0})
            </h3>

          
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {post.comments?.map((comment) => (
                <div key={comment._id} className="flex space-x-3 px-2">
                  <Link to={`/profile/${comment.user?.username}`}>
                    <img
                      src={comment.user?.profileimg || defaultImg}
                      alt={comment.user?.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <Link 
                        to={`/profile/${comment.user?.username}`}
                        className="font-semibold text-sm hover:underline"
                      >
                        {comment.user?.username}
                      </Link>
                      <p className="text-gray-800 mt-1">{comment.text}</p>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {(!post.comments || post.comments.length === 0) && (
                <p className="text-center text-gray-500 py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>

            {userdata ? (
              <form onSubmit={handleComment} className="border-t border-gray-200 pt-4">
                <div className="flex space-x-3">
                  <img
                    src={userdata.profileimg || defaultImg}
                    alt={userdata.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
                      disabled={isCommenting}
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim() || isCommenting}
                      className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                    >
                      {isCommenting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 border-t border-gray-200">
                <p className="text-gray-500">
                  <Link to="/login" className="text-blue-500 hover:underline">
                    Log in
                  </Link>{' '}
                  to leave a comment
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

     
      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
}