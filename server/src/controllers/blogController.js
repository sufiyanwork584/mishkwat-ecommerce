import Blog from '../models/Blog.js';
import BlogCategory from '../models/BlogCategory.js';
import BlogTag from '../models/BlogTag.js';
import BlogTagRelation from '../models/BlogTagRelation.js';
import BlogComment from '../models/BlogComment.js';
import BlogView from '../models/BlogView.js';

// @desc    Get all published blogs
// @route   GET /api/v1/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const filter = { isPublished: true, status: 'published' };

    // Filter by Category Slug
    if (req.query.category) {
      const categoryDoc = await BlogCategory.findOne({ slug: req.query.category, isActive: true });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        // If category slug is not found, return empty data
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, pages: 0 },
        });
      }
    }

    // Filter by Tag Slug
    if (req.query.tag) {
      const tagDoc = await BlogTag.findOne({ slug: req.query.tag });
      if (tagDoc) {
        filter.tags = tagDoc._id;
      } else {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, pages: 0 },
        });
      }
    }

    // Filter by Search Query
    if (req.query.search) {
      // Use text index search, or fallback to regex for partial matching
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { excerpt: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOptions = { publishedAt: -1 };
    if (req.query.sort === 'oldest') {
      sortOptions = { publishedAt: 1 };
    } else if (req.query.sort === 'views') {
      sortOptions = { views: -1 };
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'name avatar')
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: blogs,
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

// @desc    Get single blog by slug with views tracking and prev/next links
// @route   GET /api/v1/blogs/:slug
// @access  Public
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true, status: 'published' })
      .populate('author', 'name avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug');

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // IP-based views tracking: check if this IP/user viewed this blog recently (last 2 hours)
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const viewQuery = {
      blog: blog._id,
      ipAddress: clientIp,
      viewedAt: { $gte: twoHoursAgo }
    };
    if (req.user) {
      viewQuery.$or = [
        { ipAddress: clientIp, viewedAt: { $gte: twoHoursAgo } },
        { user: req.user._id, viewedAt: { $gte: twoHoursAgo } }
      ];
    }

    const recentView = await BlogView.findOne(viewQuery);

    if (!recentView) {
      // Log view
      await BlogView.create({
        blog: blog._id,
        ipAddress: clientIp,
        user: req.user ? req.user._id : null,
      });

      // Increment view count
      blog.views += 1;
      await blog.save();
    }

    // Get Previous and Next published blog posts (for navigation links)
    const [previousBlog, nextBlog] = await Promise.all([
      Blog.findOne({ isPublished: true, status: 'published', publishedAt: { $lt: blog.publishedAt } })
        .sort({ publishedAt: -1 })
        .select('title slug')
        .lean(),
      Blog.findOne({ isPublished: true, status: 'published', publishedAt: { $gt: blog.publishedAt } })
        .sort({ publishedAt: 1 })
        .select('title slug')
        .lean()
    ]);

    // Get 3 Related Blog posts (same category OR matching tags, excluding current)
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      isPublished: true,
      status: 'published',
      $or: [
        { category: blog.category?._id },
        { tags: { $in: blog.tags.map(t => t._id) } }
      ]
    })
      .select('title slug excerpt image author category publishedAt readingTime views')
      .populate('author', 'name avatar')
      .populate('category', 'name slug')
      .limit(3)
      .lean();

    res.status(200).json({
      success: true,
      data: blog,
      navigation: {
        previous: previousBlog,
        next: nextBlog
      },
      related: relatedBlogs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a blog post
// @route   POST /api/v1/blogs
// @access  Admin
export const createBlog = async (req, res) => {
  try {
    const blog = await Blog.create({
      ...req.body,
      author: req.user._id,
    });

    // Create BlogTagRelation entries
    if (req.body.tags && Array.isArray(req.body.tags)) {
      const relationPromises = req.body.tags.map((tagId) =>
        BlogTagRelation.create({ blog: blog._id, tag: tagId }).catch(() => null)
      );
      await Promise.all(relationPromises);
    }

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a blog post
// @route   PUT /api/v1/blogs/:id
// @access  Admin
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // Sync BlogTagRelation entries
    if (req.body.tags && Array.isArray(req.body.tags)) {
      // Remove old tags
      await BlogTagRelation.deleteMany({ blog: blog._id });
      // Create new tag relations
      const relationPromises = req.body.tags.map((tagId) =>
        BlogTagRelation.create({ blog: blog._id, tag: tagId }).catch(() => null)
      );
      await Promise.all(relationPromises);
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a blog post (cleans up comments, relations, and views)
// @route   DELETE /api/v1/blogs/:id
// @access  Admin
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // Cascade delete related records
    await Promise.all([
      BlogComment.deleteMany({ blog: blog._id }),
      BlogTagRelation.deleteMany({ blog: blog._id }),
      BlogView.deleteMany({ blog: blog._id }),
      Blog.findByIdAndDelete(req.params.id),
    ]);

    res.status(200).json({ success: true, message: 'Blog post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all blogs (admin - includes unpublished/drafts/archived)
// @route   GET /api/v1/blogs/admin/all
// @access  Admin
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { excerpt: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'name avatar')
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Duplicate a blog post as draft
// @route   POST /api/v1/blogs/:id/duplicate
// @access  Admin
export const duplicateBlog = async (req, res) => {
  try {
    const originalBlog = await Blog.findById(req.params.id);
    if (!originalBlog) {
      return res.status(404).json({ success: false, message: 'Original blog post not found' });
    }

    const duplicatedBlog = await Blog.create({
      title: `${originalBlog.title} Copy`,
      content: originalBlog.content,
      excerpt: originalBlog.excerpt,
      image: originalBlog.image ? { url: originalBlog.image.url, publicId: originalBlog.image.publicId } : undefined,
      author: req.user._id,
      category: originalBlog.category,
      tags: originalBlog.tags,
      status: 'draft',
      isPublished: false,
      publishedAt: null,
      views: 0,
      seoTitle: originalBlog.seoTitle ? `${originalBlog.seoTitle} Copy` : '',
      metaDescription: originalBlog.metaDescription || '',
    });

    // Create BlogTagRelation entries
    if (originalBlog.tags && originalBlog.tags.length > 0) {
      const relationPromises = originalBlog.tags.map((tagId) =>
        BlogTagRelation.create({ blog: duplicatedBlog._id, tag: tagId }).catch(() => null)
      );
      await Promise.all(relationPromises);
    }

    res.status(201).json({ success: true, message: 'Blog duplicated successfully as draft', data: duplicatedBlog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
