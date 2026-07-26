import mongoose from 'mongoose';
import slugify from 'slugify';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
  },
  excerpt: {
    type: String,
    default: '',
    maxlength: [500, 'Excerpt cannot exceed 500 characters'],
  },
  image: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogCategory',
    required: [true, 'Blog category is required'],
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogTag',
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  views: {
    type: Number,
    default: 0,
  },
  readingTime: {
    type: Number,
    default: 0,
  },
  seoTitle: {
    type: String,
    default: '',
    maxlength: [100, 'SEO title cannot exceed 100 characters'],
  },
  metaDescription: {
    type: String,
    default: '',
    maxlength: [200, 'Meta description cannot exceed 200 characters'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Database indexes
blogSchema.index({ category: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ isPublished: 1, publishedAt: -1 });
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

// Auto-generate slug and run sync actions before saving
blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }

  // Set publishedAt and isPublished based on status
  if (this.isModified('status')) {
    this.isPublished = this.status === 'published';
    if (this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date();
    }
  } else if (this.isModified('isPublished')) {
    // Keep isPublished and status synchronized
    this.status = this.isPublished ? 'published' : 'draft';
    if (this.isPublished && !this.publishedAt) {
      this.publishedAt = new Date();
    }
  }

  next();
});

// Auto-generate excerpt from content if not provided
blogSchema.pre('save', function (next) {
  if (!this.excerpt && this.content) {
    // Strip HTML tags and slice
    this.excerpt = this.content
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 200) + '...';
  }
  next();
});

// Calculate reading time before saving
blogSchema.pre('save', function (next) {
  if (this.content) {
    const wordsPerMinute = 200;
    const cleanText = this.content.replace(/<[^>]*>/g, '');
    const wordCount = cleanText.split(/\s+/).filter(w => w.trim().length > 0).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute) || 1;
  } else {
    this.readingTime = 0;
  }
  next();
});

// Virtual populate comments
blogSchema.virtual('comments', {
  ref: 'BlogComment',
  localField: '_id',
  foreignField: 'blog',
  justOne: false,
});

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
