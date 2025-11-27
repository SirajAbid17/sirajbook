import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import axios from "axios";
import { ServerUrl } from "../App";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setname] = useState("");
  const [username, setusername] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setLoading] = useState(false);

  const SignupHendle = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await axios.post(
        `${ServerUrl}/api/signup`,
        { name, username, password, email },
        { withCredentials: true },
      );
      
      
      if (result.data && result.data.success) {
        toast.success("Signup successful! Please sign in. 🎉");
        navigate("/signin");
      } else {
        toast.error("Invalid response from server");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-2xl overflow-hidden w-full max-w-4xl">
        
          <div className="hidden md:flex w-1/2 bg-gray-200 items-center justify-center">
            <img
              src="./sb.png"
              alt="Signup"
              className="w-3/4 h-auto rounded-tr-2xl rounded-br-2xl"
            />
          </div>

          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
              Sign Up
            </h2>

            <form className="space-y-5" onSubmit={SignupHendle}>
              <input
                value={name}
                onChange={(e) => setname(e.target.value)}
                required
                type="text"
                placeholder="Full Name"
                className="w-full px-5 py-3 border rounded-full focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <input
                required
                value={username}
                onChange={(e) => setusername(e.target.value)}
                type="text"
                placeholder="Username"
                className="w-full px-5 py-3 border rounded-full focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <input
                required
                value={email}
                onChange={(e) => setemail(e.target.value)}
                type="email"
                placeholder="Email"
                className="w-full px-5 py-3 border rounded-full focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <div className="relative w-full">
                <input
                  required
                  value={password}
                  onChange={(e) => setpassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-5 py-3 border rounded-full focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <div
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 rounded-full font-semibold hover:bg-blue-600 transition flex items-center justify-center"
              >
                {loading ? (
                  <div className="relative flex items-center justify-center">
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            <p className="text-sm text-gray-600 text-center mt-6">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/signin")}
                className="text-blue-500 hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}