import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Coupon from './src/models/Coupon.js';

async function cleanup() {
  await mongoose.connect(process.env.MONGO_URI);
  await Coupon.deleteOne({ code: 'TESTAUTO' });
  console.log('Cleaned up TESTAUTO coupon');
  mongoose.disconnect();
}
cleanup();
