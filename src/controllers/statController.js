import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Market from "../models/marketModel.js";

export const getPublicStats = async (req, res) => {
    try {
        const farmers = await User.countDocuments({ role: "farmer", status: "active" });
        const products = await Product.countDocuments({ status: "available", quantity: { $gt: 0 } });
        const markets = await Market.countDocuments({ status: "active" });

        return res.status(200).json({
            message: "Public statistics fetched successfully",
            farmers,
            products,
            markets
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch public statistics",
            error: error.message
        });
    }
};
