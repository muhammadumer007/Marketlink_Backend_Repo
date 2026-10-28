import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
    createUser,
    getUsers,
    getPendingFarmers,
    getFarmers,
    getPublicFarmers,
    getFarmerById,
    rejectFarmer,
    activateFarmer,
    approveFarmer,
    suspendFarmer,
    getCustomers,
    updateCustomerStatus,
    getFarmerProfile,
    updateFarmerProfile,
    updateUserProfile,
    updateFarmerProfileImage
} from '../controllers/userController.js';

export const userRoute = express.Router();

userRoute.get("/farmers/public", getPublicFarmers);
userRoute.get("/farmers/public/:id", getFarmerById);

userRoute.patch("/profile", verifyToken, updateUserProfile);

userRoute.post(
    "/createUser",
    verifyToken,
    roleMiddleware("admin"),
    createUser
);

userRoute.get("/getUser", verifyToken, roleMiddleware("admin"), getUsers);

userRoute.get("/farmers/pending", verifyToken, roleMiddleware("admin"), getPendingFarmers);

userRoute.get("/farmers", verifyToken, roleMiddleware("admin"), getFarmers);

userRoute.patch("/farmers/:id/approve", verifyToken, roleMiddleware("admin"), approveFarmer);

userRoute.patch("/farmers/:id/reject", verifyToken, roleMiddleware("admin"), rejectFarmer);

userRoute.patch("/farmers/:id/activate", verifyToken, roleMiddleware("admin"), activateFarmer);

userRoute.patch("/farmers/:id/suspend", verifyToken, roleMiddleware("admin"), suspendFarmer);

userRoute.get("/customers", verifyToken, roleMiddleware("admin"), getCustomers);

userRoute.patch("/customers/:id/status", verifyToken, roleMiddleware("admin"), updateCustomerStatus);

userRoute.get("/farmer/profile", verifyToken, roleMiddleware("farmer"), getFarmerProfile);

userRoute.patch("/farmer/profile", verifyToken, roleMiddleware("farmer"), updateFarmerProfile);

userRoute.patch("/farmer/profile-image", verifyToken, roleMiddleware("farmer"), updateFarmerProfileImage);

export default userRoute;