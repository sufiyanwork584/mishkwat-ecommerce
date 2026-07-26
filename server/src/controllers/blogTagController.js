import BlogTag from '../models/BlogTag.js';
import BlogTagRelation from '../models/BlogTagRelation.js';
import Blog from '../models/Blog.js';

// @desc    Get all blog tags
// @route   GET /api/v1/blogs/tags
// @access  Public
export const getTags = async (req, res) => {
  try {
    const tags = await BlogTag.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a blog tag
// @route   POST /api/v1/blogs/tags
// @access  Admin
export const createTag = async (req, res) => {
  try {
    const { name } = req.body;

    const tagExists = await BlogTag.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (tagExists) {
      return res.status(400).json({ success: false, message: 'Tag name already exists' });
    }

    const tag = await BlogTag.create({ name });
    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a blog tag
// @route   PUT /api/v1/blogs/tags/:id
// @access  Admin
export const updateTag = async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await BlogTag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }

    if (name && name !== tag.name) {
      const tagExists = await BlogTag.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (tagExists) {
        return res.status(400).json({ success: false, message: 'Tag name already exists' });
      }
      tag.name = name;
      await tag.save();
    }

    res.status(200).json({ success: true, data: tag });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a blog tag
// @route   DELETE /api/v1/blogs/tags/:id
// @access  Admin
export const deleteTag = async (req, res) => {
  try {
    const tagId = req.params.id;

    // Check if tag is assigned to any blog
    const blogRelationsCount = await BlogTagRelation.countDocuments({ tag: tagId });
    if (blogRelationsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete tag. It is assigned to ${blogRelationsCount} blog posts. Remove it from the blogs first.`,
      });
    }

    const tag = await BlogTag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }

    await BlogTag.findByIdAndDelete(tagId);
    
    // Clean up any stray tag references in blogs just in case
    await Blog.updateMany(
      { tags: tagId },
      { $pull: { tags: tagId } }
    );

    res.status(200).json({ success: true, message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
