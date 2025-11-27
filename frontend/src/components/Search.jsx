import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {  Search as SearchIcon, User, Users, MapPin, Briefcase, ExternalLink, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';

export default function Search() {
  const { userdata } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const searchTimeoutRef = useRef(null);


  const categories = [
    { id: 'all', name: 'All', icon: Users },
    { id: 'username', name: 'Username', icon: User },
    { id: 'name', name: 'Name', icon: User },
    { id: 'profession', name: 'Profession', icon: Briefcase },
    { id: 'location', name: 'Location', icon: MapPin }
  ];

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchPerformed(false);
      return;
    }

    try {
      setLoading(true);
      setSearchPerformed(true);
      
      const response = await axios.get(`${ServerUrl}/api/search?query=${encodeURIComponent(query)}`, {
        withCredentials: true
      });

      if (response.data.success) {
        let filteredResults = response.data.users;

        
        if (selectedCategory !== 'all') {
          filteredResults = response.data.users.filter(user => {
            switch (selectedCategory) {
              case 'username':
                return user.username?.toLowerCase().includes(query.toLowerCase());
              case 'name':
                return user.name?.toLowerCase().includes(query.toLowerCase());
              case 'profession':
                return user.profession?.toLowerCase().includes(query.toLowerCase());
              case 'location':
                return user.location?.toLowerCase().includes(query.toLowerCase());
              default:
                return true;
            }
          });
        }

        setSearchResults(filteredResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };


  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

  
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

   
    searchTimeoutRef.current = setTimeout(() => {
      searchUsers(query);
    }, 500);
  };

  
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (searchQuery.trim()) {
      searchUsers(searchQuery);
    }
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  const handleMessageClick = async (user) => {
    if (!userdata) {
      navigate('/signin');
      return;
    }

    if (user._id === userdata._id) {
      alert("You cannot message yourself");
      return;
    }

    try {
    
      const response = await axios.post(
        `${ServerUrl}/api/conversation/start/${user._id}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        navigate('/messages');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      if (error.response?.status === 403) {
        alert("You can only message users you follow or who follow you");
      } else {
        alert("Failed to start conversation");
      }
    }
  };


  const isFollowing = (user) => {
    return userdata?.following?.includes(user._id);
  };

 
  const formatFollowerCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count;
  };


  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchPerformed(false);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
    
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Users</h1>
          <p className="text-gray-600">Discover and connect with people around you</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
       
        <div className="relative mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by username, name, profession, or location..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <IconComponent size={16} />
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {loading ? (
           
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500">Searching users...</p>
              </div>
            </div>
          ) : searchPerformed && searchResults.length === 0 ? (
           
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No users found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchQuery 
                  ? `No results found for "${searchQuery}"`
                  : 'Try searching with different keywords'
                }
              </p>
              <div className="mt-4 flex gap-3 justify-center">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Show All Categories
                </button>
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
           
            <div className="grid gap-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
                </h3>
                {searchQuery && (
                  <span className="text-sm text-gray-500">
                    Results for "{searchQuery}"
                  </span>
                )}
              </div>
              
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                   
                    <div 
                      className="flex-shrink-0 cursor-pointer"
                      onClick={() => handleUserClick(user.username)}
                    >
                      <img
                        src={user.profileimg || `https://ui-avatars.com/api/?name=${user.name || user.username}&background=random&size=128`}
                        alt={user.username}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 hover:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div 
                          className="cursor-pointer"
                          onClick={() => handleUserClick(user.username)}
                        >
                          <h4 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                            {user.name || user.username}
                          </h4>
                          <p className="text-gray-500">@{user.username}</p>
                        </div>
                        
                     
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMessageClick(user)}
                            disabled={user._id === userdata?._id}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <MessageCircle size={16} />
                            <span className="text-sm">Message</span>
                          </button>
                          
                          <button
                            onClick={() => handleUserClick(user.username)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            <ExternalLink size={16} />
                            <span className="text-sm">Profile</span>
                          </button>
                        </div>
                      </div>

                     
                      <div className="space-y-1">
                        {user.bio && (
                          <p className="text-gray-600 text-sm">{user.bio}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          {user.profession && (
                            <div className="flex items-center gap-1">
                              <Briefcase size={14} />
                              <span>{user.profession}</span>
                            </div>
                          )}
                          
                          {user.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{user.location}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{formatFollowerCount(user.followers?.length || 0)} followers</span>
                          </div>
                          
                          {isFollowing(user) && (
                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                              Following
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
           
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-blue-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Discover People</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Search for users by their username, name, profession, or location to connect and start conversations.
              </p>
              
          
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    <User className="text-blue-500" size={20} />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">By Username</h4>
                  <p className="text-sm text-gray-600">Search with @username</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                    <Briefcase className="text-green-500" size={20} />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">By Profession</h4>
                  <p className="text-sm text-gray-600">Find people in your field</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                    <MapPin className="text-purple-500" size={20} />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">By Location</h4>
                  <p className="text-sm text-gray-600">Connect with locals</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}