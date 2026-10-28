
import bcrypt from 'bcrypt';
import Auth from '../models/userModel.js';
import Market from '../models/marketModel.js';




export const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            role,
            businessName,
            market,
            operatingDays,
            pickupWindows,
            location
        } = req.body;

        if (!name || !email || !password || !phone || !address) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        if (role === "farmer") {
            if (!businessName || !market) {
                return res.status(400).json({
                    message: "Farm business name and assigned market must be provided for a farmer"
                });
            }
        }

        const userExists = await Auth.findOne({
            email: email.trim().toLowerCase()
        });

        if (userExists) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await Auth.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            phone: phone.trim(),
            address: address.trim(),

            role: role || "customer",

            status: role === "farmer"
                ? "active"
                : "active",

            businessName: role === "farmer"
                ? businessName.trim()
                : "",

            market: role === "farmer"
                ? market
                : null,

            operatingDays: role === "farmer"
                ? operatingDays || []
                : [],

            pickupWindows: role === "farmer"
                ? pickupWindows || []
                : [],

            location: role === "farmer"
                ? {
                    latitude: location && location.latitude !== "" && location.latitude !== undefined ? Number(location.latitude) : 0,
                    longitude: location && location.longitude !== "" && location.longitude !== undefined ? Number(location.longitude) : 0
                }
                : {
                    latitude: null,
                    longitude: null
                }
        });

        return res.status(201).json({
            message: role === "farmer"
                ? "Farmer created successfully"
                : "Customer created successfully",

            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                address: newUser.address,
                businessName: newUser.businessName,
                role: newUser.role,
                status: newUser.status,
                market: newUser.market,
                operatingDays: newUser.operatingDays,
                pickupWindows: newUser.pickupWindows,
                location: newUser.location
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to create user",
            error: error.message
        });
    }
};




export const createFarmer = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            businessName,
            market,
            location
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !phone ||
            !address ||
            !businessName ||
            !market ||
            !location ||
            location.latitude === undefined ||
            location.longitude === undefined
        ) {
            return res.status(400).json({
                message: "All required farmer fields must be provided"
            });
        }

        const userExists = await Auth.findOne({
            email: email.trim().toLowerCase()
        });

        if (userExists) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newFarmer = await Auth.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            phone: phone.trim(),
            address: address.trim(),
            businessName: businessName.trim(),
            market: market,
            location: {
                latitude: Number(location.latitude),
                longitude: Number(location.longitude)
            },
            role: "farmer",
            status: "active"
        });

        return res.status(201).json({
            message: "Farmer created successfully",
            farmer: {
                id: newFarmer._id,
                name: newFarmer.name,
                email: newFarmer.email,
                businessName: newFarmer.businessName,
                role: newFarmer.role,
                status: newFarmer.status,
                market: newFarmer.market,
                location: newFarmer.location
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to create farmer",
            error: error.message
        });
    }
};




export const getUsers = async (req, res) => {
    try {
        const allUsers = await Auth
            .find({})
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Users fetched successfully",
            users: allUsers
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
};



export const getPendingFarmers = async (req, res) => {
    try {
        const farmers = await Auth
            .find({
                role: "farmer",
                status: "pending"
            })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Pending farmers fetched successfully",
            farmers
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch pending farmers",
            error: error.message
        });
    }
};

export const getFarmers = async (req, res) => {
    try {
        const farmers = await Auth
            .find({
                role: "farmer"
            })
            .select("-password")
            .populate("market", "name city address")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Farmers fetched successfully",
            farmers
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch farmers",
            error: error.message
        });
    }
};

export const getPublicFarmers = async (req, res) => {
    try {
        const farmers = await Auth
            .find({
                role: "farmer",
                status: "active"
            })
            .select("name email phone address businessName location market operatingDays pickupWindows profileImage")
            .populate("market", "name city address operatingDays pickupWindows")
            .sort({ name: 1 });

        return res.status(200).json({
            message: "Farmers fetched successfully",
            farmers
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch farmers",
            error: error.message
        });
    }
};

export const getFarmerById = async (req, res) => {
    try {
        const farmer = await Auth
            .findOne({
                _id: req.params.id,
                role: "farmer"
            })
            .select("-password")
            .populate("market");

        if (!farmer) {
            return res.status(404).json({
                message: "Farmer not found"
            });
        }

        return res.status(200).json({
            message: "Farmer fetched successfully",
            farmer
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch farmer",
            error: error.message
        });
    }
};


