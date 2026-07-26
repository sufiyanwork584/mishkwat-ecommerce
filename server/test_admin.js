import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

async function updateAdminEmail() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const result = await User.findOneAndUpdate(
      { email: 'admin@nexabuy.com' },
      { email: 'admin@mishkwat.com' },
      { new: true }
    );
    
    if (result) {
      console.log('✅ Admin email updated successfully!');
      console.log('   New email:', result.email);
    } else {
      // Check if it already exists as mishkwat
      const existing = await User.findOne({ email: 'admin@mishkwat.com' });
      if (existing) {
        console.log('ℹ️  Admin email is already admin@mishkwat.com');
      } else {
        console.log('❌ No admin user found with either email');
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

updateAdminEmail();
