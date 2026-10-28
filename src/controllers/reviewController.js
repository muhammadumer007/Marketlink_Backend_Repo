import mongoose from "mongoose";
import Review from "../models/Review.js";
import Product from "../models/productModel.js";

export const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = req.body.product || req.body.productId || null;
        const farmer = req.body.farmer || req.body.farmerId || null;
        const customer = req.user._id;

        if (!rating || !comment || (!product && !farmer)) {
            return res.status(400).json({
                message: "Rating, comment, and a target (product or farmer) are required"
            });
        }

        const numRating = Number(rating);
        if (numRating < 1 || numRating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const review = await Review.create({
            customer,
            product,
            farmer,
            rating: numRating,
            comment: comment.trim()
        });

        const populated = await Review.findById(review._id).populate(
            "customer",
            "name"
        );

        return res.status(201).json({
            message: "Review submitted successfully",
            review: populated
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to submit review",
            error: error.message
        });
    }
};

export const getProductReviews = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(200).json({
                message: "No reviews found",
                reviews: [],
                totalReviews: 0,
                averageRating: 0
            });
        }

        const reviews = await Review.find({ product: id })
            .populate("customer", "name")
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;
        const averageRating =
            totalReviews > 0
                ? (
                      reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
                  ).toFixed(1)
                : 0;

        return res.status(200).json({
            message: "Reviews fetched successfully",
            reviews,
            totalReviews,
            averageRating: Number(averageRating)
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch reviews",
            error: error.message
        });
    }
};

export const getFarmerReviews = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(200).json({
                message: "No reviews found",
                reviews: [],
                totalReviews: 0,
                averageRating: 0
            });
        }

        const farmerProducts = await Product.find({ farmer: id }).select('_id');
        const productIds = farmerProducts.map((p) => p._id);

        const reviews = await Review.find({
            $or: [
                { farmer: id },
                { product: { $in: productIds } }
            ]
        })
            .populate("customer", "name")
            .populate("product", "name")
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;
        const averageRating =
            totalReviews > 0
                ? (
                      reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
                  ).toFixed(1)
                : 0;

        return res.status(200).json({
            message: "Farmer reviews fetched successfully",
            reviews,
            totalReviews,
            averageRating: Number(averageRating)
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch farmer reviews",
            error: error.message
        });
    }
};

export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("customer", "name email")
            .populate("product", "name")
            .populate("farmer", "name businessName")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "All reviews fetched successfully",
            reviews
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch reviews",
            error: error.message
        });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        const isAuthor = review.customer.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to delete this review" });
        }

        await Review.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Review deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete review",
            error: error.message
        });
    }
};
