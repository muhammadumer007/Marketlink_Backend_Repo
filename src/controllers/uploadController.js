import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const folder = req.body.folder || "marketlink";
        const result = await uploadToCloudinary(req.file.buffer, folder);

        return res.status(200).json({
            message: "Image uploaded successfully",
            url: result.url,
            publicId: result.publicId,
            public_id: result.publicId
        });
    } catch (error) {
        return res.status(500).json({
            message: "Image upload failed",
            error: error.message
        });
    }
};

export const deleteImage = async (req, res) => {
    try {
        const { publicId } = req.body;
        if (!publicId) {
            return res.status(400).json({ message: "publicId is required" });
        }

        await deleteFromCloudinary(publicId);
        return res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete image",
            error: error.message
        });
    }
};
