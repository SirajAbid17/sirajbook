import React, { useRef, useState, useEffect } from "react";
import BottomNav from "./BottomNav";
import { useNavigate } from "react-router-dom";
import { CiHeart } from "react-icons/ci";
import axios from "axios";
import { ServerUrl } from "../App";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./Footer";
import Righthome from "./Righthome";
import Lefthome from "./Lefthome";

export default function Upload() {
  const videoref = useRef();
  const [uploadtype, setuploadtype] = useState("post");
  const [frontendmedia, setfrontendmedia] = useState(null);
  const [backendmedia, setbackendmedia] = useState(null);
  const [caption, setCaption] = useState("");
  const navigate = useNavigate();
  const inpfile = useRef();
  const [mediatype, setmediatype] = useState("");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);


  useEffect(() => {
    const video = videoref.current;
    if (!video) return;

    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadedmetadata", updateProgress);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("loadedmetadata", updateProgress);
    };
  }, [frontendmedia]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type.includes("image")) {
      setmediatype("image");
    } else if (file.type.includes("video")) {
      setmediatype("video");
    } else {
      toast.error("Please select an image or video file");
      return;
    }

    setbackendmedia(file);
    setfrontendmedia(URL.createObjectURL(file));
    setIsVideoPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const handleUploadTypeChange = (type) => {
    setuploadtype(type);
    setfrontendmedia(null);
    setbackendmedia(null);
    setmediatype("");
    setCaption("");
    setIsVideoPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const triggerFileInput = () => {
    inpfile.current?.click();
  };

  const handleUpload = async () => {
    if (!backendmedia) {
      toast.error("Please select a media file to upload");
      return;
    }

    setIsUploading(true);

    try {
      console.log("Uploading:", {
        type: uploadtype,
        media: backendmedia,
        caption: caption,
        mediatype: mediatype,
      });

      let result;
      
      switch (uploadtype) {
        case "post":
          result = await uploadpost();
          break;
        case "story":
          result = await uploadstory();
          break;
        case "reels":
          result = await uploadreels();
          break;
        default:
          throw new Error("Invalid upload type");
      }

      if (result) {
        toast.success(`${uploadtype.charAt(0).toUpperCase() + uploadtype.slice(1)} uploaded successfully!`);

        setfrontendmedia(null);
        setbackendmedia(null);
        setCaption("");
        setIsVideoPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        navigate("/");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || `Failed to upload ${uploadtype}. Please try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleVideoPlay = () => {
    if (videoref.current) {
      if (videoref.current.paused) {
        videoref.current.play();
        setIsVideoPlaying(true);
      } else {
        videoref.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const handleVideoClick = (e) => {
    if (e.target === videoref.current) {
      toggleVideoPlay();
    }
  };

  const handleSeek = (e) => {
    if (videoref.current && duration) {
      const seekTime = (e.target.value / 100) * duration;
      videoref.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (time) => {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const uploadpost = async () => {
    try {
      const formdata = new FormData();
      formdata.append("caption", caption);
      formdata.append("mediatype", mediatype);
      formdata.append("media", backendmedia);
      const result = await axios.post(`${ServerUrl}/api/upload`, formdata, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("Post upload result:", result);
      return result.data;
    } catch (error) {
      console.log("Post upload error:", error);
      throw error;
    }
  };

  const uploadstory = async () => {
    try {
      const formdata = new FormData();
      formdata.append("mediatype", mediatype);
      formdata.append("media", backendmedia);
      const result = await axios.post(`${ServerUrl}/api/story`, formdata, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("Story upload result:", result);
      return result.data;
    } catch (error) {
      console.log("Story upload error:", error);
      throw error;
    }
  };

  const uploadreels = async () => {
    try {
      const formdata = new FormData();
      formdata.append("caption", caption);
      formdata.append("media", backendmedia);
      const result = await axios.post(`${ServerUrl}/api/reels`, formdata, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("Reels upload result:", result);
      return result.data;
    } catch (error) {
      console.log("Reels upload error:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen  flex flex-col items-center justify-between relative">
      <Lefthome/>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{
          top: '20px',
          transform: 'translateX(-50%)',
          left: '50%',
          width: 'auto',
          minWidth: '300px'
        }}
      />

     
      <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-800 bg-white fixed top-0 left-0 right-0 z-40 shadow-sm">
        <h1 className="fnt text-2xl font-extrabold text-black tracking-wide">
          Siraj<span className="text-blue-500">Book</span>
        </h1>
        <CiHeart className="text-3xl text-gray-400 hover:text-red-500 transition-colors duration-300 cursor-pointer" />
      </div>

      <div className="w-full max-w-[500px] mx-auto px-4 py-4 hidden lg:flex">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-all duration-300">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
          <span className="text-grey-900 font-medium text-sm">
            Back to Home
          </span>
        </button>
      </div>

    
      <input
        type="file"
        onChange={handleFileChange}
        hidden
        ref={inpfile}
        accept="image/*,video/*"
      />

  
      <div className="flex-1 w-full flex flex-col items-center justify-center px-4 py-6 mt-16 lg:mt-0">
      
        <div className="w-full max-w-[500px] h-[60px] bg-gradient-to-r from-gray-800 to-gray-900 rounded-full flex justify-between items-center text-white shadow-lg mb-8 relative p-1 border border-gray-700">
          <button
            className={`flex-1 h-[48px] rounded-full flex items-center justify-center transition-all duration-200 font-medium ${
              uploadtype === "post"
                ? "bg-white text-gray-900 shadow-md"
                : "hover:bg-gray-700"
            }`}
            onClick={() => handleUploadTypeChange("post")}
          >
            Post
          </button>
          <div className="w-px h-6 bg-gray-600"></div>
          <button
            className={`flex-1 h-[48px] rounded-full flex items-center justify-center transition-all duration-200 font-medium ${
              uploadtype === "story"
                ? "bg-white text-gray-900 shadow-md"
                : "hover:bg-gray-700"
            }`}
            onClick={() => handleUploadTypeChange("story")}
          >
            Story
          </button>
          <div className="w-px h-6 bg-gray-600"></div>
          <button
            className={`flex-1 h-[48px] rounded-full flex items-center justify-center transition-all duration-200 font-medium ${
              uploadtype === "reels"
                ? "bg-white text-gray-900 shadow-md"
                : "hover:bg-gray-700"
            }`}
            onClick={() => handleUploadTypeChange("reels")}
          >
            Reels
          </button>
        </div>

      
        {!frontendmedia ? (
          <div
            onClick={triggerFileInput}
            className="w-full cursor-pointer max-w-[500px] bg-gray-900 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-800 text-center mb-6"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-600">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Upload {uploadtype.charAt(0).toUpperCase() + uploadtype.slice(1)}
            </h3>
            <p className="text-gray-400 mb-6">
              {uploadtype === "post" && "Share a post with your audience"}
              {uploadtype === "story" &&
                "Share a story that disappears after 24 hours"}
              {uploadtype === "reels" && "Create and share short videos"}
            </p>

            <div className="space-y-4">
              <button className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium shadow-md border border-gray-600">
                Select from Gallery
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[500px] bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 mb-10">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">
              Preview
            </h3>

            {uploadtype !== "story" && (
              <div className="mb-4">
                <label
                  htmlFor="caption"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Add Caption
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={`Write a caption for your ${uploadtype}...`}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                  rows="3"
                  maxLength="2200"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {caption.length}/2200
                </div>
              </div>
            )}

            {mediatype === "image" ? (
              <img
                src={frontendmedia}
                alt="Preview"
                className="w-full h-auto max-h-[400px] object-contain rounded-lg mb-4 border border-gray-700"
              />
            ) : (
              <div className="relative mb-2">
                <video
                  autoPlay
                  muted
                  ref={videoref}
                  src={frontendmedia}
                  onClick={handleVideoClick}
                  className="w-full h-auto max-h-[400px] object-contain rounded-lg border border-gray-700 video-player"
                />

               
                {!isVideoPlaying && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg cursor-pointer"
                    onClick={toggleVideoPlay}
                  >
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}

          
            {mediatype === "video" && (
              <div className="flex items-center justify-between gap-3 mt-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
                <button
                  onClick={toggleVideoPlay}
                  className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                >
                  {isVideoPlaying ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <span className="text-xs text-gray-300 font-medium min-w-[35px]">
                  {formatTime(currentTime)}
                </span>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={duration ? (currentTime / duration) * 100 : 0}
                  onChange={handleSeek}
                  className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                />

                <span className="text-xs text-gray-300 font-medium min-w-[35px]">
                  {formatTime(duration)}
                </span>

                <button
                  onClick={() => {
                    if (videoref.current) {
                      videoref.current.muted = !videoref.current.muted;
                    }
                  }}
                  className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                </button>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={triggerFileInput}
                disabled={isUploading}
                className="flex-1 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
              >
                Change Media
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-gray-600"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  `Upload ${uploadtype}`
                )}
              </button>
            </div>
          </div>
        )}
        <Righthome/>
      </div>

   

      <div className="w-full">
        <BottomNav />
      </div>
     <div className='w-full hidden lg:flex'><Footer /></div>    
    </div>
  );
}