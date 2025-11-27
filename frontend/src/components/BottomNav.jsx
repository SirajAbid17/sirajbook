import React, { useState, useEffect, useRef } from "react";
import { FiHome, FiSearch, FiPlusSquare, FiFilm, FiUser, FiX, FiMessageCircle } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { ServerUrl } from "../App";

export default function BottomNav() {
  const { userdata } = useSelector((state) => state.user);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  const defaultImg = "https://cdn-icons-png.flaticon.com/128/1144/1144760.png";


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.trim() !== "") {
      setLoading(true);
      const timeout = setTimeout(() => {
        performSearch(query);
      }, 500);
      setSearchTimeout(timeout);
    } else {
      setSearchResults([]);
      setLoading(false);
    }
  };

  const performSearch = async (query) => {
    try {
      const response = await axios.get(`${ServerUrl}/api/search?query=${encodeURIComponent(query)}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setSearchResults(response.data.users || []);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (username) => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    navigate(`/profile/${username}`);
  };


  const handleMessagesClick = () => {
    navigate('/messages');
  };

  
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  return (
    <>
     
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md flex justify-around items-center py-2 z-50">
        <Link to={'/'}> 
          <button className="flex flex-col items-center text-gray-700 hover:text-blue-500">
            <FiHome className="text-2xl" />
            <span className="text-xs">Home</span>
          </button>
        </Link>
        
      
        <button 
          className="flex flex-col items-center text-gray-700 hover:text-blue-500"
          onClick={() => setShowSearch(true)}
        >
          <FiSearch className="text-2xl" />
          <span className="text-xs">Search</span>
        </button>
        
        <Link to={'/upload'}> 
          <button className="flex flex-col items-center text-gray-700 hover:text-blue-500">
            <FiPlusSquare className="text-2xl" />
            <span className="text-xs">Upload</span>
          </button>
        </Link>
       
        <Link to={'/reels'}> 
          <button className="flex flex-col items-center text-gray-700 hover:text-blue-500">
            <FiFilm className="text-2xl" />
            <span className="text-xs">Reels</span>
          </button>
        </Link>

      
        <button 
          className="flex flex-col items-center text-gray-700 hover:text-blue-500"
          onClick={handleMessagesClick}
        >
          <FiMessageCircle className="text-2xl" />
          <span className="text-xs">Messages</span>
        </button>
        
        <Link to={`/profile/${userdata?.username}`}>
          <button className="flex flex-col items-center text-gray-700 hover:text-blue-500">
            <img 
              src={userdata?.profileimg || defaultImg}
              alt="Profile"
              className="w-6 h-6 rounded-full object-cover border border-gray-300"
            />
            <span className="text-xs">Profile</span>
          </button>
        </Link>
      </div>

    
      {showSearch && (
        <>
       
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[100]"></div>
          
         
          <div className="lg:hidden fixed inset-0 z-[101] flex items-start justify-center pt-10 px-4">
            <div 
              ref={searchRef}
              className="bg-white rounded-2xl w-full max-w-md max-h-96 shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 scale-100"
            >
          
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">Search Users</h3>
                  <button 
                    onClick={clearSearch}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
            
                <div className="relative">
                  <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search users by name or username..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                    autoFocus
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

           
              <div className="max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-6">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-500">Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                        onClick={() => handleUserClick(user.username)}
                      >
                        <img
                          src={user.profileimg || "https://cdn-icons-png.flaticon.com/128/1144/1144760.png"}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-800 truncate">
                              {user.username}
                            </p>
                            {user.followers && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {user.followers.length} followers
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{user.name}</p>
                          {user.bio && (
                            <p className="text-xs text-gray-500 truncate mt-1">{user.bio}</p>
                          )}
                          {user.profession && (
                            <p className="text-xs text-gray-400 truncate">{user.profession}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-8">
                    <CiSearch className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No users found</p>
                    <p className="text-sm text-gray-400">Try different keywords</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CiSearch className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Search for users</p>
                    <p className="text-sm text-gray-400">Enter a name or username</p>
                  </div>
                )}
              </div>

          
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  Search by username, name, or bio
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}