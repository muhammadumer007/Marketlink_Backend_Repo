import Notification from "../models/Notification.js";
import User from "../models/userModel.js";

export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            read: false
        });

        return res.status(200).json({
            message: "Notifications fetched successfully",
            notifications,
            unreadCount
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch notifications",
            error: error.message
        });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        return res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to mark notification as read",
            error: error.message
        });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { read: true }
        );

        return res.status(200).json({
            message: "All notifications marked as read"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to mark all as read",
            error: error.message
        });
    }
};

export const createSystemNotification = async (req, res) => {
    try {
        const { title, message, targetRole } = req.body;

        if (!title || !message) {
            return res.status(400).json({ message: "Title and message are required" });
        }

        const query = {};
        if (targetRole && ["customer", "farmer"].includes(targetRole)) {
            query.role = targetRole;
        }

        const recipients = await User.find(query).select("_id");

        const notifications = recipients.map((user) => ({
            recipient: user._id,
            title: title.trim(),
            message: message.trim(),
            type: "system"
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        return res.status(201).json({
            message: `Notification sent to ${notifications.length} users`
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to send broadcast notification",
            error: error.message
        });
    }
};
