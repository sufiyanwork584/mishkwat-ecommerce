import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Product from './src/models/Product.js';
import Category from './src/models/Category.js';



async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // 2. Fetch categories to link
    const categories = await Category.find({});
    const getCatId = (slug) => {
      const cat = categories.find(c => c.slug === slug);
      return cat ? cat._id : null;
    };

    const hajjEditionId     = getCatId('hajj-edition');
    const umrahEditionId    = getCatId('umrah-edition');
    const tasbihId          = getCatId('mishkwat-hajj-umrah-tasbih');

    if (!categories.length) {
      console.error('No categories found. Please run categories_seed.js first.');
      process.exit(1);
    }

    // 3. Define Mishkwat products
    const products = [

      // ── Hajj Edition ────────────────────────────────────────

      {
        title: 'Mishkwatul Hajj Wal Umrah (Urdu)',
        description: `Hajj & Umrah Prayers (Dua) Card in Arabic with Urdu translation. Includes a complete Umrah checklist, a 5-day Hajj planner, and 33 essential supplications organized to guide pilgrims step by step through their journey.

Product Details:
- Language: Arabic with Urdu Translation
- Total Cards: 19 Flash Cards
- Paper Quality: Premium 300 GSM Art Card with Gloss Lamination
- Size: 69mm x 85mm
- Accessories: Stainless Steel Ring Binding, Tawaf Tasbih (7-bead counter), Neck Lanyard

Covers: Dua for Safar, Umrah Checklist, Intention for Ihram, Talbiyah, Entering Masjid al-Haram, Duas during Tawaf, At Rukn-e-Yamani, Zamzam Water, Sa'i, 5-Day Hajj Planner (8th–12th Dhul Hijjah), Duas at Mina, Arafat, Muzdalifah, Rami of Jamaraat, Tawaf-e-Wida, Ziyarat of Madinah, Salaam at Roza-e-Rasool ﷺ.`,
        category: hajjEditionId,
        brand: 'Mishkwat Publications',
        price: 550,
        salePrice: 320,
        stock: 500,
        images: [
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/HU1.jpg', publicId: 'HU1' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/HU3-1.jpg', publicId: 'HU3' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/HU4.jpg', publicId: 'HU4' }
        ],
        isFeatured: true,
        totalRatings: 0,
        avgRating: 0
      },

      {
        title: 'Mishkwat Hajj wal Umrah (Roman Urdu Script)',
        description: `Hajj & Umrah prayers in Arabic with Roman Urdu translation. Features a comprehensive Umrah checklist, detailed 5-day Hajj routine, and 33 essential Duas designed to guide the pilgrim step by step through their sacred journey.

Product Details:
- Language: Arabic with Roman Urdu Translation
- Total Cards: 19 Flash Cards
- Paper Quality: Premium 300 GSM Art Card with Gloss Lamination
- Size: 69mm x 85mm
- Accessories: Stainless Steel Ring Binding, Tawaf Tasbih (7-bead counter), Neck Lanyard

Covers: Dua for Safar, Umrah Checklist, Intention for Ihram, Talbiyah, Entering Masjid al-Haram, Duas during Tawaf, At Rukn-e-Yamani, Zamzam Water, Sa'i, 5-Day Hajj Planner (8th–12th Dhul Hijjah), Duas at Mina, Arafat, Muzdalifah, Rami of Jamaraat, Tawaf-e-Wida, Ziyarat of Madinah, Salaam at Roza-e-Rasool ﷺ.`,
        category: hajjEditionId,
        brand: 'Mishkwat Publications',
        price: 550,
        salePrice: 320,
        stock: 500,
        images: [
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/HE1.jpg', publicId: 'HE1' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/HE2-1.jpg', publicId: 'HE2' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/HE3-1.jpg', publicId: 'HE3' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/HE4.jpg', publicId: 'HE4' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/HE5-2.jpg', publicId: 'HE5' }
        ],
        isFeatured: true,
        totalRatings: 0,
        avgRating: 0
      },

      {
        title: 'Mishkwat Hajj wal Umrah (Hindi Script)',
        description: `Compact Hajj & Umrah guide card in Arabic with Hindi translation. Includes a step-by-step checklist for Umrah rituals, essential notes for Hajj preparation, a structured 5-day travel routine, and key reminders to keep travelers organized and confident throughout their journey.

Product Details:
- Language: Arabic with Hindi Translation
- Total Cards: 19 Flash Cards
- Paper Quality: Premium 300 GSM Art Card with Gloss Lamination
- Size: 85mm x 135mm
- Accessories: Stainless Steel Ring Binding, Tawaf Tasbih (7-bead counter), Neck Lanyard

Covers: Dua for Safar, Umrah Checklist, Intention for Ihram, Talbiyah, Entering Masjid al-Haram, Duas during Tawaf, At Rukn-e-Yamani, Zamzam Water, Sa'i, 5-Day Hajj Planner (8th–12th Dhul Hijjah), Duas at Mina, Arafat, Muzdalifah, Rami of Jamaraat, Tawaf-e-Wida, Ziyarat of Madinah, Salaam at Roza-e-Rasool ﷺ.`,
        category: hajjEditionId,
        brand: 'Mishkwat Publications',
        price: 700,
        salePrice: 370,
        stock: 500,
        images: [
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/HH1-1.jpg', publicId: 'HH1' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/HH2.jpg', publicId: 'HH2' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/HH3.jpg', publicId: 'HH3' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/HH4.jpg', publicId: 'HH4' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/HH5.jpg', publicId: 'HH5' }
        ],
        isFeatured: true,
        totalRatings: 0,
        avgRating: 0
      },

      // ── Umrah Edition ───────────────────────────────────────

      {
        title: 'Mishkwatul Umrah (Urdu Script)',
        description: `Compact Umrah Dua Card in Arabic with Urdu translation. Includes a complete Umrah checklist and 35 essential Duas organized to help pilgrims follow every step of their journey with ease.

Product Details:
- Language: Arabic with Urdu Translation
- Total Flash Cards: 19
- Material: Premium 300 GSM Gloss Laminated Art Card
- Size: 69mm x 86mm
- Accessories: Stainless Steel Ring Binding, Tawaf Tasbih (7-bead counter), Neck Lanyard
- Travel-Friendly, Durable, Water-Resistant

Covers 35 Duas: Dua for Safar, Umrah Checklist, Intention for Ehram, Talbiyah, Entering Masjid al-Haram, First Sight of Kaaba, Duas during Tawaf, At Rukn-e-Yamani, Zamzam Water, Sa'i at Safa & Marwah, Halq/Qasr, Meezab al-Rahmah, Multazim, Tawaf-e-Wida, Entering Madinah, Salaam at Roza-e-Rasool ﷺ, Jannat-ul-Baqi, and returning home.`,
        category: umrahEditionId,
        brand: 'Mishkwat Publications',
        price: 550,
        salePrice: 319,
        stock: 500,
        images: [
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/UU1.jpg', publicId: 'UU1' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/UU4.jpg', publicId: 'UU4' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/UU2.jpg', publicId: 'UU2' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/UU5.jpg', publicId: 'UU5' }
        ],
        isFeatured: true,
        totalRatings: 0,
        avgRating: 0
      },

      {
        title: 'Mishkwatul Umrah (Roman Urdu Script)',
        description: `Portable Umrah Guide Card in Arabic with Roman Urdu translation. Features a complete Umrah checklist along with 35 essential Duas for Umrah — structured to help pilgrims perform each step of their journey with ease.

Product Details:
- Language: Arabic + Roman Urdu Translation
- Total Flash Cards: 19
- Material: Premium 300 GSM Gloss Laminated Art Card
- Size: 85mm x 135mm
- Binding: Stainless Steel Ring
- Includes: Tawaf Tasbih (7-lap Counter) + Lanyard
- Travel-Friendly, Compact, Durable, Water-Resistant

Covers 35 Duas: Dua for Safar, Umrah Checklist, Intention for Ehram, Talbiyah, Entering Masjid al-Haram, First Sight of Kaaba, Duas during Tawaf, At Rukn-e-Yamani, Zamzam Water, Sa'i at Safa & Marwah, Halq/Qasr, Meezab al-Rahmah, Multazim, Tawaf-e-Wida, Entering Madinah, Salaam at Roza-e-Rasool ﷺ, Jannat-ul-Baqi, and returning home.`,
        category: umrahEditionId,
        brand: 'Mishkwat Publications',
        price: 700,
        salePrice: 390,
        stock: 500,
        images: [
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/UE1.jpg', publicId: 'UE1' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/UE2.jpg', publicId: 'UE2' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/UE3.jpg', publicId: 'UE3' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/UE4.jpg', publicId: 'UE4' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/UE5.jpg', publicId: 'UE5' }
        ],
        isFeatured: true,
        totalRatings: 0,
        avgRating: 0
      },

      {
        title: 'Mishkwatul Umrah Hindi',
        description: `Umrah guide Dua cards in Arabic with Hindi translation. Features a comprehensive Umrah checklist and 35 essential Prayers for the Umrah Journey, designed to guide the traveller step by step throughout their sacred journey.

Product Details:
- Language: Arabic + Hindi Translation
- Total Flash Cards: 19
- Material: Premium 300 GSM Gloss Laminated Art Card
- Size: 85mm x 135mm
- Binding: Stainless Steel Ring
- Includes: Tawaf Tasbih (7-lap Counter) + Lanyard
- Travel-Friendly, Durable, Water-Resistant

Covers 35 Duas: Dua for Safar, Umrah Checklist, Intention for Ehram, Talbiyah, Entering Masjid al-Haram, First Sight of Kaaba, Duas during Tawaf, At Rukn-e-Yamani, Zamzam Water, Sa'i at Safa & Marwah, Halq/Qasr, Meezab al-Rahmah, Multazim, Tawaf-e-Wida, Entering Madinah, Salaam at Roza-e-Rasool ﷺ, Jannat-ul-Baqi, and returning home.`,
        category: umrahEditionId,
        brand: 'Mishkwat Publications',
        price: 700,
        salePrice: 370,
        stock: 500,
        images: [
          { url: 'https://mishkwat.com/wp-content/uploads/2025/07/UH1-4.png', publicId: 'UH1' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/07/UH2-4.png', publicId: 'UH2' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/07/UH3-3.png', publicId: 'UH3' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/07/UH4-3.png', publicId: 'UH4' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/07/UH5-3.png', publicId: 'UH5' }
        ],
        isFeatured: true,
        totalRatings: 0,
        avgRating: 0
      },

      // ── Mishkwat Hajj Umrah Tasbih ──────────────────────────

      {
        title: 'Mishkwat Hajj Umrah Tasbih Urdu 6 Quantity',
        description: `Mishkwat Hajj & Umrah Tasbih – Urdu Edition. Pack of 6 compact keychain-style Dua Tasbih sets. Includes 30 authentic Duas and a 7-bead Tawaf counter — perfect for gifting pilgrims.

Product Details:
- Language: Arabic with Urdu Translation
- Number of Dua Cards: 18 Cards
- Material: 300 GSM Premium Art Card with Matt Lamination
- Binding: Stainless Steel Ring with Tawaf Tasbih (7 Beads)
- Format: Keychain-style, compact and pocket-friendly
- Pack Quantity: 6 pieces

Covers 30 Duas from starting Safar to Salaam in Madinah. Tawaf Tasbih with 7 beads makes counting rounds easy. Ideal gift for every Haji.`,
        category: tasbihId,
        brand: 'Mishkwat Publications',
        price: 360,
        salePrice: 299,
        stock: 500,
        images: [
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/TU1.jpg', publicId: 'TU1' }
        ],
        isFeatured: false,
        totalRatings: 0,
        avgRating: 0
      },

      {
        title: 'Mishkwat Hajj Umrah Tasbih Hindi 6 Quantity',
        description: `Mishkwat Hajj & Umrah Tasbih – Hindi Edition. Pack of 6 compact keychain-style Dua Tasbih sets. Includes 30 authentic Duas and a 7-bead Tawaf counter — ideal for gifting pilgrims.

Product Details:
- Language: Arabic with Hindi Translation
- Number of Dua Cards: 18 Cards
- Material: 300 GSM Premium Art Card with Matt Lamination
- Binding: Stainless Steel Ring with Tawaf Tasbih (7 Beads)
- Format: Keychain-style, compact and pocket-friendly
- Pack Quantity: 6 pieces

Covers 30 Duas from starting Safar to Salaam in Madinah. Tawaf Tasbih with 7 beads makes counting rounds easy. Ideal gift for every Haji.`,
        category: tasbihId,
        brand: 'Mishkwat Publications',
        price: 360,
        salePrice: 299,
        stock: 500,
        images: [
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/TH1.jpg', publicId: 'TH1' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/TH5.jpg', publicId: 'TH5' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/TH3.jpg', publicId: 'TH3' },
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/TH2.jpg', publicId: 'TH2' }
        ],
        isFeatured: false,
        totalRatings: 0,
        avgRating: 0
      },

      {
        title: 'Mishkwatul Hajj Tasbih (Urdu Script) Set of 10 Tasbih',
        description: `Mishkwatul Hajj Tasbih – Urdu Script Edition. Set of 10 compact Dua Tasbih sets — ideal for bulk gifting or group Hajj travel arrangements.

Product Details:
- Language: Arabic with Urdu Translation
- Number of Dua Cards: 18 Cards per tasbih
- Material: 300 GSM Premium Art Card with Matt Lamination
- Binding: Stainless Steel Ring with Tawaf Tasbih (7 Beads)
- Format: Keychain-style, compact and pocket-friendly
- Pack Quantity: 10 pieces

Covers 30 authentic Duas for the entire pilgrimage. Best suited for Hajj/Umrah travel groups, tour operators, and masjids.`,
        category: tasbihId,
        brand: 'Mishkwat Publications',
        price: 600,
        salePrice: 399,
        stock: 300,
        images: [
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/TU1.jpg', publicId: 'TU1_10' }
        ],
        isFeatured: false,
        totalRatings: 0,
        avgRating: 0
      },

      {
        title: 'Mishkwatul Hajj Tasbih (Hindi Script) Set of 10 Tasbih',
        description: `Mishkwatul Hajj Tasbih – Hindi Script Edition. Set of 10 compact Dua Tasbih sets — ideal for bulk gifting or group Hajj travel arrangements.

Product Details:
- Language: Arabic with Hindi Translation
- Number of Dua Cards: 18 Cards per tasbih
- Material: 300 GSM Premium Art Card with Matt Lamination
- Binding: Stainless Steel Ring with Tawaf Tasbih (7 Beads)
- Format: Keychain-style, compact and pocket-friendly
- Pack Quantity: 10 pieces

Covers 30 authentic Duas for the entire pilgrimage. Best suited for Hajj/Umrah travel groups, tour operators, and masjids.`,
        category: tasbihId,
        brand: 'Mishkwat Publications',
        price: 600,
        salePrice: 399,
        stock: 300,
        images: [
          { url: 'https://mishkwat.com/wp-content/uploads/2025/04/TH1.jpg', publicId: 'TH1_10' }
        ],
        isFeatured: false,
        totalRatings: 0,
        avgRating: 0
      }
    ];

    // 4. Insert new products
    for (const p of products) {
      await Product.create(p);
    }
    console.log(`Inserted ${products.length} Mishkwat products successfully.`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding products:', err);
    process.exit(1);
  }
}

seedProducts();
