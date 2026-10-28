import jwt from 'jsonwebtoken';
import Auth from '../models/userModel.js';

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authorization token required'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await Auth
            .findById(decoded.id)
            .select('-password');

        if (!user) {
            return res.status(401).json({
                message: 'User not found'
            });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({
                message: 'Your account has been suspended'
            });
        }

        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
};