export const approveFarmer = async (req, res) => {
    try {
        const { id } = req.params;

        const farmer = await Auth.findOne({
            _id: id,
            role: "farmer"
        });

  

        if (!farmer) {
            return res.status(404).json({
                message: "Farmer not found"
            });
        }

        if (farmer.status === "active") {
            return res.status(400).json({
                message: "Farmer is already approved"
            });
        }

        farmer.status = "active";
        await farmer.save();

        return res.status(200).json({
            message: "Farmer approved successfully",
            farmer: {
                id: farmer._id,
                name: farmer.name,
                email: farmer.email,
                status: farmer.status
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to approve farmer",
            error: error.message
        });
    }
};



export const rejectFarmer = async (req, res) => {
    try {
        const { id } = req.params;

        const farmer = await Auth.findOne({
            _id: id,
            role: "farmer"
        });

        if (!farmer) {
            return res.status(404).json({
                message: "Farmer not found"
            });
        }

        if (farmer.status !== "pending") {
            return res.status(400).json({
                message: "Farmer request is not pending"
            });
        }

        farmer.status = "rejected";
        await farmer.save();

        return res.status(200).json({
            message: "Farmer request rejected"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to cancel farmer request",
            error: error.message
        });
    }
};


export const activateFarmer = async (req, res) => {
    try {
        const { id } = req.params;

        const farmer = await Auth.findOne({
            _id: id,
            role: "farmer"
        });

        if (!farmer) {
            return res.status(404).json({
                message: "Farmer not found"
            });
        }

        if (farmer.status !== "suspended") {
            return res.status(400).json({
                message: "Farmer is not suspended"
            });
        }

        farmer.status = "active";
        await farmer.save();

        return res.status(200).json({
            message: "Farmer activated successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to activate farmer",
            error: error.message
        });
    }
};




export const suspendFarmer = async (req, res) => {
    try {
        const { id } = req.params;

        const farmer = await Auth.findOne({
            _id: id,
            role: "farmer"
        });

        if (!farmer) {
            return res.status(404).json({
                message: "Farmer not found"
            });
        }

        farmer.status = "suspended";
        await farmer.save();

        return res.status(200).json({
            message: "Farmer suspended successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to suspend farmer",
            error: error.message
        });
    }
};

export const getCustomers = async (req, res) => {
    try {
        const customers = await Auth
            .find({
                role: "customer"
            })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Customers fetched successfully",
            customers
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch customers",
            error: error.message
        });
    }
};

export const updateCustomerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["active", "suspended"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const customer = await Auth.findOne({
            _id: id,
            role: "customer"
        });

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        customer.status = status;
        await customer.save();

        return res.status(200).json({
            message: `Customer ${status === "active" ? "activated" : "suspended"} successfully`,
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                status: customer.status
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to update customer status",
            error: error.message
        });
    }
};

export const getFarmerProfile = async (req, res) => {
    try {
        const farmer = await Auth
            .findOne({
                _id: req.user._id,
                role: "farmer"
            })
            .select("-password")
            .populate("market");

        if (!farmer) {
            return res.status(404).json({
                message: "Farmer not found"
            });
        }

        return res.status(200).json({
            message: "Farmer profile fetched successfully",
            farmer
        });
    } catch (error) {
        return res.status(500).json({
            message: "operation Failed problem to fetch farmer profile",
            error: error.message
        });
    }
};


export const updateFarmerProfile = async (req, res) => {
    try {
        const farmer = await Auth.findOne({
            _id: req.user._id,
            role: "farmer"
        });

        if (!farmer) {
            return res.status(404).json({
                message: "Farmer not found"
            });
        }

        const {
            name,
            phone,
            address,
            market,
            operatingDays,
            pickupWindows,
            profileImage,
            profileImagePublicId
        } = req.body;

        if (name !== undefined) {
            farmer.name = name;
        }

        if (phone !== undefined) {
            farmer.phone = phone;
        }

        if (address !== undefined) {
            farmer.address = address;
        }

        if (market !== undefined) {
            farmer.market = market;
        }

        if (operatingDays !== undefined) {
            farmer.operatingDays = operatingDays;
        }

        if (pickupWindows !== undefined) {
            farmer.pickupWindows = pickupWindows;
        }

        if (profileImage !== undefined) {
            farmer.profileImage = profileImage;
        }

        if (profileImagePublicId !== undefined) {
            farmer.profileImagePublicId = profileImagePublicId;
        }

        await farmer.save();

        const updatedFarmer = await Auth
            .findById(farmer._id)
            .select("-password")
            .populate("market");

        return res.status(200).json({
            message: "Farmer profile updated successfully",
            farmer: updatedFarmer
        });
    } catch (error) {
        return res.status(500).json({
            message: "operation Failed problem to update farmer profile",
            error: error.message
        });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const user = await Auth.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { name, phone, address, profileImage, profileImagePublicId } = req.body;
        if (name !== undefined) user.name = name.trim();
        if (phone !== undefined) user.phone = phone.trim();
        if (address !== undefined) user.address = address.trim();
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (profileImagePublicId !== undefined) user.profileImagePublicId = profileImagePublicId;

        await user.save();

        const updated = await Auth.findById(userId).select("-password");

        return res.status(200).json({
            message: "Profile updated successfully",
            data: updated
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });
    }
};


export const updateFarmerProfileImage = async (req, res) => {
    try {
        const farmer = await Auth.findOne({ _id: req.user._id, role: "farmer" });
        if (!farmer) return res.status(404).json({ message: "Farmer not found" });

        const { profileImage, profileImagePublicId } = req.body;
        if (!profileImage) return res.status(400).json({ message: "Profile image URL is required" });

        // Delete old image from Cloudinary if it exists
        if (farmer.profileImagePublicId) {
            try {
                const { deleteFromCloudinary } = await import('../config/cloudinary.js');
                await deleteFromCloudinary(farmer.profileImagePublicId);
            } catch(e) { /* ignore deletion errors */ }
        }

        farmer.profileImage = profileImage;
        farmer.profileImagePublicId = profileImagePublicId || "";
        await farmer.save();

        return res.status(200).json({
            message: "Profile image updated successfully",
            profileImage: farmer.profileImage
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update profile image", error: error.message });
    }
};
