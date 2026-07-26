import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Product from './src/models/Product.js';
import Category from './src/models/Category.js';
import User from './src/models/User.js';
import Blog from './src/models/Blog.js';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set in .env file');
  process.exit(1);
}

// ── Categories ──
const categoriesData = [
  { name: 'Hajj Essentials', slug: 'hajj-essentials', description: 'Ihram, towels, and basic necessities for Hajj and Umrah.' },
  { name: 'Umrah Kits', slug: 'umrah-kits', description: 'Complete Umrah packages with essentials bundled together.' },
  { name: 'Ihram', slug: 'ihram', description: 'Premium cotton and microfiber Ihram sets for men.' },
  { name: 'Prayer Mats', slug: 'prayer-mats', description: 'Premium prayer mats and travel janamaz.' },
  { name: 'Tasbeeh & Counters', slug: 'tasbeeh-counters', description: 'Digital and traditional tasbeeh beads and counters.' },
  { name: 'Oud & Attar', slug: 'oud-attar', description: 'Alcohol-free attar, premium oud, and bakhoor.' },
  { name: 'Islamic Books', slug: 'islamic-books', description: 'Quran, Hadith collections, and Islamic literature.' },
  { name: 'Hajj Guides', slug: 'hajj-guides', description: 'Books, pocket guides, and dua cards for pilgrims.' },
  { name: 'Islamic Attire', slug: 'islamic-attire', description: 'Abayas, Thobes, and modest clothing.' },
  { name: 'Topi & Caps', slug: 'topi-caps', description: 'Prayer caps, kufis, and Sunnah headwear.' },
  { name: 'Miswak & Sunnah', slug: 'miswak-sunnah', description: 'Natural Miswak, Ajwa dates, and Sunnah items.' },
  { name: 'Travel Accessories', slug: 'travel-accessories', description: 'Hajj belts, waist pouches, and travel organizers.' },
  { name: 'Zamzam Bottles', slug: 'zamzam-bottles', description: 'Premium Zamzam water bottles and containers.' },
  { name: 'Islamic Home Decor', slug: 'islamic-home-decor', description: 'Calligraphy frames, wall art, and Islamic decor.' },
  { name: 'Quran Holders', slug: 'quran-holders', description: 'Wooden and decorative Quran stands (Rehal).' },
  { name: 'Islamic Gifts', slug: 'islamic-gifts', description: 'Curated Islamic gift sets for all occasions.' },
  { name: 'Kids Islamic', slug: 'kids-islamic', description: 'Islamic toys, books, and learning materials for children.' },
  { name: 'Abaya Collection', slug: 'abaya-collection', description: 'Elegant modest abayas for women.' },
  { name: 'Hijab & Scarves', slug: 'hijab-scarves', description: 'Premium hijabs, scarves, and pins.' },
  { name: 'Bakhoor & Incense', slug: 'bakhoor-incense', description: 'Traditional Arabian bakhoor and incense burners.' },
  { name: 'Dates & Dry Fruits', slug: 'dates-dry-fruits', description: 'Ajwa dates, Medjool dates, and premium dry fruits.' },
  { name: 'Islamic Jewelry', slug: 'islamic-jewelry', description: 'Rings, bracelets, and necklaces with Islamic motifs.' },
  { name: 'Mosque Essentials', slug: 'mosque-essentials', description: 'Mosque supplies, prayer rugs, and community items.' },
  { name: 'Ramadan Specials', slug: 'ramadan-specials', description: 'Iftar essentials, Ramadan decor, and special bundles.' },
];

