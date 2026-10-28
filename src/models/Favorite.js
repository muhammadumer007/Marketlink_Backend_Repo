import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        itemType: {
            type: String,
            required: true,
            enum: ["product", "farmer", "market"]
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null
        },
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        market: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Market",
            default: null
        }
    },
    {
        timestamps: true
    }
);

favoriteSchema.index({ customer: 1, itemType: 1, product: 1, farmer: 1, market: 1 });

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
