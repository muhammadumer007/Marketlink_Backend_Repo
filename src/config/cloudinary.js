import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = (fileBuffer, folder = "marketlink") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "auto"
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
        );

        uploadStream.end(fileBuffer);
    });
};

export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return null;
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Cloudinary delete error:", error.message);
        return null;
    }
};

export default cloudinary;
