import express from "express";
import { upload } from "../middleware/upload.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { uploadImage, deleteImage } from "../controllers/uploadController.js";

import { roleMiddleware } from "../middleware/roleMiddleware.js";

const uploadRoute = express.Router();

uploadRoute.post("/", verifyToken, roleMiddleware("farmer", "admin"), upload.single("image"), uploadImage);
uploadRoute.delete("/", verifyToken, roleMiddleware("farmer", "admin"), deleteImage);

export default uploadRoute;
