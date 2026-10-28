import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

import {
    createMarket,
    getMarkets,
    getPublicMarkets,
    getMarketById,
    updateMarket,
    deleteMarket
} from "../controllers/marketController.js";

const marketRoute = express.Router();

marketRoute.get(
    "/public",
    getPublicMarkets
);

marketRoute.post(
    "/",
    verifyToken,
    roleMiddleware("admin"),
    createMarket
);

marketRoute.get(
    "/",
    verifyToken,
    roleMiddleware("admin"),
    getMarkets
);

marketRoute.get(
    "/public/:id",
    getMarketById
);

marketRoute.get(
    "/:id",
    getMarketById
);

marketRoute.patch(
    "/:id",
    verifyToken,
    roleMiddleware("admin"),
    updateMarket
);

marketRoute.delete(
    "/:id",
    verifyToken,
    roleMiddleware("admin"),
    deleteMarket
);

export default marketRoute;