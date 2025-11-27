const cloudinary = require("cloudinary").v2;
require('dotenv').config();

const uploadoncloudinary = async (fileBuffer, options = {}) => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "auto",
                    folder: "sirajbook",
                    chunk_size: 6000000, 
                    timeout: 120000, 
                    ...options
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            
            uploadStream.end(fileBuffer);
        });
        
    } catch (error) {
        console.log("Cloudinary upload error:", error);
        throw error;
    }
}

module.exports = uploadoncloudinary;