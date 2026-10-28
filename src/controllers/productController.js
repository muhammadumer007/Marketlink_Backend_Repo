import Product from "../models/productModel.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            unit,
            quantity,
            description,
            image,
            imagePublicId,
            farmer
        } = req.body;

        const farmerId =
            req.user.role === "farmer"
                ? req.user._id
                : farmer || req.user._id;

        if (
            !name ||
            !category ||
            !price ||
            !unit ||
            quantity === undefined ||
            !description ||
            !farmerId
        ) {
            return res.status(400).json({
                message: "All required product fields must be provided"
            });
        }

        const qty = Number(quantity);

        const product = await Product.create({
            name: name.trim(),
            category,
            price: Number(price),
            unit: unit.trim(),
            quantity: qty,
            description: description.trim(),
            image: image || "",
            imagePublicId: imagePublicId || "",
            farmer: farmerId,
            status: qty > 0 ? "available" : "sold-out"
        });

        return res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to create product",
            error: error.message
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        let filter = {};
        if (req.user && req.user.role === "farmer") {
            filter.farmer = req.user._id;
        }

        const products = await Product.find(filter)
            .populate("category", "name")
            .populate("farmer", "name businessName email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Products fetched successfully",
            products
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });
    }
};

export const getPublicProducts = async (req, res) => {
    try {
        const { search, category, farmer } = req.query;

        const filter = {
            status: "available",
            quantity: { $gt: 0 }
        };

        if (category) {
            filter.category = category;
        }

        if (farmer) {
            filter.farmer = farmer;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const products = await Product.find(filter)
            .populate("category", "name")
            .populate({
                path: "farmer",
                select: "name businessName address location market",
                populate: {
                    path: "market",
                    select: "name address city"
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Products fetched successfully",
            products
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("category", "name description")
            .populate({
                path: "farmer",
                select: "name businessName phone address location market operatingDays pickupWindows",
                populate: {
                    path: "market",
                    select: "name address city operatingDays pickupWindows latitude longitude"
                }
            });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            message: "Product fetched successfully",
            product
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch product",
            error: error.message
        });
    }
};

export const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ farmer: req.user._id })
            .populate("category", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Farmer products fetched successfully",
            products
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch your products",
            error: error.message
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            unit,
            quantity,
            description,
            image,
            imagePublicId,
            status
        } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (
            req.user.role === "farmer" &&
            product.farmer.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Access denied. You can only update your own products."
            });
        }

        if (image && product.imagePublicId && imagePublicId && imagePublicId !== product.imagePublicId) {
            await deleteFromCloudinary(product.imagePublicId);
        }

        if (name !== undefined) product.name = name.trim();
        if (category !== undefined) product.category = category;
        if (price !== undefined) product.price = Number(price);
        if (unit !== undefined) product.unit = unit.trim();
        if (description !== undefined) product.description = description.trim();
        if (image !== undefined) product.image = image;
        if (imagePublicId !== undefined) product.imagePublicId = imagePublicId;

        if (quantity !== undefined) {
            product.quantity = Number(quantity);
            product.status = Number(quantity) > 0 ? "available" : "sold-out";
        } else if (status !== undefined) {
            product.status = status;
        }

        await product.save();

        const updated = await Product.findById(product._id)
            .populate("category", "name")
            .populate("farmer", "name businessName");

        return res.status(200).json({
            message: "Product updated successfully",
            product: updated
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update product",
            error: error.message
        });
    }
};

export const updateProductStock = async (req, res) => {
    try {
        const { quantity, status } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (
            req.user.role === "farmer" &&
            product.farmer.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Access denied. You can only update your own products."
            });
        }

        if (quantity !== undefined) {
            const qty = Number(quantity);
            product.quantity = qty;
            product.status = qty > 0 ? "available" : "sold-out";
        }

        if (status !== undefined) {
            product.status = status;
            if (status === "sold-out") {
                product.quantity = 0;
            }
        }

        await product.save();

        return res.status(200).json({
            message: "Stock updated successfully",
            product
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update stock",
            error: error.message
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (
            req.user.role === "farmer" &&
            product.farmer.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Access denied. You can only delete your own products."
            });
        }

        if (product.imagePublicId) {
            await deleteFromCloudinary(product.imagePublicId);
        }

        await Product.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete product",
            error: error.message
        });
    }
};