import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Category from './src/models/Category.js';
import Product from './src/models/Product.js';

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const products = await Product.find().populate('category');
  
  for (const p of products) {
    if (p.category && p.category.parent) {
      // The product's category is actually a subcategory!
      console.log(`Fixing product: ${p.title}`);
      
      const subcategoryId = p.category._id;
      const parentId = p.category.parent;
      
      await Product.findByIdAndUpdate(p._id, {
        category: parentId,
        subcategory: subcategoryId
      });
      console.log(`  -> category set to ${parentId}, subcategory set to ${subcategoryId}`);
    }
  }

  console.log('Done!');
  mongoose.disconnect();
}
migrate();
