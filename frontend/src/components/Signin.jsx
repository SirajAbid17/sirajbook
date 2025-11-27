import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import axios from "axios";
import { ServerUrl } from "../App";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { setuserdata } from "../redux/userslice";

export default function Signin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setLoading] = useState(false);

  const Hednlesingin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await axios.post(
        `${ServerUrl}/api/signin`,
        { email, password },
        { withCredentials: true },
      );
      
     
      if (result.data && result.data.user) {
        dispatch(setuserdata(result.data.user));
        toast.success("Signin successful 🎉");
        navigate("/");
      } else {
        toast.error("Invalid response from server");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signin failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const Forgot = () => {
    navigate('/forgotpassword');
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-2xl overflow-hidden w-full max-w-3xl min-h-[450px]">
          <div className="hidden md:flex w-1/2 bg-gray-200 items-center justify-center">
            <img
              src="./sb.png"
              alt="Signin"
              className="w-3/4 h-auto rounded-xl"
            />
          </div>

          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
              Sign In
            </h2>

            <form className="space-y-6" onSubmit={Hednlesingin}>
              <input
                value={email}
                onChange={(e) => setemail(e.target.value)}
                required
                type="email"
                placeholder="Email"
                className="w-full px-5 py-3 border rounded-full focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <div className="relative w-full">
                <input
                  value={password}
                  onChange={(e) => setpassword(e.target.value)}
                  required
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

              <div className="flex justify-end -mt-3">
                <button
                  onClick={Forgot}
                  type="button"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Forgot Password?
                </button>
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
                  "Sign In"
                )}
              </button>
            </form>

            <p className="text-sm text-gray-600 text-center mt-6">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-500 hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}