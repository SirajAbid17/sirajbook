import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { LogOut, Users, ChevronRight, X, Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import { logout, setSuggestedUsers } from "../redux/userslice";
import axios from "axios";
import { ServerUrl } from "../App";
import { LuMessageCircleHeart } from "react-icons/lu";
import { TbMessageChatbot } from "react-icons/tb";
import Aiimg from "./Aiimg"; 
import { ImCross } from "react-icons/im";
import { useNavigate } from "react-router-dom";

export default function Righthome() {
  const { userdata, suggestedUsers } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAiImage, setShowAiImage] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    
   
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

 
  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const response = await axios.get(`${ServerUrl}/api/notifications`, {
        withCredentials: true
      });
      console.log("🔔 Notifications fetched:", response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
     
      const savedNotifications = localStorage.getItem('sirajbook_notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${ServerUrl}/api/signout`, { 
        withCredentials: true 
      });
      dispatch(logout());
      setShowLogoutModal(false);
    } catch (error) {
      console.error("Logout error:", error);
      dispatch(logout());
      setShowLogoutModal(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleFollow = async (userId, username) => {
    try {
      setLoadingStates(prev => ({ ...prev, [userId]: true }));
      
      const response = await axios.post(
        `${ServerUrl}/api/follow/${userId}`,
        {},
        { withCredentials: true }
      );
      
      console.log("✅ Follow action:", response.data);
      
    
      if (response.data.action === "followed") {
        const tempNotification = {
          _id: `temp-${Date.now()}`,
          type: 'follow',
          message: `You started following ${username}`,
          read: false,
          createdAt: new Date().toISOString(),
          sender: {
            username: userdata?.username,
            profileimg: userdata?.profileimg
          }
        };
        
        setNotifications(prev => [tempNotification, ...prev]);
        
       
        console.log(`🎉 You are now following ${username}`);
      }
      
     
      const suggestedResponse = await axios.get(
        `${ServerUrl}/api/suggestedusers`,
        { withCredentials: true }
      );
      
      if (suggestedResponse.data && Array.isArray(suggestedResponse.data)) {
        dispatch(setSuggestedUsers(suggestedResponse.data));
      }
      
    
      setTimeout(() => {
        fetchNotifications();
      }, 1000);
      
    } catch (error) {
      console.error("❌ Follow error:", error);
     
      const errorNotification = {
        _id: `error-${Date.now()}`,
        type: 'error',
        message: `Failed to follow ${username}`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      setNotifications(prev => [errorNotification, ...prev]);
    } finally {
      setLoadingStates(prev => ({ ...prev, [userId]: false }));
    }
  };

 
  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
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
 
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
     
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(`${ServerUrl}/api/notifications/read-all`, {}, {
        withCredentials: true
      });
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await axios.delete(`${ServerUrl}/api/notifications`, {
        withCredentials: true
      });
      setNotifications([]);
      localStorage.setItem('sirajbook_notifications', JSON.stringify([]));
    } catch (error) {
      console.error("Error clearing notifications:", error);
     
      setNotifications([]);
      localStorage.setItem('sirajbook_notifications', JSON.stringify([]));
    }
  };

 
  const handleClearNotification = async (notificationId) => {
    try {
      await axios.delete(`${ServerUrl}/api/notifications/${notificationId}`, {
        withCredentials: true
      });
      
      setNotifications(prev => prev.filter(notif => 
        notif._id !== notificationId
      ));
    } catch (error) {
      console.error("Error deleting notification:", error);
     
      setNotifications(prev => prev.filter(notif => 
        notif._id !== notificationId
      ));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow':
        return <UserPlus size={16} className="text-blue-500" />;
      case 'like':
        return <Heart size={16} className="text-red-500" />;
      case 'comment':
        return <MessageCircle size={16} className="text-green-500" />;
      case 'message':
        return <MessageCircle size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };


  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

 
  const displayedUsers = showAllUsers 
    ? suggestedUsers 
    : (suggestedUsers?.slice(0, 5) || []);


  const filteredSuggestedUsers = displayedUsers.filter(
    user => user._id !== userdata?._id
  );

  return (
    <>
     
      {(showAiImage || showNotifications || showLogoutModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>
      )}
      
    
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-50">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <LogOut className="text-red-500" size={24} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Confirm Logout
              </h3>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout from your account?
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCancelLogout}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden z-50 transform transition-all duration-300 scale-100">
          
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
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
                          ? 'bg-gray-50 border-gray-300 hover:bg-gray-100' 
                          : 'bg-blue-50 border-blue-500 hover:bg-blue-100'
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
                            <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                              notification.type === 'follow' ? 'bg-blue-100 text-blue-600' :
                              notification.type === 'like' ? 'bg-red-100 text-red-600' :
                              notification.type === 'comment' ? 'bg-green-100 text-green-600' :
                              notification.type === 'message' ? 'bg-purple-100 text-purple-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
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
                  <p className="text-gray-400 text-xs mt-1">Your notifications will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
     
      <div className={`w-[25%] hidden lg:flex flex-col min-h-screen bg-white border-l border-gray-200 fixed right-0 top-0 bottom-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] z-30 ${
        showAiImage || showNotifications || showLogoutModal ? 'blur-sm' : ''
      }`}>
       
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
       
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div 
              className="cursor-pointer flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors" 
              onClick={() => navigate(`/profile/${userdata?.username}`)}
            >
              <img
                src={userdata?.profileimg || "https://cdn-icons-png.flaticon.com/128/1144/1144760.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-semibold text-gray-800 truncate">
                  {userdata?.username || "Guest User"}
                </h1>
                <p className="text-xs text-gray-500 truncate">
                  {userdata?.email || "No Email"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group"
                >
                  <Bell size={18} className="text-gray-600 group-hover:text-blue-500 transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>
              
              <button
                onClick={handleLogoutClick}
                className="text-blue-500 text-xs font-medium hover:underline flex items-center gap-1 whitespace-nowrap p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-600" />
                <h2 className="text-sm font-semibold text-gray-700">Suggested Users</h2>
              </div>
              
              {suggestedUsers && suggestedUsers.length > 5 && (
                <button
                  onClick={() => setShowAllUsers(!showAllUsers)}
                  className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
                >
                  {showAllUsers ? "Show Less" : "See All"}
                  <ChevronRight 
                    size={14} 
                    className={`transition-transform ${showAllUsers ? 'rotate-90' : ''}`}
                  />
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {filteredSuggestedUsers && filteredSuggestedUsers.length > 0 ? (
                filteredSuggestedUsers.map((user) => (
                  <div 
                    key={user._id} 
                    className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group"
                    onClick={() => handleUserClick(user.username)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <img
                        src={user.profileimg || "https://cdn-icons-png.flaticon.com/128/1144/1144760.png"}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-800 truncate">{user.username}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.name || user.username}
                        </p>
                        {user.profession && (
                          <p className="text-xs text-gray-400 truncate">{user.profession}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleFollow(user._id, user.username);
                      }}
                      disabled={loadingStates[user._id]}
                      className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0 ml-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px]"
                    >
                      {loadingStates[user._id] ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                      ) : (
                        "Follow"
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Users size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No suggestions available</p>
                  <p className="text-xs text-gray-400 mt-1">Follow more people to get suggestions</p>
                </div>
              )}
            </div>
          </div>

        
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Network</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <p className="text-lg font-bold text-blue-600">{userdata?.followers?.length || 0}</p>
                <p className="text-xs text-gray-600">Followers</p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">{userdata?.following?.length || 0}</p>
                <p className="text-xs text-gray-600">Following</p>
              </div>
            </div>
          </div>
        </div>

      
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="flex flex-col items-center gap-3 w-full">
          
            <button 
              onClick={() => navigate('/messages')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-5 rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 w-full max-w-[200px] group hover:scale-105 active:scale-95"
            >
              <LuMessageCircleHeart className="text-lg group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Message</span>
            </button>

           
          </div>
        </div>
      </div>

   
    </>
  );
}