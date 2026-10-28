import express from "express";
import { toggleFavorite, getMyFavorites } from "../controllers/favoriteController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const favoriteRoute = express.Router();

favoriteRoute.use(verifyToken, roleMiddleware("customer"));

favoriteRoute.post("/toggle", toggleFavorite);
favoriteRoute.get("/", getMyFavorites);

export default favoriteRoute;
