import Favorite from "../models/Favorite.js";

export const toggleFavorite = async (req, res) => {
    try {
        const customer = req.user._id;
        const { itemType, itemId } = req.body;

        if (!itemType || !itemId) {
            return res.status(400).json({ message: "itemType and itemId are required" });
        }

        if (!["product", "farmer", "market"].includes(itemType)) {
            return res.status(400).json({ message: "Invalid itemType. Must be product, farmer, or market" });
        }

        const query = { customer, itemType };
        if (itemType === "product") query.product = itemId;
        if (itemType === "farmer") query.farmer = itemId;
        if (itemType === "market") query.market = itemId;

        const existing = await Favorite.findOne(query);

        if (existing) {
            await Favorite.findByIdAndDelete(existing._id);
            return res.status(200).json({
                message: "Removed from favorites",
                isFavorite: false
            });
        }

        const newFav = await Favorite.create(query);
        return res.status(201).json({
            message: "Added to favorites",
            isFavorite: true,
            favorite: newFav
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to toggle favorite",
            error: error.message
        });
    }
};

export const getMyFavorites = async (req, res) => {
    try {
        const customer = req.user._id;

        const favorites = await Favorite.find({ customer })
            .populate("product")
            .populate("farmer", "name businessName address location market")
            .populate("market")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Favorites fetched successfully",
            favorites
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch favorites",
            error: error.message
        });
    }
};