// ── Products ──
const getProducts = (getCatId) => [
  {
    title: 'Mishkwat Hajj & Umrah Guide Lanyard Set',
    description: "Premium pocket-sized flashcard guide attached to a high-quality Mishkwat lanyard. Includes authentic Duas, step-by-step instructions for Tawaf, Sa'ee, and Ziyarat, printed in clear Arabic script with transliteration and translation.",
    category: getCatId('hajj-guides'),
    brand: 'Mishkwat',
    price: 499, salePrice: 399, stock: 500,
    images: [{ url: 'https://placehold.co/600x600/1C1C1C/B8860B?text=Hajj+Guide+Lanyard', publicId: 'mkw_hajj_guide_1' }],
    isFeatured: true, isHajjKit: true, avgRating: 4.9, numReviews: 120,
    tags: ['hajj', 'umrah', 'guide', 'lanyard', 'dua'],
  },
  {
    title: 'Premium Egyptian Cotton Ihram Set',
    description: 'Two pieces of thick, highly absorbent, and soft Egyptian cotton Ihram towels for men. Ensures maximum comfort during Hajj and Umrah.',
    category: getCatId('ihram'),
    brand: 'Mishkwat Essentials',
    price: 1599, salePrice: 1299, stock: 250,
    images: [{ url: 'https://placehold.co/600x600/F8F5F0/1C1C1C?text=Premium+Ihram', publicId: 'mkw_ihram_1' }],
    isFeatured: true, isHajjKit: true, avgRating: 4.8, numReviews: 85,
    tags: ['ihram', 'hajj', 'cotton', 'men'],
  },
  {
    title: 'Natural Peelu Miswak — Vacuum Sealed (Pack of 5)',
    description: 'Fresh, hand-picked natural Peelu Miswak for Sunnah oral hygiene. Vacuum sealed to retain moisture and freshness.',
    category: getCatId('miswak-sunnah'),
    brand: 'Sunnah Roots',
    price: 299, salePrice: 199, stock: 1000,
    images: [{ url: 'https://placehold.co/600x600/14532D/FFFFFF?text=Natural+Miswak', publicId: 'mkw_miswak_1' }],
    isFeatured: true, isHalal: true, avgRating: 4.7, numReviews: 320,
    tags: ['miswak', 'sunnah', 'oral-care', 'natural'],
  },
  {
    title: 'Classic Emirati Style Thobe (White)',
    description: 'Elegant, lightweight, and breathable classic Emirati style Thobe. Perfect for prayers, Jummah, and daily wear.',
    category: getCatId('islamic-attire'),
    brand: 'Al-Haramain',
    price: 2499, salePrice: 1999, stock: 150,
    images: [{ url: 'https://placehold.co/600x600/F8F5F0/1C1C1C?text=Emirati+Thobe', publicId: 'mkw_thobe_1' }],
    isFeatured: true, avgRating: 4.6, numReviews: 45,
    tags: ['thobe', 'islamic-attire', 'men', 'emirati'],
  },
  {
    title: 'Luxury Turkish Velvet Prayer Mat',
    description: 'Thick, comfortable, and beautifully designed Turkish velvet Janamaz. Provides excellent cushioning for knees during Sujood.',
    category: getCatId('prayer-mats'),
    brand: 'Istanbul Weavers',
    price: 1299, salePrice: 999, stock: 300,
    images: [{ url: 'https://placehold.co/600x600/1C1C1C/B8860B?text=Velvet+Prayer+Mat', publicId: 'mkw_mat_1' }],
    isFeatured: true, avgRating: 4.9, numReviews: 210,
    tags: ['prayer-mat', 'turkish', 'velvet', 'janamaz'],
  },
  {
    title: 'Royal Oud Premium Attar (12ml)',
    description: '100% alcohol-free, long-lasting premium Royal Oud attar. A deep, woody, and classic oriental fragrance.',
    category: getCatId('oud-attar'),
    brand: 'Oud Al-Malik',
    price: 899, salePrice: 799, stock: 200,
    images: [{ url: 'https://placehold.co/600x600/451a03/B8860B?text=Royal+Oud+Attar', publicId: 'mkw_oud_1' }],
    isFeatured: true, isHalal: true, avgRating: 4.8, numReviews: 175,
    tags: ['attar', 'oud', 'perfume', 'alcohol-free'],
  },
  {
    title: 'Digital Tasbeeh Counter — LED Display',
    description: 'Ergonomic finger-held digital tasbeeh counter with LED display, auto-save, and reset. Perfect for dhikr during Hajj and daily worship.',
    category: getCatId('tasbeeh-counters'),
    brand: 'Mishkwat',
    price: 199, salePrice: 149, stock: 800,
    images: [{ url: 'https://placehold.co/600x600/1C1C1C/14532D?text=Digital+Tasbeeh', publicId: 'mkw_tasbeeh_1' }],
    isFeatured: true, avgRating: 4.5, numReviews: 290,
    tags: ['tasbeeh', 'counter', 'digital', 'dhikr'],
  },
  {
    title: 'Complete Hajj Kit for Men (12 Items)',
    description: 'All-in-one Hajj kit including Ihram set, belt pouch, Miswak, prayer mat, dua book, unscented soap, nail clipper, travel Quran, Zamzam bottle, socks, and tasbeeh.',
    category: getCatId('hajj-essentials'),
    brand: 'Mishkwat',
    price: 3999, salePrice: 2999, stock: 100,
    images: [{ url: 'https://placehold.co/600x600/B8860B/FFFFFF?text=Complete+Hajj+Kit', publicId: 'mkw_hajjkit_1' }],
    isFeatured: true, isHajjKit: true, avgRating: 4.9, numReviews: 56,
    tags: ['hajj', 'kit', 'complete', 'men', 'essentials'],
  },
  {
    title: 'Premium Ajwa Dates — Madinah Origin (500g)',
    description: 'Authentic Ajwa dates sourced directly from Madinah Al-Munawwarah. Known for their rich taste and health benefits mentioned in Hadith.',
    category: getCatId('dates-dry-fruits'),
    brand: 'Al-Madinah Farms',
    price: 1499, salePrice: 1199, stock: 350,
    images: [{ url: 'https://placehold.co/600x600/1C1C1C/B8860B?text=Ajwa+Dates', publicId: 'mkw_ajwa_1' }],
    isFeatured: true, isHalal: true, avgRating: 4.8, numReviews: 410,
    tags: ['ajwa', 'dates', 'madinah', 'halal'],
  },
  {
    title: 'Hand-Carved Wooden Quran Stand (Rehal)',
    description: 'Beautifully hand-carved wooden Quran stand with intricate Islamic geometric patterns. Foldable and portable.',
    category: getCatId('quran-holders'),
    brand: 'Mishkwat Home',
    price: 1799, salePrice: 1499, stock: 120,
    images: [{ url: 'https://placehold.co/600x600/F8F5F0/1C1C1C?text=Quran+Stand', publicId: 'mkw_rehal_1' }],
    isFeatured: false, avgRating: 4.7, numReviews: 68,
    tags: ['quran', 'holder', 'stand', 'rehal', 'wood'],
  },
  {
    title: 'Elegant Chiffon Hijab — Dusty Rose',
    description: 'Soft, lightweight, and non-slip chiffon hijab in a sophisticated dusty rose shade. Generous size for full coverage and elegant draping.',
    category: getCatId('hijab-scarves'),
    brand: 'Modesta',
    price: 599, salePrice: 449, stock: 500,
    images: [{ url: 'https://placehold.co/600x600/F8F5F0/B8860B?text=Chiffon+Hijab', publicId: 'mkw_hijab_1' }],
    isFeatured: true, avgRating: 4.6, numReviews: 190,
    tags: ['hijab', 'chiffon', 'women', 'scarf'],
  },
  {
    title: 'Arabian Bakhoor Incense — Oud Blend (12 pieces)',
    description: 'Premium Arabian bakhoor tablets with a rich oud-musk blend. Burns slowly, filling your home with a traditional, calming fragrance.',
    category: getCatId('bakhoor-incense'),
    brand: 'Dar Al-Oud',
    price: 399, salePrice: 299, stock: 400,
    images: [{ url: 'https://placehold.co/600x600/451a03/F8F5F0?text=Bakhoor+Oud', publicId: 'mkw_bakhoor_1' }],
    isFeatured: false, isHalal: true, avgRating: 4.7, numReviews: 135,
    tags: ['bakhoor', 'incense', 'oud', 'arabian'],
  },
  {
    title: 'Kids My First Quran Stories (Illustrated)',
    description: 'Beautifully illustrated hardcover Quran stories book for children aged 3-8. Features 20 stories with moral lessons and vibrant artwork.',
    category: getCatId('kids-islamic'),
    brand: 'Goodword Books',
    price: 699, salePrice: 549, stock: 300,
    images: [{ url: 'https://placehold.co/600x600/14532D/FFFFFF?text=Kids+Quran+Stories', publicId: 'mkw_kids_1' }],
    isFeatured: false, avgRating: 4.9, numReviews: 225,
    tags: ['kids', 'quran', 'stories', 'illustrated', 'children'],
  },
  {
    title: 'Hajj & Umrah Waist Belt Pouch — Anti-Theft',
    description: 'Slim, water-resistant anti-theft waist pouch designed for pilgrims. Fits passport, phone, cash, and cards securely under Ihram.',
    category: getCatId('travel-accessories'),
    brand: 'Mishkwat Travel',
    price: 599, salePrice: 449, stock: 600,
    images: [{ url: 'https://placehold.co/600x600/1C1C1C/B8860B?text=Belt+Pouch', publicId: 'mkw_belt_1' }],
    isFeatured: true, isHajjKit: true, avgRating: 4.6, numReviews: 340,
    tags: ['belt', 'pouch', 'travel', 'hajj', 'anti-theft'],
  },
  {
    title: 'Islamic Calligraphy Canvas — Ayatul Kursi (Gold)',
    description: 'Large premium canvas print of Ayatul Kursi in stunning gold calligraphy on black background. Gallery-wrapped, ready to hang.',
    category: getCatId('islamic-home-decor'),
    brand: 'Mishkwat Home',
    price: 2499, salePrice: 1999, stock: 80,
    images: [{ url: 'https://placehold.co/600x600/1C1C1C/B8860B?text=Ayatul+Kursi+Canvas', publicId: 'mkw_canvas_1' }],
    isFeatured: true, avgRating: 4.8, numReviews: 92,
    tags: ['calligraphy', 'canvas', 'ayatul-kursi', 'home-decor', 'gold'],
  },
  {
    title: 'Premium Zamzam Water Bottle (5L)',
    description: 'Food-grade BPA-free bottle designed for carrying Zamzam water. Leak-proof seal with carry handle. TSA-friendly for air travel.',
    category: getCatId('zamzam-bottles'),
    brand: 'Mishkwat Travel',
    price: 399, salePrice: 349, stock: 450,
    images: [{ url: 'https://placehold.co/600x600/14532D/FFFFFF?text=Zamzam+Bottle', publicId: 'mkw_zamzam_1' }],
    isFeatured: false, avgRating: 4.5, numReviews: 156,
    tags: ['zamzam', 'bottle', 'travel', 'water'],
  },
  {
    title: 'Embroidered White Prayer Cap (Kufi)',
    description: 'Hand-embroidered pure cotton kufi with elegant geometric patterns. Comfortable, breathable, and fits all head sizes.',
    category: getCatId('topi-caps'),
    brand: 'Sunnah Wear',
    price: 349, salePrice: 279, stock: 700,
    images: [{ url: 'https://placehold.co/600x600/F8F5F0/1C1C1C?text=Prayer+Cap+Kufi', publicId: 'mkw_kufi_1' }],
    isFeatured: false, avgRating: 4.4, numReviews: 178,
    tags: ['kufi', 'cap', 'topi', 'prayer', 'embroidered'],
  },
  {
    title: 'The Sealed Nectar — Seerah of Prophet Muhammad ﷺ',
    description: 'Award-winning biography of the Prophet Muhammad ﷺ by Safiur Rahman Mubarakpuri. English translation, hardcover edition.',
    category: getCatId('islamic-books'),
    brand: 'Darussalam',
    price: 899, salePrice: 749, stock: 200,
    images: [{ url: 'https://placehold.co/600x600/1C1C1C/B8860B?text=Sealed+Nectar', publicId: 'mkw_book_1' }],
    isFeatured: true, avgRating: 4.9, numReviews: 560,
    tags: ['book', 'seerah', 'prophet', 'sealed-nectar', 'biography'],
  },
  {
    title: 'Umrah Essentials Kit for Women (8 Items)',
    description: 'Complete Umrah kit for women including abaya, hijab, prayer mat, dua book, tasbeeh, miswak, unscented soap, and travel pouch.',
    category: getCatId('umrah-kits'),
    brand: 'Mishkwat',
    price: 3499, salePrice: 2799, stock: 120,
    images: [{ url: 'https://placehold.co/600x600/B8860B/1C1C1C?text=Umrah+Kit+Women', publicId: 'mkw_umrah_women_1' }],
    isFeatured: true, isHajjKit: true, avgRating: 4.8, numReviews: 34,
    tags: ['umrah', 'kit', 'women', 'essentials'],
  },
  {
    title: 'Islamic Gift Set — Premium Box (Attar + Tasbeeh + Miswak)',
    description: 'Elegant gift box containing Royal Oud attar (6ml), crystal tasbeeh beads (99), and vacuum-sealed Miswak. Perfect for Eid and wedding gifts.',
    category: getCatId('islamic-gifts'),
    brand: 'Mishkwat',
    price: 1299, salePrice: 999, stock: 250,
    images: [{ url: 'https://placehold.co/600x600/1C1C1C/B8860B?text=Islamic+Gift+Set', publicId: 'mkw_gift_1' }],
    isFeatured: true, isHalal: true, avgRating: 4.7, numReviews: 88,
    tags: ['gift', 'set', 'eid', 'attar', 'tasbeeh', 'miswak'],
  },
  {
    title: 'Elegant Black Abaya — Dubai Cut',
    description: 'Premium black crepe abaya with subtle embroidery on sleeves and hem. Dubai-cut style for a modern, flowing silhouette.',
    category: getCatId('abaya-collection'),
    brand: 'Modesta',
    price: 3499, salePrice: 2899, stock: 100,
    images: [{ url: 'https://placehold.co/600x600/1C1C1C/F8F5F0?text=Black+Abaya', publicId: 'mkw_abaya_1' }],
    isFeatured: true, avgRating: 4.7, numReviews: 67,
    tags: ['abaya', 'women', 'dubai', 'modest', 'black'],
  },
  {
    title: 'Mosque Prayer Rug — Large (120cm x 70cm)',
    description: 'Durable, machine-washable mosque prayer rug in classic green with gold borders. Ideal for masjid use or large prayer areas.',
    category: getCatId('mosque-essentials'),
    brand: 'Istanbul Weavers',
    price: 799, salePrice: 649, stock: 500,
    images: [{ url: 'https://placehold.co/600x600/14532D/B8860B?text=Mosque+Prayer+Rug', publicId: 'mkw_mosque_rug_1' }],
    isFeatured: false, avgRating: 4.5, numReviews: 112,
    tags: ['mosque', 'prayer-rug', 'large', 'masjid'],
  },
  {
    title: 'Sterling Silver Ayatul Kursi Ring — Men',
    description: 'Handcrafted 925 sterling silver ring with Ayatul Kursi engraved in Arabic. A meaningful and elegant accessory.',
    category: getCatId('islamic-jewelry'),
    brand: 'Mishkwat Silver',
    price: 1999, salePrice: 1699, stock: 75,
    images: [{ url: 'https://placehold.co/600x600/F8F5F0/1C1C1C?text=Ayatul+Kursi+Ring', publicId: 'mkw_ring_1' }],
    isFeatured: false, avgRating: 4.6, numReviews: 42,
    tags: ['ring', 'silver', 'ayatul-kursi', 'jewelry', 'men'],
  },
  {
    title: 'Ramadan Iftar Gift Box — Premium Dates & Sweets',
    description: 'Curated Ramadan gift box with Ajwa dates, baklava assortment, Turkish delight, and premium honey. Beautifully packaged.',
    category: getCatId('ramadan-specials'),
    brand: 'Mishkwat',
    price: 1999, salePrice: 1599, stock: 200,
    images: [{ url: 'https://placehold.co/600x600/B8860B/1C1C1C?text=Ramadan+Gift+Box', publicId: 'mkw_ramadan_1' }],
    isFeatured: true, isHalal: true, avgRating: 4.8, numReviews: 73,
    tags: ['ramadan', 'iftar', 'gift', 'dates', 'sweets'],
  },
];

