import React, { useRef, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Edit3,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Lefthome from "./Lefthome";
import Footer from "./Footer";
import axios from "axios";
import { ServerUrl } from "../App";
import { setprofiledata, setuserdata } from "../redux/userslice";

export default function Editprofile() {
  const { userdata } = useSelector((state) => state.user);
  const imgref = useRef();
  const navigate = useNavigate();
  const [frontendimg, setfrontendimg] = useState(
    userdata?.profileimg ||
      "https://cdn-icons-png.flaticon.com/128/1144/1144760.png"
  );
  const [backend, setbackend] = useState(null);
  const [name, setname] = useState(userdata?.name || "");
  const [username, setusername] = useState(userdata?.username || "");
  const [bio, setbio] = useState(userdata?.bio || "");
  const [profession, setprofession] = useState(userdata?.profession || "");
  const [gender, setgender] = useState(userdata?.gender || "");
  const [location, setLocation] = useState(userdata?.location || "");
  const [website, setWebsite] = useState(userdata?.website || "");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleimg = (e) => {
    const file = e.target.files[0];
    if (file) {
      setbackend(file);
      setfrontendimg(URL.createObjectURL(file));
    }
  };

  const Hendeleditprofile = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);

      const formdata = new FormData();
      formdata.append("name", name);
      formdata.append("username", username);
      formdata.append("bio", bio);
      formdata.append("gender", gender);
      formdata.append("profession", profession);
      formdata.append("location", location);
      formdata.append("website", website);

      if (backend) {
        formdata.append("profileimg", backend);
      }

      const result = await axios.post(
        `${ServerUrl}/api/editprofile`,
        formdata,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (result.data) {
        dispatch(setprofiledata(result.data));
        dispatch(setuserdata(result.data));
        navigate(`/profile/${result.data.username}`);
      }
    } catch (error) {
      console.log("Edit profile error:", error);
      if (error.response && error.response.data) {
        alert(error.response.data.message || "Profile update failed!");
      } else if (error.request) {
        alert("Network error! Please check your connection.");
      } else {
        alert("Profile update failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return "Joined recently";
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })}`;
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
              to={`/profile/${userdata?.username}`}
              className="p-2 hover:bg-gray-100 rounded-full transition duration-200 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Edit Profile</h1>
              <p className="text-sm text-gray-500">
                Update your profile information
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1">
         
          <div className="bg-white border-b border-gray-200 mt-16">
           
            <div className="px-4 pb-6">
            
              <div className="flex justify-between items-start -mt-16 mb-4">
                <div className="flex flex-col items-center">
                  <img
                    src={frontendimg}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer"
                    onClick={() => imgref.current.click()}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleimg}
                    ref={imgref}
                  />
                  <button
                    className="text-blue-500 cursor-pointer text-sm font-medium mt-2 flex items-center space-x-1"
                    onClick={() => imgref.current.click()}
                    type="button"
                    disabled={loading}
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Change Photo</span>
                  </button>
                </div>

                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => navigate(`/profile/${userdata?.username}`)}
                    className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>

           
            </div>
          </div>

         
          <div className="max-w-2xl mx-auto p-6">
            <form className="space-y-6" onSubmit={Hendeleditprofile}>
             
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setname(e.target.value)}
                      type="text"
                      required
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setusername(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profession
                    </label>
                    <input
                      type="text"
                      value={profession}
                      onChange={(e) => setprofession(e.target.value)}
                      placeholder="e.g. Software Developer"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      value={gender}
                      onChange={(e) => setgender(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

             
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Additional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>Location</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Pakistan, Multan"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center space-x-1">
                        <LinkIcon className="w-4 h-4" />
                        <span>Website</span>
                      </div>
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setbio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows="4"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {bio.length}/150 characters
                  </p>
                </div>
              </div>

             
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Account Information
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatJoinDate(userdata?.createdAt)}</span>
                </div>
              </div>

             
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${userdata?.username}`)}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-black text-white rounded-full shadow-sm transition duration-300 font-medium flex items-center justify-center gap-2 min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

       
        <div className="w-full mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}
