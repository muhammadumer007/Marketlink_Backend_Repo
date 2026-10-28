import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|gif|webp/;
    const extName = allowedExtensions.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimeType = allowedExtensions.test(file.mimetype);

    if (extName && mimeType) {
        return cb(null, true);
    } else {
        cb(new Error("Only image files (jpg, jpeg, png, gif, webp) are allowed!"));
    }
};

export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter
});