// ── Sample Blog Posts ──
const blogPosts = [
  {
    title: 'The Complete Step-by-Step Guide to Hajj',
    content: '<p>Hajj is the fifth pillar of Islam, an obligation upon every able Muslim. This comprehensive guide covers each step from Ihram to the final Tawaf Al-Wida...</p><p>We break down the rituals day by day, including the essential duas, common mistakes to avoid, and tips for a spiritually enriching journey.</p>',
    excerpt: 'A comprehensive day-by-day guide to performing Hajj, with essential duas, tips, and common mistakes to avoid.',
    category: 'hajj-guide',
    tags: ['hajj', 'pilgrimage', 'guide', 'rituals'],
    isPublished: true,
    publishedAt: new Date('2024-06-01'),
    views: 12500,
  },
  {
    title: 'Umrah Packing Checklist: Everything You Need',
    content: '<p>Planning for Umrah? A well-organized packing list can make your journey smoother and more comfortable...</p><p>From Ihram towels to travel-sized toiletries, from important documents to spiritual items, this checklist covers everything.</p>',
    excerpt: 'The ultimate Umrah packing checklist to ensure you have everything for a comfortable and spiritually fulfilling journey.',
    category: 'umrah-guide',
    tags: ['umrah', 'packing', 'checklist', 'travel'],
    isPublished: true,
    publishedAt: new Date('2024-05-15'),
    views: 8300,
  },
  {
    title: 'The Spiritual Significance of Zamzam Water',
    content: '<p>Zamzam water holds a special place in Islamic history and spirituality. Originating from the well of Zamzam in Mecca...</p><p>Learn about the miraculous story of its origin, its unique mineral composition, and the Sunnah of drinking it.</p>',
    excerpt: 'Discover the miraculous history, spiritual significance, and health benefits of Zamzam water from the holy well in Mecca.',
    category: 'islamic-lifestyle',
    tags: ['zamzam', 'water', 'mecca', 'spirituality'],
    isPublished: true,
    publishedAt: new Date('2024-04-20'),
    views: 6700,
  },
];

