import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";
import Category from "./src/models/categoryModel.js";

dns.setServers(['8.8.8.8', '8.8.4.4']);
import Product from "./src/models/productModel.js";
import User from "./src/models/userModel.js";
import Market from "./src/models/marketModel.js";

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        let market = await Market.findOne({ name: "Malir Farmers Market" });
        if (!market) {
            market = await Market.create({
                name: "Malir Farmers Market",
                address: "National Highway, Malir",
                city: "Karachi",
                latitude: 24.8939,
                longitude: 67.1889,
                operatingDays: ["Saturday", "Sunday"],
                pickupWindows: ["08:00 AM - 12:00 PM", "02:00 PM - 06:00 PM"],
                status: "active"
            });
            console.log("Market created:", market.name);
        }

        let farmer = await User.findOne({ email: "farmer1@gmail.com" });
        if (farmer) {
            farmer.businessName = "Green Valley Organic Farm";
            farmer.market = market._id;
            farmer.address = "Farm #12, Malir Agricultural Zone, Karachi";
            farmer.operatingDays = ["Saturday", "Sunday"];
            farmer.pickupWindows = ["08:00 AM - 12:00 PM", "02:00 PM - 06:00 PM"];
            farmer.status = "active";
            await farmer.save();
        }

        const standardCategories = [
            { name: "Vegetables", description: "Farm fresh seasonal vegetables" },
            { name: "Fruits", description: "Naturally ripened sweet fruits" },
            { name: "Organic Greens", description: "Freshly harvested organic leafy greens" },
            { name: "Dairy & Eggs", description: "Fresh farm dairy and organic free-range eggs" },
            { name: "Herbs & Honey", description: "Pure raw honey and aromatic kitchen herbs" }
        ];

        const categoryMap = {};
        for (const cat of standardCategories) {
            let existing = await Category.findOne({ name: cat.name });
            if (!existing) {
                existing = await Category.create({ ...cat, status: "active" });
                console.log("Category created:", existing.name);
            } else {
                existing.status = "active";
                await existing.save();
            }
            categoryMap[cat.name] = existing._id;
        }

        if (farmer) {
            const seedProducts = [
                {
                    name: "Fresh Organic Tomatoes",
                    category: categoryMap["Vegetables"],
                    price: 180,
                    unit: "1 kg",
                    quantity: 45,
                    description: "Juicy, naturally grown red tomatoes picked directly from the vines.",
                    image: "https://res.cloudinary.com/vdbgkalh/image/upload/v1790502972/marketlink/uxphwapkmsfjwwzdy4wq.jpg",
                    farmer: farmer._id,
                    status: "available"
                },
                {
                    name: "Fresh Farm Carrots",
                    category: categoryMap["Vegetables"],
                    price: 140,
                    unit: "1 kg",
                    quantity: 30,
                    description: "Crunchy sweet carrots freshly pulled from organic soil.",
                    image: "https://res.cloudinary.com/vdbgkalh/image/upload/v1790502973/marketlink/frkeiurgf1lflnumvccz.jpg",
                    farmer: farmer._id,
                    status: "available"
                },
                {
                    name: "Organic Green Apples",
                    category: categoryMap["Fruits"],
                    price: 320,
                    unit: "1 kg",
                    quantity: 25,
                    description: "Crisp and tangy green apples grown without chemical pesticides.",
                    image: "https://res.cloudinary.com/vdbgkalh/image/upload/v1790502974/marketlink/o6kofu9u4gyzgstmehzn.jpg",
                    farmer: farmer._id,
                    status: "available"
                },
                {
                    name: "Fresh Leafy Spinach",
                    category: categoryMap["Organic Greens"],
                    price: 90,
                    unit: "1 bunch",
                    quantity: 20,
                    description: "Tender and nutrient-rich dark green spinach leaves harvested this morning.",
                    image: "https://res.cloudinary.com/vdbgkalh/image/upload/v1790502974/marketlink/cf7yzr6jifip1uvyd7et.jpg",
                    farmer: farmer._id,
                    status: "available"
                },
                {
                    name: "Pure Natural Sidr Honey",
                    category: categoryMap["Herbs & Honey"],
                    price: 1200,
                    unit: "500 g",
                    quantity: 15,
                    description: "100% pure raw unfiltered Sidr honey harvested from local beehives.",
                    image: "https://res.cloudinary.com/vdbgkalh/image/upload/v1790502975/marketlink/uhkclpesuxgucd1e6fot.jpg",
                    farmer: farmer._id,
                    status: "available"
                },
                {
                    name: "Farm Fresh Desi Eggs",
                    category: categoryMap["Dairy & Eggs"],
                    price: 380,
                    unit: "1 dozen",
                    quantity: 40,
                    description: "Free-range, grain-fed desi chicken eggs fresh from the farm.",
                    image: "https://res.cloudinary.com/vdbgkalh/image/upload/v1790502975/marketlink/w8dhzpwbzax0pdnw9cb6.jpg",
                    farmer: farmer._id,
                    status: "available"
                }
            ];

            for (const p of seedProducts) {
                const exists = await Product.findOne({ name: p.name });
                if (!exists) {
                    await Product.create(p);
                    console.log("Product seeded:", p.name);
                }
            }
        }

        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err.message);
        process.exit(1);
    }
};

seed();
