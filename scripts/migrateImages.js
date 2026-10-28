import dotenv from 'dotenv';
import dns from 'dns';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function migrateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const allProducts = await Product.find({});
    console.log(`Found ${allProducts.length} total products`);

    for (const p of allProducts) {
      if (p.image && p.image.includes('unsplash.com')) {
        console.log(`Uploading Unsplash image for: "${p.name}" to Cloudinary...`);
        try {
          const res = await cloudinary.uploader.upload(p.image, { folder: 'marketlink' });
          p.image = res.secure_url;
          p.cloudinary_id = res.public_id;
          await p.save();
          console.log(`✓ Updated "${p.name}" => ${res.secure_url}`);
        } catch (err) {
          console.error(`✗ Error uploading for "${p.name}":`, err.message);
        }
      } else if (!p.image) {
        p.image = '/placeholder-product.svg';
        await p.save();
        console.log(`✓ Updated empty image for "${p.name}" to placeholder`);
      } else {
        console.log(`- "${p.name}" already has valid image: ${p.image.substring(0, 50)}...`);
      }
    }

    console.log('Finished migrating all product images!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateImages();
