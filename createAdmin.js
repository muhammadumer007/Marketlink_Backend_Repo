import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Auth from './src/models/userModel.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const adminExists = await Auth.findOne({
            role: "admin"
        });

        if (adminExists) {
            console.log("Admin already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash("Admin123", 10);

        await Auth.create({
            name: "MarketLink Admin",
            email: "admin@gmail.com",
            password: hashedPassword,
            phone: "03000000000",
            address: "MarketLink Office",
            role: "admin",
            status: "active"
        });

        console.log("Admin created successfully");
        console.log("Email: admin@.com");
        console.log("Password: Admin@123");

        process.exit(0);
    } catch (error) {
        console.log("Failed to create admin:", error.message);
        process.exit(1);
    }
};

createAdmin();