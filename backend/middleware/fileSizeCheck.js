const checkFileSize = (req, res, next) => {
    const maxSize = 200 * 1024 * 1024; 
    
    if (req.file && req.file.size > maxSize) {
        return res.status(400).json({
            success: false,
            message: `File size too large. Maximum allowed size is ${maxSize / (1024 * 1024)}MB`
        });
    }
    next();
};

module.exports = checkFileSize;