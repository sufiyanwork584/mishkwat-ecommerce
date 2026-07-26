import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { productApi } from '../../api/productApi';
import { adminApi } from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiImage } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const formatPrice = (amount) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const AdminProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCategory = searchParams.get('category') || '';
  const querySubcategory = searchParams.get('subcategory') || '';
  const queryAction = searchParams.get('action') || '';

  // Reset pagination when filters change
  React.useEffect(() => {
    setPage(1);
  }, [queryCategory, querySubcategory]);
  const [prefilledCategory, setPrefilledCategory] = useState('');
  const [prefilledSubcategory, setPrefilledSubcategory] = useState('');

  useEffect(() => {
    if (queryAction === 'add') {
      setPrefilledCategory(queryCategory);
      setPrefilledSubcategory(querySubcategory);
      setIsModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [queryAction, queryCategory, querySubcategory, setSearchParams]);

  const { data: categoriesData } = useQuery({
    queryKey: ['adminCategoriesWithSubs'],
    queryFn: adminApi.getCategoriesWithSubs,
  });

  const categories = categoriesData?.data?.categories || [];

  const activeCategory = categories.find(cat => cat._id === queryCategory);
  const activeSubcategory = activeCategory?.subcategories?.find(sub => sub._id === querySubcategory) ||
                            categories.flatMap(c => c.subcategories || []).find(sub => sub._id === querySubcategory);

  const { data, isLoading } = useQuery({
    queryKey: ['adminProducts', page, searchTerm, queryCategory, querySubcategory],
    queryFn: () => productApi.getProducts({ 
      page, 
      limit: 10, 
      search: searchTerm,
      ...(queryCategory && { category: queryCategory }),
      ...(querySubcategory && { subcategory: querySubcategory })
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const openModal = (product = null) => {
    setEditingProduct(product);
    if (!product) {
      setPrefilledCategory('');
      setPrefilledSubcategory('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {(queryCategory || querySubcategory) && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary-light">
          <div className="flex items-center gap-2">
            <span>Filtering products by:</span>
            {activeCategory && <span className="font-bold text-text bg-primary/20 px-2 py-0.5 rounded-md">{activeCategory.name}</span>}
            {activeSubcategory && (
              <>
                <span className="text-text-muted">↳</span>
                <span className="font-bold text-text bg-primary/20 px-2 py-0.5 rounded-md">{activeSubcategory.name}</span>
              </>
            )}
          </div>
          <button
            onClick={() => {
              setSearchParams({});
              setPage(1);
            }}
            className="text-xs text-text-muted hover:text-red-400 font-semibold underline transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full bg-dark-card border border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-text focus:outline-none focus:border-primary transition-colors"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <FiPlus /> Add Product
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-dark-surface/50 text-xs uppercase text-text-muted border-b border-dark-border">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center">
                    <Loader size="md" />
                  </td>
                </tr>
              ) : data?.data?.products?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-text-muted">
                    No products found.
                  </td>
                </tr>
              ) : (
                data?.data?.products?.map((product) => (
                  <tr key={product._id} className="hover:bg-dark-surface/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-dark-bg overflow-hidden flex-shrink-0 border border-dark-border">
                          <img 
                            src={product.images?.[0]?.url || 'https://via.placeholder.com/48'} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-text line-clamp-1">{product.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      <div className="flex flex-col">
                        <span>{product.category?.name || product.category}</span>
                        {product.subcategory && (
                          <span className="text-xs text-text-muted mt-1">↳ {product.subcategory?.name || product.subcategory}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-text font-medium">{formatCurrency(product.salePrice || product.price)}</span>
                        {product.salePrice && <span className="text-xs text-gray-500 line-through">{formatCurrency(product.price)}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        product.stock > 10 ? 'bg-green-500/10 text-green-400' : 
                        product.stock > 0 ? 'bg-yellow-500/10 text-yellow-400' : 
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => openModal(product)}
                          className="text-text-muted hover:text-[#00CEC9] transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="text-text-muted hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        {data?.data?.pagination?.pages > 1 && (
          <div className="p-4 border-t border-dark-border flex items-center justify-between">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-text disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-text-muted">Page {page} of {data.data.pagination.pages}</span>
            <button 
              disabled={page === data.data.pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-text disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ProductModal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
            product={editingProduct} 
            defaultCategory={prefilledCategory}
            defaultSubcategory={prefilledSubcategory}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Extracted Helper function for currency (since it was missing above)
const formatCurrency = (amount) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const ProductModal = ({ isOpen, onClose, product, defaultCategory = '', defaultSubcategory = '' }) => {
  const [imageFiles, setImageFiles] = useState([]);
  const queryClient = useQueryClient();

  // Fetch categories with subcategories populated
  const { data: categoriesData } = useQuery({
    queryKey: ['adminCategoriesWithSubs'],
    queryFn: adminApi.getCategoriesWithSubs,
  });

  const categories = categoriesData?.data?.categories || [];
  
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
    defaultValues: product ? {
      title: product.title,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice || '',
      category: product.category?._id || product.category,
      subcategory: product.subcategory?._id || product.subcategory || '',
      brand: product.brand,
      stock: product.stock,
    } : {
      category: defaultCategory,
      subcategory: defaultSubcategory,
      title: '',
      description: '',
      price: '',
      salePrice: '',
      brand: '',
      stock: ''
    }
  });

  // Pre-populate the form once async category data finishes loading so select dropdowns resolve correctly
  useEffect(() => {
    if (categories.length > 0) {
      reset(product ? {
        title: product.title,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice || '',
        category: product.category?._id || product.category,
        subcategory: product.subcategory?._id || product.subcategory || '',
        brand: product.brand,
        stock: product.stock,
      } : {
        category: defaultCategory,
        subcategory: defaultSubcategory,
        title: '',
        description: '',
        price: '',
        salePrice: '',
        brand: '',
        stock: ''
      });
    }
  }, [categories, product, defaultCategory, defaultSubcategory, reset]);

  // Watch the category field to dynamically show subcategories
  const selectedCategoryId = watch('category');
  const subcategoryValue = watch('subcategory');
  const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);
  const subcategories = selectedCategory?.subcategories || [];

  // Reset subcategory when the category changes and the current subcategory doesn't belong to it
  useEffect(() => {
    if (subcategoryValue && !subcategories.some(sub => sub._id === subcategoryValue)) {
      setValue('subcategory', '');
    }
  }, [selectedCategoryId, subcategories, subcategoryValue, setValue]);

  const mutation = useMutation({
    mutationFn: (data) => product ? productApi.updateProduct(product._id, data) : productApi.createProduct(data),
    onSuccess: () => {
      toast.success(`Product ${product ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== '') formData.append(key, data[key]);
    });

    // Explicitly send empty subcategory so the server clears it when intentionally removed
    if (!data.subcategory) formData.append('subcategory', '');

    if (imageFiles.length > 0) {
      Array.from(imageFiles).forEach(file => {
        formData.append('images', file);
      });
    }

    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-dark-bg border border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-dark-border flex-shrink-0">
          <h2 className="text-xl font-bold text-text">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <form id="product-form" onSubmit={handleSubmit(onSubmit, () => toast.error('Please fill in all required fields'))} className="flex flex-col min-h-0">
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Price</label>
                <input
                  type="number"
                  {...register('price', { required: 'Price is required', min: 0 })}
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Sale Price (Optional)</label>
                <input
                  type="number"
                  {...register('salePrice', { min: 0 })}
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Sub-Category <span className="text-text-muted font-normal">(Optional)</span>
                </label>
                <select
                  {...register('subcategory')}
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none"
                  disabled={!selectedCategoryId || subcategories.length === 0}
                >
                  <option value="">
                    {!selectedCategoryId
                      ? 'Select a category first'
                      : subcategories.length === 0
                        ? 'No sub-categories available'
                        : 'Select Sub-Category'}
                  </option>
                  {subcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Brand</label>
                <input
                  {...register('brand', { required: 'Brand is required' })}
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Stock</label>
                <input
                  type="number"
                  {...register('stock', { required: 'Stock is required', min: 0 })}
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Images (Upload)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dark-border border-dashed rounded-xl cursor-pointer bg-dark-card hover:bg-dark-surface transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiImage className="w-8 h-8 mb-3 text-text-muted" />
                    <p className="mb-2 text-sm text-text-muted"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG or WEBP (Max 5MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    multiple 
                    accept="image/*"
                    onChange={(e) => setImageFiles(e.target.files)}
                  />
                </label>
              </div>
              {imageFiles.length > 0 && (
                <p className="text-sm text-green-400 mt-2">{imageFiles.length} files selected</p>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-dark-border flex justify-end gap-4 bg-dark-surface/30 flex-shrink-0">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminProductsPage;
