import BlogComment from '../models/BlogComment.js';
import Blog from '../models/Blog.js';

// @desc    Get approved comments for a specific blog post
// @route   GET /api/v1/blogs/:id/comments
// @access  Public
export const getBlogComments = async (req, res) => {
  try {
    const comments = await BlogComment.find({ blog: req.params.id, status: 'approved' })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a comment on a blog post
// @route   POST /api/v1/blogs/:id/comments
// @access  Private (Authenticated Users)
export const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const blogId = req.params.id;

    // Verify blog exists and is published
    const blog = await Blog.findOne({ _id: blogId, isPublished: true });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found or unpublished' });
    }

    const comment = await BlogComment.create({
      blog: blogId,
      user: req.user._id,
      content,
      status: 'pending', // Requires admin moderation
    });

    // Populate user info for returning the object
    const populatedComment = await BlogComment.findById(comment._id).populate('user', 'name avatar');

    res.status(201).json({ success: true, message: 'Comment submitted successfully, awaiting moderation', data: populatedComment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all comments for administrative dashboard moderation
// @route   GET /api/v1/blogs/comments/admin
// @access  Admin
export const getAllCommentsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [comments, total] = await Promise.all([
      BlogComment.find(filter)
        .populate('user', 'name email avatar')
        .populate('blog', 'title slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogComment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Moderate comment status (approve, reject, spam)
// @route   PATCH /api/v1/blogs/comments/:id/moderate
// @access  Admin
export const moderateComment = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'spam', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status type' });
    }

    const comment = await BlogComment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    comment.status = status;
    await comment.save();

    res.status(200).json({ success: true, message: `Comment status updated to ${status}`, data: comment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/v1/blogs/comments/:id
// @access  Admin
export const deleteComment = async (req, res) => {
  try {
    const comment = await BlogComment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    await BlogComment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
