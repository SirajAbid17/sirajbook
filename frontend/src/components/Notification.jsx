import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaComment, FaUserPlus, FaBookmark } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import axios from "axios";
import { ServerUrl } from "../App";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const { userdata } = useSelector((state) => state.user);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${ServerUrl}/api/notifications`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };


  const markAsRead = async (notificationId) => {
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
    }
  };

 
  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${ServerUrl}/api/notifications/mark-all-read`,
        {},
        { withCredentials: true }
      );

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

 
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `${ServerUrl}/api/notifications/${notificationId}`,
        { withCredentials: true }
      );

      setNotifications(prev =>
        prev.filter(notif => notif._id !== notificationId)
      );
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <FaHeart className="text-red-500" />;
      case 'comment':
        return <FaComment className="text-blue-500" />;
      case 'follow':
        return <FaUserPlus className="text-green-500" />;
      case 'save':
        return <FaBookmark className="text-yellow-500" />;
      default:
        return <FaHeart className="text-gray-500" />;
    }
  };

  
  const getNotificationMessage = (notification) => {
    const username = notification.sender?.username || 'Someone';
    
    switch (notification.type) {
      case 'like':
        return `${username} liked your post`;
      case 'comment':
        return `${username} commented on your post`;
      case 'follow':
        return `${username} started following you`;
      case 'save':
        return `${username} saved your post`;
      default:
        return `${username} interacted with your post`;
    }
  };


  const formatTime = (dateString) => {
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

  const toggleNotifications = () => {
    setShowNotification(!showNotification);
    if (!showNotification) {
      fetchNotifications();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-container')) {
        setShowNotification(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="notification-container relative">
      <ToastContainer position="top-center" autoClose={3000} />

      
      <button
        onClick={toggleNotifications}
        className="relative p-2 text-gray-600 hover:text-blue-500 transition-colors duration-200"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-7.5 1 1 0 00-1.14-1.14 7.97 7.97 0 006.16 10.18 5.97 5.97 0 01-4.66-7.5zM12 22a2 2 0 01-2-2h4a2 2 0 01-2 2z"
          />
        </svg>
     
        {notifications.some(notif => !notif.read) && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {showNotification && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
        
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <div className="flex items-center gap-2">
              {notifications.some(notif => !notif.read) && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={toggleNotifications}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoIosClose className="w-5 h-5" />
              </button>
            </div>
          </div>

          
          <div className="overflow-y-auto max-h-80">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-500">Loading...</span>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                       
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                       
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm text-gray-800">
                              {getNotificationMessage(notification)}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                          </p>

                       
                          {(notification.type === 'like' || notification.type === 'comment' || notification.type === 'save') && 
                           notification.post && (
                            <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                              <p className="text-xs text-gray-600 truncate">
                                {notification.post.caption || "Check out this post"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                      >
                        <IoIosClose className="w-4 h-4" />
                      </button>
                    </div>

                 
                    {notification.sender && (
                      <div className="flex items-center gap-2 mt-2">
                        <img
                          src={notification.sender.profileimg || "https://cdn-icons-png.flaticon.com/128/1144/1144760.png"}
                          alt={notification.sender.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs text-gray-600 font-medium">
                          {notification.sender.username}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-7.5 1 1 0 00-1.14-1.14 7.97 7.97 0 006.16 10.18 5.97 5.97 0 01-4.66-7.5zM12 22a2 2 0 01-2-2h4a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No notifications</p>
                <p className="text-sm text-gray-400 mt-1">
                  When you get notifications, they'll appear here
                </p>
              </div>
            )}
          </div>

      
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <Link
              to="/notifications"
              className="text-center block text-sm text-blue-500 hover:text-blue-600 font-medium"
              onClick={() => setShowNotification(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}