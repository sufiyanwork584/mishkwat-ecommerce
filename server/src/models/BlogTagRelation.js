import mongoose from 'mongoose';

const blogTagRelationSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogTag',
    required: true,
  },
}, {
  timestamps: true,
});

// Compound unique index to prevent duplicate tag-to-blog mappings
blogTagRelationSchema.index({ blog: 1, tag: 1 }, { unique: true });
blogTagRelationSchema.index({ tag: 1 }); // Performance optimization for filtering blogs by tag

const BlogTagRelation = mongoose.model('BlogTagRelation', blogTagRelationSchema);
export default BlogTagRelation;
