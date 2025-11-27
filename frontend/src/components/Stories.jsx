import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Stories() {
  const { userdata } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${ServerUrl}/api/getallstories`, {
        withCredentials: true,
      });
      setStories(response.data.stories || []);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (story) => {
    setSelectedStory(story);
    setShowStoryViewer(true);

    
    viewStory(story._id);
  };

  const viewStory = async (storyId) => {
    try {
      await axios.put(
        `${ServerUrl}/api/view/${storyId}`,
        {},
        {
          withCredentials: true,
        }
      );

      setStories((prevStories) =>
        prevStories.map((story) =>
          story._id === storyId
            ? {
                ...story,
                viewers: [...story.viewers, userdata._id],
              }
            : story
        )
      );
    } catch (error) {
      console.error("Error viewing story:", error);
    }
  };

  const handleCreateStory = () => {
   
    navigate("/create-story");
  };

  const closeStoryViewer = () => {
    setShowStoryViewer(false);
    setSelectedStory(null);
  };

  const hasViewedStory = (story) => {
    return story.viewers.some((viewer) => viewer._id === userdata?._id);
  };

  if (loading) {
    return (
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-2 flex-shrink-0"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b border-gray-200 bg-white">
        <div
          className="flex space-x-4 overflow-x-auto pb-2 
                    [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          
          <div className="flex flex-col items-center space-y-2 flex-shrink-0">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-full border-2 border-white bg-gradient-to-r from-purple-400 to-pink-500 p-0.5 cursor-pointer"
                onClick={handleCreateStory}
              >
                <img
                  src={
                    userdata?.profileimg ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                  }
                  alt="Your story"
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
              </div>
              <div className="absolute -bottom-1 right-0 bg-blue-500 rounded-full p-1 border-2 border-white">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <span className="text-xs text-gray-600 font-medium">
              Your story
            </span>
          </div>

          {stories.map((story) => (
            <div
              key={story._id}
              className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer"
              onClick={() => handleStoryClick(story)}
            >
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-full p-0.5 ${
                    hasViewedStory(story)
                      ? "bg-gradient-to-r from-gray-400 to-gray-500"
                      : "bg-gradient-to-r from-purple-400 to-pink-500"
                  }`}
                >
                  <img
                    src={story.author?.profileimg}
                    alt={story.author?.username}
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </div>
                {!hasViewedStory(story) && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-[8px] px-1 rounded-full border border-white">
                    NEW
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-600 max-w-[60px] truncate">
                {story.author?.username}
              </span>
            </div>
          ))}

          {stories.length === 0 && (
            <div className="flex flex-col items-center justify-center w-full py-4">
              <p className="text-gray-500 text-sm">No stories available</p>
              <button
                onClick={handleCreateStory}
                className="text-blue-500 text-sm mt-2 hover:text-blue-600"
              >
                Create first story
              </button>
            </div>
          )}
        </div>
      </div>

      {showStoryViewer && selectedStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="relative w-full h-full max-w-md mx-auto">
            <button
              onClick={closeStoryViewer}
              className="absolute top-4 right-4 z-10 text-white text-2xl"
            >
              ✕
            </button>

            <div className="w-full h-full flex items-center justify-center">
              {selectedStory.mediatype === "image" ? (
                <img
                  src={selectedStory.media}
                  alt="Story"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={selectedStory.media}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <img
                  src={selectedStory.author?.profileimg}
                  alt={selectedStory.author?.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-semibold">
                  {selectedStory.author?.username}
                </span>
              </div>
              <p className="text-sm text-gray-300">
                {selectedStory.viewers.length} views
              </p>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}
