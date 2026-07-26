import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: { url: String, public_id: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // 1. Create and insert the parent category first
    const parentCategory = await Category.create({
      name: 'Hajj & Umrah Series',
      slug: 'hajj-umrah-series',
      description: 'Complete collection of Hajj & Umrah travel guide card sets, Dua flash cards, and Tasbih accessories by Mishkwat Publications.',
      parent: null
    });
    console.log('Created parent category: Hajj & Umrah Series');

    // 2. Create the child categories linked to the parent category
    const childCategories = [
      {
        name: 'Hajj Edition',
        slug: 'hajj-edition',
        description: 'Hajj & Umrah combined guide card sets with 5-day Hajj planner, Duas for Mina, Arafat, Muzdalifah, Jamaraat and Ziyarat of Madinah. Available in Urdu, Roman Urdu, and Hindi.',
        parent: parentCategory._id
      },
      {
        name: 'Umrah Edition',
        slug: 'umrah-edition',
        description: 'Umrah-only guide card sets with 35 essential Duas and a step-by-step Umrah checklist. Compact, waterproof flash cards with Tawaf Tasbih and lanyard. Available in Urdu, Roman Urdu, and Hindi.',
        parent: parentCategory._id
      },
      {
        name: 'Mishkwat Hajj Umrah Tasbih',
        slug: 'mishkwat-hajj-umrah-tasbih',
        description: 'Keychain-style compact Dua Tasbih sets for Hajj & Umrah. 18 cards with 30 essential Duas and a built-in 7-bead Tawaf counter. Available in packs of 6 and 10.',
        parent: parentCategory._id
      }
    ];

    await Category.insertMany(childCategories);
    console.log('Inserted Mishkwat subcategories successfully linked to parent');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding categories:', err);
    process.exit(1);
  }
}

seedCategories();
