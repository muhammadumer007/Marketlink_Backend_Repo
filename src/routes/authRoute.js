import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
    registerUser,
    farmerRegister,
    loginUser,
    userProfile
} from '../controllers/authController.js';

const authRoute = express.Router();

authRoute.post('/register', registerUser);
authRoute.post('/login', loginUser);
authRoute.get('/profile', verifyToken, userProfile);

authRoute.get('/admin',verifyToken,roleMiddleware('admin'), (req, res) => {res.send('Welcome to Admin Dashboard'); }
);

authRoute.get('/farmer',verifyToken,roleMiddleware('farmer'),(req, res) => {  res.send('Welcome to Farmer Dashboard');}
);

authRoute.get('/customer',verifyToken,roleMiddleware('customer'),(req, res) => {    res.send('Welcome to Customer Dashboard'); }
);
authRoute.post('/farmer-register', farmerRegister);

export default authRoute;