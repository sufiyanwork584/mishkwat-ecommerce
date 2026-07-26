import mongoose from 'mongoose';

const blogViewSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for counting metrics over time
blogViewSchema.index({ blog: 1 });
blogViewSchema.index({ blog: 1, ipAddress: 1, viewedAt: -1 });
blogViewSchema.index({ blog: 1, user: 1, viewedAt: -1 });

const BlogView = mongoose.model('BlogView', blogViewSchema);
export default BlogView;
