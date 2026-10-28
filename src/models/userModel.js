
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true
        },

        businessName: {
            type: String,
            trim: true,
            default: ""
        },

        location: {
            latitude: {
                type: Number,
                default: null
            },
            longitude: {
                type: Number,
                default: null
            }
        },

        role: {
            type: String,
            enum: ['customer', 'farmer', 'admin'],
            default: 'customer'
        },

        status: {
            type: String,
            enum: ['active', 'pending', 'rejected', 'suspended'],
            default: 'active'
        },

        market: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Market',
            default: null
        },

        operatingDays: {
            type: [String],
            default: []
        },

        pickupWindows: {
            type: [String],
            default: []
        },

        profileImage: {
            type: String,
            default: ""
        },

        profileImagePublicId: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Auth = mongoose.model('User', userSchema);

export default Auth;

