import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required'],
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
  },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive'],
  },
  salePrice: {
    type: Number,
    default: 0,
    min: [0, 'Sale price must be positive'],
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  avgRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  specifications: [{
    key: { type: String, required: true },
    value: { type: String, required: true },
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  // ── Mishkwat Islamic Fields ──
  arabicName: {
    type: String,
    default: '',
    trim: true,
  },
  isHajjKit: {
    type: Boolean,
    default: false,
  },
  isHalal: {
    type: Boolean,
    default: false,
  },
  weight: {
    type: Number,
    default: 0,
    min: 0,
  },
  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Database Indexes for fast queries
// Note: slug already has unique: true in the schema, which auto-creates its index
productSchema.index({ category: 1, isActive: 1, price: 1 });
productSchema.index({ subcategory: 1, isActive: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ avgRating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, isActive: 1, createdAt: -1 });
productSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });

// Virtual for discount percentage
productSchema.virtual('discountPercent').get(function () {
  if (this.salePrice && this.salePrice < this.price) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

// Virtual for effective price
productSchema.virtual('effectivePrice').get(function () {
  return this.salePrice && this.salePrice < this.price ? this.salePrice : this.price;
});

// Virtual for in-stock status
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Auto-generate slug before saving
productSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  next();
});

// Virtual populate reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
});

const Product = mongoose.model('Product', productSchema);
export default Product;
