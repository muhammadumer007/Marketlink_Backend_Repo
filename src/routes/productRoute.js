import express from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    getMyProducts,
    updateProduct,
    updateProductStock,
    deleteProduct,
    getPublicProducts
} from "../controllers/productController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const productRoute = express.Router();

productRoute.get("/public", getPublicProducts);
productRoute.get("/farmer/my-products", verifyToken, roleMiddleware("farmer"), getMyProducts);
productRoute.patch("/:id/stock", verifyToken, roleMiddleware("farmer", "admin"), updateProductStock);

productRoute.get("/", verifyToken, roleMiddleware("farmer", "admin"), getProducts);
productRoute.post("/", verifyToken, roleMiddleware("farmer", "admin"), createProduct);
productRoute.get("/:id", getProductById);
productRoute.put("/:id", verifyToken, roleMiddleware("farmer", "admin"), updateProduct);
productRoute.patch("/:id", verifyToken, roleMiddleware("farmer", "admin"), updateProduct);
productRoute.delete("/:id", verifyToken, roleMiddleware("farmer", "admin"), deleteProduct);

export default productRoute;