async function seedDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Seed Categories ──
    console.log('\n📂 Seeding categories...');
    await Category.deleteMany({});
    const insertedCategories = await Category.insertMany(categoriesData);
    console.log(`   ✅ Inserted ${insertedCategories.length} categories`);

    // Build lookup helper
    const getCatId = (slug) => {
      const cat = insertedCategories.find(c => c.slug === slug);
      return cat ? cat._id : insertedCategories[0]._id;
    };

    // ── Seed Products ──
    console.log('\n📦 Seeding products...');
    await Product.deleteMany({});
    const productsData = getProducts(getCatId);
    for (const p of productsData) {
      await Product.create(p);
    }
    console.log(`   ✅ Inserted ${productsData.length} products`);

    // ── Seed Admin User ──
    console.log('\n👤 Seeding admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mishkwat.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'Mishkwat Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        authProvider: 'local',
      });
      console.log(`   ✅ Admin user created: ${adminEmail}`);
    } else {
      console.log(`   ℹ️  Admin user already exists: ${adminEmail}`);
    }

    // ── Seed Blog Posts ──
    console.log('\n📝 Seeding blog posts...');
    await Blog.deleteMany({});
    // Find admin to set as author
    const admin = await User.findOne({ role: 'admin' });
    for (const post of blogPosts) {
      await Blog.create({ ...post, author: admin._id });
    }
    console.log(`   ✅ Inserted ${blogPosts.length} blog posts`);

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();
