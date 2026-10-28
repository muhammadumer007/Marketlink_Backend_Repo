import Market from "../models/marketModel.js";

export const createMarket = async (req, res) => {
    try {
        const {
            name,
            address,
            city,
            latitude,
            longitude,
            operatingDays,
            pickupWindows
        } = req.body;

        if (
            !name ||
            !address ||
            !city ||
            latitude === undefined ||
            longitude === undefined ||
            !operatingDays ||
            !pickupWindows
        ) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        const marketExists = await Market.findOne({
            name: name.trim()
        });

        if (marketExists) {
            return res.status(409).json({
                message: "Market already exists"
            });
        }

        const market = await Market.create({
            name: name.trim(),
            address: address.trim(),
            city: city.trim(),
            latitude: Number(latitude),
            longitude: Number(longitude),
            operatingDays,
            pickupWindows
        });

        return res.status(201).json({
            message: "Market created successfully",
            market
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to create market",
            error: error.message
        });
    }
};

export const getMarkets = async (req, res) => {
    try {
        const markets = await Market
            .find({})
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Markets fetched successfully",
            markets
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch markets",
            error: error.message
        });
    }
};

export const getPublicMarkets = async (req, res) => {
    try {
        const markets = await Market
            .find({ status: "active" })
            .select(
                "name address city operatingDays pickupWindows latitude longitude"
            )
            .sort({ name: 1 });

        return res.status(200).json({
            message: "Markets fetched successfully",
            markets
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch markets",
            error: error.message
        });
    }
};

export const getMarketById = async (req, res) => {
    try {
        const market = await Market.findById(req.params.id);

        if (!market) {
            return res.status(404).json({
                message: "Market not found"
            });
        }

        return res.status(200).json({
            message: "Market fetched successfully",
            market
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch market",
            error: error.message
        });
    }
};


export const updateMarket = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            address,
            city,
            latitude,
            longitude,
            operatingDays,
            pickupWindows,
            status
        } = req.body;

        const market = await Market.findById(id);

        if (!market) {
            return res.status(404).json({
                message: "Market not found"
            });
        }

        if (name) {
            const duplicate = await Market.findOne({
                name: name.trim(),
                _id: { $ne: id }
            });

            if (duplicate) {
                return res.status(409).json({
                    message: "Market already exists"
                });
            }

            market.name = name.trim();
        }

        if (address !== undefined) {
            market.address = address.trim();
        }

        if (city !== undefined) {
            market.city = city.trim();
        }

        if (latitude !== undefined) {
            market.latitude = Number(latitude);
        }

        if (longitude !== undefined) {
            market.longitude = Number(longitude);
        }

        if (operatingDays !== undefined) {
            market.operatingDays = operatingDays;
        }

        if (pickupWindows !== undefined) {
            market.pickupWindows = pickupWindows;
        }

        if (status !== undefined) {
            if (!["active", "inactive"].includes(status)) {
                return res.status(400).json({
                    message: "Invalid market status"
                });
            }

            market.status = status;
        }

        await market.save();

        return res.status(200).json({
            message: "Market updated successfully",
            market
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to update market",
            error: error.message
        });
    }
};

export const deleteMarket = async (req, res) => {
    try {
        const { id } = req.params;

        const market = await Market.findByIdAndDelete(id);

        if (!market) {
            return res.status(404).json({
                message: "Market not found"
            });
        }

        return res.status(200).json({
            message: "Market deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete market",
            error: error.message
        });
    }
};