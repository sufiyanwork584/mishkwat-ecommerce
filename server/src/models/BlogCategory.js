import mongoose from 'mongoose';
import slugify from 'slugify';

const blogCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Blog category name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  image: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Auto-generate slug before saving
blogCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const BlogCategory = mongoose.model('BlogCategory', blogCategorySchema);
export default BlogCategory;
