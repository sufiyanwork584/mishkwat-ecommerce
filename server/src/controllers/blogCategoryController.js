import BlogCategory from '../models/BlogCategory.js';
import Blog from '../models/Blog.js';
import { uploadImage, deleteImage } from '../services/cloudinaryService.js';

// @desc    Get active blog categories
// @route   GET /api/v1/blogs/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all blog categories (admin - includes inactive)
// @route   GET /api/v1/blogs/categories/admin
// @access  Admin
export const getAdminCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a blog category
// @route   POST /api/v1/blogs/categories
// @access  Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    // Check if category name already exists
    const categoryExists = await BlogCategory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category name already exists' });
    }

    let image = { url: '', publicId: '' };
    if (req.file) {
      const result = await uploadImage(req.file.buffer, 'nexabuy/blog-categories');
      image = { url: result.url, publicId: result.publicId };
    }

    const category = await BlogCategory.create({
      name,
      description,
      isActive: isActive !== undefined ? isActive : true,
      image,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a blog category
// @route   PUT /api/v1/blogs/categories/:id
// @access  Admin
export const updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const category = await BlogCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check name duplicate if name is changing
    if (name && name !== category.name) {
      const categoryExists = await BlogCategory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (categoryExists) {
        return res.status(400).json({ success: false, message: 'Category name already exists' });
      }
      category.name = name;
    }

    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    if (req.file) {
      // Delete old image if it exists
      if (category.image && category.image.publicId) {
        try {
          await deleteImage(category.image.publicId);
        } catch (err) {
          // Log and continue if image delete fails
          console.error('Failed to delete old image from Cloudinary:', err);
        }
      }

      // Upload new image
      const result = await uploadImage(req.file.buffer, 'nexabuy/blog-categories');
      category.image = { url: result.url, publicId: result.publicId };
    }

    await category.save();
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a blog category
// @route   DELETE /api/v1/blogs/categories/:id
// @access  Admin
export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Critical constraint: Prevent deleting categories currently assigned to blogs
    const blogsCount = await Blog.countDocuments({ category: categoryId });
    if (blogsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It is currently assigned to ${blogsCount} blog post(s).`,
      });
    }

    const category = await BlogCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Delete image from Cloudinary
    if (category.image && category.image.publicId) {
      try {
        await deleteImage(category.image.publicId);
      } catch (err) {
        console.error('Failed to delete image from Cloudinary:', err);
      }
    }

    await BlogCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Blog category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
