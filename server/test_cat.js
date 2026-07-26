import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Category from './src/models/Category.js';
import Product from './src/models/Product.js';

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const categories = await Category.find();
  console.log('\n--- Categories ---');
  for (const c of categories) {
    console.log(`- ${c.name} | slug: ${c.slug} | isActive: ${c.isActive} | parent: ${c.parent} | ID: ${c._id}`);
  }

  const products = await Product.find().populate('category');
  console.log('\n--- Products ---');
  for (const p of products) {
    console.log(`- ${p.name} | category: ${p.category ? p.category.name : 'NONE'} | catID: ${p.category ? p.category._id : 'NONE'}`);
  }

  mongoose.disconnect();
}
check();
