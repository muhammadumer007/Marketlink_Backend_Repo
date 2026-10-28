import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null
        },
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
