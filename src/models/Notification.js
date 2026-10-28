import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ["order", "status", "system"],
            default: "system"
        },
        read: {
            type: Boolean,
            default: false
        },
        link: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
