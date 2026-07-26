import mongoose from 'mongoose';
import slugify from 'slugify';

const blogTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Blog tag name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Tag name cannot exceed 50 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Auto-generate slug before saving
blogTagSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const BlogTag = mongoose.model('BlogTag', blogTagSchema);
export default BlogTag;
