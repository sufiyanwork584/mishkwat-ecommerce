import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { uploadMultipleImages, deleteMultipleImages, deleteImage } from '../services/cloudinaryService.js';
import { buildProductFilter, buildProductSort } from '../utils/helpers.js';
import { PAGINATION } from '../utils/constants.js';
import apicache from 'apicache';

/** GET /api/v1/products */
export const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter = buildProductFilter(req.query);

  // If subcategory or category is requested, filter correctly supporting old/new MERN patterns
  if (req.query.subcategory) {
    filter.$or = [
      { category: req.query.subcategory },
      { subcategory: req.query.subcategory }
    ];
    delete filter.category;
    delete filter.subcategory;
  } else if (req.query.category) {
    const cat = await Category.findById(req.query.category).lean();
    if (cat) {
      if (cat.parent) {
        // It's a subcategory! Match either category or subcategory field
        filter.$or = [
          { category: cat._id },
          { subcategory: cat._id }
        ];
        delete filter.category;
        delete filter.subcategory;
      } else {
        // It's a parent category! Match either category or subcategory with parent or any subcategory ID
        const subcategories = await Category.find({ parent: cat._id, isActive: true }).select('_id').lean();
        const categoryIds = [cat._id, ...subcategories.map(sub => sub._id)];
        filter.$or = [
          { category: { $in: categoryIds } },
          { subcategory: { $in: categoryIds } }
        ];
        delete filter.category;
        delete filter.subcategory;
      }
    }
  }
  const sort = buildProductSort(req.query.sort);

  const [products, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').populate('subcategory', 'name slug').sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

/** GET /api/v1/products/:slug */
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug');
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, data: { product } });
});

/** GET /api/v1/products/featured */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name slug').sort({ createdAt: -1 }).limit(12).lean();
  res.json({ success: true, data: { products } });
});

/** GET /api/v1/products/bestsellers */
export const getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .populate('category', 'name slug').sort({ numReviews: -1, avgRating: -1 }).limit(12).lean();
  res.json({ success: true, data: { products } });
});

/** GET /api/v1/products/new-arrivals */
export const getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .populate('category', 'name slug').sort({ createdAt: -1 }).limit(12).lean();
  res.json({ success: true, data: { products } });
});

/** GET /api/v1/products/:id/related */
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  const related = await Product.find({
    category: product.category, _id: { $ne: product._id }, isActive: true,
  }).limit(8).lean();
  res.json({ success: true, data: { products: related } });
});

/** POST /api/v1/products (Admin) */
export const createProduct = asyncHandler(async (req, res) => {
  let images = [];
  if (req.files && req.files.length > 0) {
    images = await uploadMultipleImages(req.files, 'nexabuy/products');
  }
  if (req.body.subcategory === '') req.body.subcategory = null;
  const product = await Product.create({ ...req.body, images });
  apicache.clear();
  res.status(201).json({ success: true, message: 'Product created', data: { product } });
});

/** PUT /api/v1/products/:id (Admin) */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);

  let images = product.images;
  if (req.files && req.files.length > 0) {
    await deleteMultipleImages(product.images.map((img) => img.publicId));
    images = await uploadMultipleImages(req.files, 'nexabuy/products');
  }

  if (req.body.subcategory === '') req.body.subcategory = null;
  const updated = await Product.findByIdAndUpdate(
    req.params.id, { ...req.body, images }, { new: true, runValidators: true }
  );
  apicache.clear();
  res.json({ success: true, message: 'Product updated', data: { product: updated } });
});

/** DELETE /api/v1/products/:id (Admin) */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  await deleteMultipleImages(product.images.map((img) => img.publicId));
  await product.deleteOne();
  apicache.clear();
  res.json({ success: true, message: 'Product deleted' });
});
