import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import dns from 'node:dns';

import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import productRoute from './routes/productRoute.js';
import categoryRoute from './routes/categoryRoute.js';
import marketRoute from './routes/marketRoute.js';
import orderRoute from './routes/orderRoute.js';
import reviewRoute from './routes/reviewRoute.js';
import favoriteRoute from './routes/favoriteRoute.js';
import notificationRoute from './routes/notificationRoute.js';
import uploadRoute from './routes/uploadRoute.js';
import statRoute from './routes/statRoute.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/products', productRoute);
app.use('/categories', categoryRoute);
app.use('/market', marketRoute);
app.use('/orders', orderRoute);
app.use('/reviews', reviewRoute);
app.use('/favorites', favoriteRoute);
app.use('/notifications', notificationRoute);
app.use('/upload', uploadRoute);
app.use('/stats', statRoute);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Database connected');

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.log('Database connection failed:', error.message);
    });
