import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateStory() {
  const { userdata } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediatype, setMediatype] = useState("image");
  const [uploading, setUploading] = useState(false);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

 
    const fileType = file.type.split("/")[0];
    if (!["image", "video"].includes(fileType)) {
      toast.error("Please select an image or video file");
      return;
    }

    const maxSize = fileType === "video" ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        `File size too large. Max ${
          fileType === "video" ? "100MB" : "10MB"
        } allowed`
      );
      return;
    }

    setMedia(file);
    setMediatype(fileType);

    
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const handleUpload = async () => {
    if (!media) {
      toast.error("Please select a media file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("media", media);
    formData.append("mediatype", mediatype);

    try {
      const response = await axios.post(`${ServerUrl}/api/story`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Story uploaded successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload story");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create Story
        </h2>

       
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image or Video
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            {mediaPreview ? (
              <div className="space-y-4">
                {mediatype === "image" ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    controls
                    className="max-h-64 mx-auto rounded-lg"
                  />
                )}
                <button
                  onClick={() => {
                    setMedia(null);
                    setMediaPreview(null);
                    URL.revokeObjectURL(mediaPreview);
                  }}
                  className="text-red-500 text-sm hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="hidden"
                  id="media-upload"
                />
                <label htmlFor="media-upload" className="cursor-pointer block">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600">
                    Click to upload image or video
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Max: 10MB for images, 100MB for videos
                  </p>
                </label>
              </>
            )}
          </div>
        </div>

        
        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            disabled={uploading}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!media || uploading}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {uploading ? "Uploading..." : "Upload Story"}
          </button>
        </div>

        <p className="text-gray-500 text-sm mt-4 text-center">
          Stories will disappear after 24 hours
        </p>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
