import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

async function fixPasswords() {
  await mongoose.connect(process.env.MONGO_URI);
  const hash = await bcrypt.hash('123456', 10);
  
  await mongoose.connection.collection('users').updateOne(
    { email: 'admin@gmail.com' },
    { $set: { password: hash } }
  );
  await mongoose.connection.collection('users').updateOne(
    { email: 'farmer1@gmail.com' },
    { $set: { password: hash } }
  );
  await mongoose.connection.collection('users').updateOne(
    { email: 'farmer@gmail.com' },
    { $set: { password: hash } }
  );
  await mongoose.connection.collection('users').updateOne(
    { email: 'customer@gmail.com' },
    { $set: { password: hash } }
  );

  console.log('Demo accounts password set to "123456" successfully:');
  console.log('  Admin:    admin@gmail.com    / 123456');
  console.log('  Farmer:   farmer1@gmail.com  / 123456');
  console.log('  Farmer:   farmer@gmail.com   / 123456');
  console.log('  Customer: customer@gmail.com / 123456');
  process.exit(0);
}
fixPasswords();
