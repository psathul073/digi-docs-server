import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dwwryprl0",
    api_key: process.env.CLOUDINARY_API_KEY || "524546218937437",
    api_secret: process.env.CLOUDINARY_API_SECRET || "5Nonr3HyfPJOZHnxYipAobNhotY",
    secure: true, // Ensures secure URLs (https)
});

export default cloudinary;