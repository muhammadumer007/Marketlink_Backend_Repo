import express from "express";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getFarmerOrders,
    updateOrderStatus,
    getAllOrders,
    getOrderReports
} from "../controllers/orderController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const orderRoute = express.Router();

orderRoute.post("/", verifyToken, roleMiddleware("customer"), createOrder);
orderRoute.get("/my-orders", verifyToken, roleMiddleware("customer"), getMyOrders);
orderRoute.patch("/:id/cancel", verifyToken, cancelOrder);

orderRoute.get("/farmer-orders", verifyToken, roleMiddleware("farmer"), getFarmerOrders);
orderRoute.get("/farmer/orders", verifyToken, roleMiddleware("farmer"), getFarmerOrders);
orderRoute.patch("/:id/status", verifyToken, roleMiddleware("farmer", "admin"), updateOrderStatus);

orderRoute.get("/all", verifyToken, roleMiddleware("admin"), getAllOrders);
orderRoute.get("/admin/all-orders", verifyToken, roleMiddleware("admin"), getAllOrders);
orderRoute.get("/reports", verifyToken, roleMiddleware("admin"), getOrderReports);
orderRoute.get("/admin/reports", verifyToken, roleMiddleware("admin"), getOrderReports);

orderRoute.get("/:id", verifyToken, getOrderById);

export default orderRoute;
