import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { createCategory, updateCategory, deleteCategory, getCategories } from '../controllers/categoryController.js';


const categoryRoute = express.Router();

categoryRoute.post("/", verifyToken, roleMiddleware("admin"), createCategory);

categoryRoute.get("/", getCategories);
categoryRoute.get("/public", getCategories);

categoryRoute.patch("/:id", verifyToken, roleMiddleware("admin"), updateCategory);

categoryRoute.delete("/:id", verifyToken, roleMiddleware("admin"), deleteCategory);
export default categoryRoute;

