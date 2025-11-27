const Users = require("../models/usermodels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendmail = require("../config/email");
require("dotenv").config();



const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    const finduseremail = await Users.findOne({ email });
    if (finduseremail) {
      return res.status(400).json({ 
        success: false, 
        message: "Email Already Exists!" 
      });
    }

    const findusername = await Users.findOne({ username });
    if (findusername) {
      return res.status(400).json({ 
        success: false, 
        message: "Username Already Exists!" 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);

    const user = await Users.create({ 
      name, 
      email, 
      username, 
      password: hashpassword 
    });

    const token = jwt.sign({ user: user._id }, process.env.SECRET_KEY, { 
      expiresIn: "1y" 
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;

    return res.status(201).json({ 
      success: true,
      message: "Signup successful!",
      user: userWithoutPassword 
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Account not found, please sign up" 
      });
    }

    const comparepassword = await bcrypt.compare(password, user.password);
    if (!comparepassword) {
      return res.status(400).json({ 
        success: false,
        message: "Incorrect Password" 
      });
    }

    const token = jwt.sign({ user: user._id }, process.env.SECRET_KEY, { 
      expiresIn: "1y" 
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

   
    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;

    return res.status(200).json({ 
      success: true,
      message: "Signin successfully!", 
      user: userWithoutPassword 
    });

  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

const signout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Logout SuccessFully!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


const sendotp = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await Users.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found!" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    user.resetotp = otp;
    user.otpexpire = Date.now() + 5 * 60 * 1000; 
    user.otpverify = false;
    
    await user.save();
    
    
    await sendmail(email, `Your OTP is: ${otp}`);

  
    if (process.env.NODE_ENV !== "production") {
      return res.status(200).json({ 
        message: "OTP sent to email!", 
        otp, 
        debug: "This OTP is only shown in development mode" 
      });
    }

    return res.status(200).json({ message: "OTP sent to email!" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ error: error.message });
  }
};


const verifyotp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await Users.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.resetotp || user.resetotp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpexpire < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

  
    user.otpverify = true;
    user.resetotp = undefined; 
    user.otpexpire = undefined;
    
    await user.save();

    return res.status(200).json({ message: "OTP Verified Successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ error: error.message });
  }
};


const resetpassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await Users.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.otpverify) {
      return res.status(400).json({ message: "OTP verification required. Please verify OTP first." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);

  
    user.password = hashpassword;
    user.otpverify = false; 
    
    await user.save();

    return res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { signup, signin, signout, sendotp, verifyotp, resetpassword };