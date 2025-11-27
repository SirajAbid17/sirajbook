import React, { useState, useEffect, useRef } from "react";
import { CiHeart, CiSearch } from "react-icons/ci";
import { FiHome, FiSearch, FiPlusSquare, FiFilm, FiUser, FiX } from "react-icons/fi";
import { FiBell } from "react-icons/fi";
import { FiMessageCircle } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { useSelector } from "react-redux";

export default function Lefthome() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.user);

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

  
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  return (
    <>
     
      <div className={`w-[20%] hidden lg:flex flex-col min-h-screen bg-white border-r border-gray-200 p-6 shadow-md fixed left-0 top-0 bottom-0 overflow-y-auto transition-all duration-300 ${
        showSearch ? 'blur-sm brightness-90' : ''
      }`}>
        
    
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="fnt text-2xl font-extrabold text-gray-800 tracking-wide hover:opacity-80 transition-opacity">
            Siraj<span className="text-blue-500">Book</span>
          </Link>
          <Link to={'/saved'}> 
          <CiHeart className="text-3xl text-gray-700 hover:text-red-500 transition-colors duration-300 cursor-pointer" />
          </Link>
        </div>
        
        <div className="border-t border-gray-200 mb-6"></div>

        
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <Link to={'/'} className="block"> 
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-200">      
                  <FiHome className="text-xl text-gray-700" />
                  <span className="text-lg text-gray-800 font-medium">Home</span>
                </div>
              </Link>
            </li>
            
            {/* Search Item */}
            <li 
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-200"
              onClick={() => setShowSearch(true)}
            >
              <FiSearch className="text-xl text-gray-700" />
              <span className="text-lg text-gray-800 font-medium">Search</span>
            </li>
            
            <li>
              <Link to={'/upload'} className="block"> 
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-200">
                  <FiPlusSquare className="text-xl text-gray-700" />
                  <span className="text-lg text-gray-800 font-medium">Upload</span>
                </div>
              </Link>
            </li>
            
            <li>
              <Link to={'/reels'} className="block"> 
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-200">
                  <FiFilm className="text-xl text-gray-700" />
                  <span className="text-lg text-gray-800 font-medium">Reels</span>
                </div>
              </Link>
            </li>
            
            <li>
              <Link to={`/profile/${userdata?.username}`} className="block">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-200">
                  <FiUser className="text-xl text-gray-700" />
                  <span className="text-lg text-gray-800 font-medium">Profile</span>
                </div>
              </Link>
            </li>
            
           
            <li>
              <Link to={'/messages'} className="block">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-200">
                  <FiMessageCircle className="text-xl text-gray-700" />
                  <span className="text-lg text-gray-800 font-medium">Messages</span>
                </div>
              </Link>
            </li>
          </ul>
        </nav>

     
        <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
          © {new Date().getFullYear()} SirajBook
        </div>
      </div>

    
      {showSearch && (
        <>
         
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[100]"></div>
          
      
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-20">
            <div 
              ref={searchRef}
              className="bg-white rounded-2xl w-96 max-h-96 shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 scale-100"
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
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-500">Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 group"
                        onClick={() => handleUserClick(user.username)}
                      >
                        <div className="relative">
                          <img
                            src={user.profileimg || "https://cdn-icons-png.flaticon.com/128/1144/1144760.png"}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                            {user.username}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{user.name}</p>
                          {user.profession && (
                            <p className="text-xs text-gray-400 truncate">{user.profession}</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                          {user.followers?.length || 0} followers
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
                  Search by username or display name
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}