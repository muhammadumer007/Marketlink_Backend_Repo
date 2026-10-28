import express from "express";
import {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    createSystemNotification
} from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const notificationRoute = express.Router();

notificationRoute.get("/", verifyToken, getMyNotifications);
notificationRoute.patch("/:id/read", verifyToken, markAsRead);
notificationRoute.patch("/read-all", verifyToken, markAllAsRead);

notificationRoute.post("/broadcast", verifyToken, roleMiddleware("admin"), createSystemNotification);

export default notificationRoute;
