import express from "express";
import {
    createReview,
    getProductReviews,
    getFarmerReviews,
    getAllReviews,
    deleteReview
} from "../controllers/reviewController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const reviewRoute = express.Router();

reviewRoute.get("/product/:id", getProductReviews);
reviewRoute.get("/farmer/:id", getFarmerReviews);

reviewRoute.post("/", verifyToken, roleMiddleware("customer"), createReview);
reviewRoute.get("/", verifyToken, roleMiddleware("admin"), getAllReviews);
reviewRoute.get("/all", verifyToken, roleMiddleware("admin"), getAllReviews);
reviewRoute.delete("/:id", verifyToken, deleteReview);

export default reviewRoute;
