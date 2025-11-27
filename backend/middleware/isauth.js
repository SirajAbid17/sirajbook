const jwt = require('jsonwebtoken');

const isauth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required. Please sign in." 
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    if (!decoded || !decoded.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token. Please sign in again." 
      });
    }

    req.userid = decoded.user;
    next(); 

  } catch (error) {
    console.error("Auth middleware error:", error);
    
   
    return res.status(401).json({ 
      success: false, 
      message: "Authentication failed. Please sign in again." 
    });
  }
};

module.exports = isauth;