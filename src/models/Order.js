import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

const orderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true
        },
        pickupDate: {
            type: String,
            required: true
        },
        pickupTime: {
            type: String,
            required: true
        },
        market: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Market",
            default: null
        },
        paymentMethod: {
            type: String,
            default: "Pay at Pickup",
            enum: ["Pay at Pickup"]
        },
        status: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Ready for Pickup",
                "Completed",
                "Cancelled"
            ],
            default: "Pending"
        },
        notes: {
            type: String,
            default: ""
        },
        cancellationReason: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
