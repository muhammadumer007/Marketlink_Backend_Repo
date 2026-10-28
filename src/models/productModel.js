import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        image: {
            type: String,
            default: ""
        },
        imagePublicId: {
            type: String,
            default: ""
        },
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["available", "sold-out"],
            default: "available"
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;