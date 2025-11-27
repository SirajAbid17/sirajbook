import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ServerUrl } from "../App"; 

export default function Forgotpassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

 
  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${ServerUrl}/api/sendotp`, 
        { email }, 
        { withCredentials: true }
      );
      
      toast.success("OTP sent successfully!");
      
      
      
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(
        `${ServerUrl}/api/verifyotp`, 
        { email, otp }, 
        { withCredentials: true }
      );
      toast.success("OTP verified!");
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
    setLoading(false);
  };


  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(
        `${ServerUrl}/api/resetpassword`, 
        {
          email,
          password: newPassword,
        }, 
        { withCredentials: true }
      );
      
      toast.success("Password reset successfully!");
      
    
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      
   
      setTimeout(() => {
        window.location.href = "/signin"; 
      }, 2000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Error resetting password");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      
        {step === 1 && (
          <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Forgot Password
            </h2>
            <form onSubmit={handleSendOtp} className="space-y-5">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                placeholder="Enter your email"
                className="w-full px-5 py-3 border rounded-full focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 rounded-full font-semibold hover:bg-blue-600 transition flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <button 
                onClick={() => window.history.back()} 
                className="text-blue-500 hover:text-blue-700"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}

     
        {step === 2 && (
          <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Verify OTP
            </h2>
            <p className="text-center text-gray-600 mb-4">
              OTP sent to: {email}
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                type="text"
                placeholder="Enter 4-digit OTP"
                maxLength="4"
                className="w-full px-5 py-3 border rounded-full focus:ring-2 focus:ring-blue-400 outline-none text-center text-xl"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 rounded-full font-semibold hover:bg-blue-600 transition flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <button 
                onClick={() => setStep(1)} 
                className="text-blue-500 hover:text-blue-700"
              >
                Change Email
              </button>
            </div>
          </div>
        )}

      
        {step === 3 && (
          <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Reset Password
            </h2>
            <form onSubmit={handleResetPassword} className="space-y-5">
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                type="password"
                placeholder="New Password (min. 6 characters)"
                minLength="6"
                className="w-full px-5 py-3 border rounded-full focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                type="password"
                placeholder="Confirm Password"
                minLength="6"
                className="w-full px-5 py-3 border rounded-full focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 rounded-full font-semibold hover:bg-blue-600 transition flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}





