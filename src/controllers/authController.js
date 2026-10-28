import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Auth from '../models/userModel.js';


export const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            role
        } = req.body;

        if (!name || !email || !password || !phone ) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        const userExists = await Auth.findOne({
            email: email
        });

        if (userExists) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userRole = role === "farmer" ? "farmer" : "customer";

        const newUser = await Auth.create({
            name: name,
            email: email,
            password: hashedPassword,
            phone,
            address,
            role: userRole,
            status: userRole === "farmer" ? "pending" : "active"
        });

        res.status(201).json({
            message: userRole === "farmer"
                ? "Farmer registration submitted for approval"
                : "User registered successfully",
            newUser
        });
        

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const registeredAuth = await Auth.findOne({
            email: email
        });

        if (!registeredAuth) {
            return res.status(404).json({
                message: "User does not exist"
            });
        }

        if (registeredAuth.status === "suspended") {
            return res.status(403).json({
                message: "Your account has been suspended"
            });
        }


        const isMatch = await bcrypt.compare(
            password,
            registeredAuth.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                id: registeredAuth._id,
                role: registeredAuth.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            message: "User login successfully",
            token,
         registeredAuth
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};

export const userProfile = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized, user id missing"
            });
        }

        const user = await Auth
            .findById(userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile fetched successfully",
            data: user
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export const farmerRegister = async (req, res) => {
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
            location.longitude === undefined ||
            location.latitude === "" ||
            location.longitude === ""
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
            status: "pending"
        });

        return res.status(201).json({
            message: "Farmer registration submitted for approval",
            farmer: {
                id: newFarmer._id,
                name: newFarmer.name,
                email: newFarmer.email,
                businessName: newFarmer.businessName,
                role: newFarmer.role,
                status: newFarmer.status
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Farmer registration failed",
            error: error.message
        });
    }
};
