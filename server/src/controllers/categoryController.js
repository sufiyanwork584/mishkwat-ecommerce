import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { uploadImage, deleteImage } from '../services/cloudinaryService.js';

// PUBLIC: Returns only top-level (parent) categories with their subcategories populated
export const getCategories = asyncHandler(async (req, res) => {
  let categories = await Category.find({ parent: null, isActive: true })
    .populate({ path: 'subcategories', match: { isActive: true }, options: { sort: { name: 1 } } })
    .sort({ name: 1 })
    .lean({ virtuals: true });

  categories = await Promise.all(categories.map(async (cat) => {
    const subIds = (cat.subcategories || []).map(s => s._id);
    const count = await Product.countDocuments({ 
      category: { $in: [cat._id, ...subIds] }, 
      isActive: true 
    });
    return { ...cat, productCount: count };
  }));

  res.json({ success: true, data: { categories } });
});

// PUBLIC: Get single category by slug
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug })
    .populate({ path: 'subcategories', match: { isActive: true } });
  if (!category) throw new AppError('Category not found', 404);
  res.json({ success: true, data: { category } });
});

// ADMIN: Returns ALL categories structured as a tree (parents with nested subs)
export const getAdminCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ parent: null })
    .populate({ path: 'subcategories', options: { sort: { name: 1 } } })
    .sort({ name: 1 })
    .lean({ virtuals: true });

  res.json({ success: true, data: { categories } });
});

// ADMIN: Returns every category as a flat list (for dropdowns)
export const getAllCategoriesFlat = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('parent', 'name')
    .sort({ name: 1 })
    .lean();
  res.json({ success: true, data: { categories } });
});

// Helper to normalize the parent field from form data
const normalizeParent = (body) => {
  if (body.parent === 'null' || body.parent === '' || body.parent === undefined) {
    body.parent = null;
  }
};

export const createCategory = asyncHandler(async (req, res) => {
  normalizeParent(req.body);
  let image = { url: '', publicId: '' };
  if (req.file) image = await uploadImage(req.file.buffer, 'nexabuy/categories');
  const category = await Category.create({ ...req.body, image });
  res.status(201).json({ success: true, message: 'Category created', data: { category } });
});

export const updateCategory = asyncHandler(async (req, res) => {
  normalizeParent(req.body);
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);

  // Prevent setting a category as its own parent or creating circular loops
  if (req.body.parent) {
    if (req.body.parent === req.params.id) {
      throw new AppError('A category cannot be its own parent', 400);
    }
    let currentParentId = req.body.parent;
    while (currentParentId) {
      if (currentParentId.toString() === req.params.id) {
        throw new AppError('Setting this parent would create a circular reference loop!', 400);
      }
      const parentCat = await Category.findById(currentParentId).lean();
      currentParentId = parentCat ? parentCat.parent : null;
    }
  }

  let image = category.image;
  if (req.file) {
    if (image.publicId) await deleteImage(image.publicId);
    image = await uploadImage(req.file.buffer, 'nexabuy/categories');
  }

  // Use save() instead of findByIdAndUpdate so pre-save hook runs (slug regeneration)
  category.name = req.body.name || category.name;
  category.description = req.body.description !== undefined ? req.body.description : category.description;
  category.parent = req.body.parent; // null or ObjectId
  category.image = image;
  if (req.body.isActive !== undefined) category.isActive = req.body.isActive;

  // If this category is being made a parent (parent=null), ensure none of its
  // current children point to it as parent AND it doesn't point to itself
  // (the self-parent check is above)

  await category.save();
  res.json({ success: true, message: 'Category updated', data: { category } });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  
  // Also unparent any subcategories of this category
  await Category.updateMany({ parent: category._id }, { parent: null });
  
  if (category.image.publicId) await deleteImage(category.image.publicId);
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});
