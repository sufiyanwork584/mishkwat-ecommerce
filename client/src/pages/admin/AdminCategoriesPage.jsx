import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiChevronDown, FiChevronRight, FiCornerDownRight, FiEye } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCategoriesPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [parentForNewSub, setParentForNewSub] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  
  const queryClient = useQueryClient();

  // Use the dedicated admin endpoint that returns ALL categories as a tree
  const { data, isLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: adminApi.getAdminCategories,
  });

  const categories = data?.data?.categories || [];

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['adminCategoriesWithSubs'] });
  };

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteCategory,
    onSuccess: () => {
      toast.success('Category deleted successfully');
      invalidateAll();
    },
    onError: () => toast.error('Failed to delete category'),
  });

  const handleDelete = (id, name, isSubcategory = false) => {
    const msg = isSubcategory
      ? `Are you sure you want to delete "${name}"?`
      : `Are you sure you want to delete "${name}"? Its sub-categories will become main categories.`;
    if (window.confirm(msg)) {
      deleteMutation.mutate(id);
    }
  };

  const toggleExpand = (id) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openModal = (category = null, parentCategory = null) => {
    setEditingCategory(category);
    setParentForNewSub(parentCategory);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCategory(null);
    setParentForNewSub(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text">Categories</h2>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> Add Category
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-dark-surface/50 text-xs uppercase text-text-muted border-b border-dark-border">
              <tr>
                <th className="px-6 py-4 font-medium w-10"></th>
                <th className="px-6 py-4 font-medium">Image</th>
                <th className="px-6 py-4 font-medium">Category Name</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Sub-Categories</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center">
                    <Loader size="md" />
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-text-muted">
                    No categories found. Click "Add Category" to create one.
                  </td>
                </tr>
              ) : (
                categories.map((category) => {
                  const subcategories = category.subcategories || [];
                  const isExpanded = expandedCategories[category._id];
                  const hasSubcategories = subcategories.length > 0;

                  return (
                    <React.Fragment key={category._id}>
                      {/* Main Category Row */}
                      <tr className="hover:bg-dark-surface/30 transition-colors">
                        <td className="px-6 py-4">
                          {hasSubcategories ? (
                            <button
                              onClick={() => toggleExpand(category._id)}
                              className="text-text-muted hover:text-text transition-colors"
                            >
                              {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                            </button>
                          ) : (
                            <span className="text-dark-border text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-lg bg-dark-bg overflow-hidden flex-shrink-0 border border-dark-border">
                            <img 
                              src={category.image?.url || 'https://via.placeholder.com/48'} 
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-text">{category.name}</td>
                        <td className="px-6 py-4 text-text-muted">{category.slug}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                            Parent
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            hasSubcategories ? 'bg-primary/10 text-primary' : 'bg-dark-surface text-text-muted'
                          }`}>
                            {subcategories.length} sub-{subcategories.length === 1 ? 'category' : 'categories'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => navigate(`/admin/products?category=${category._id}`)}
                              className="text-text-muted hover:text-blue-400 transition-colors"
                              title="View Products"
                            >
                              <FiEye size={18} />
                            </button>
                            <button 
                              onClick={() => openModal(null, category)}
                              className="text-text-muted hover:text-green-400 transition-colors"
                              title="Add Sub-Category"
                            >
                              <FiPlus size={18} />
                            </button>
                            <button 
                              onClick={() => openModal(category)}
                              className="text-text-muted hover:text-[#00CEC9] transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(category._id, category.name)}
                              className="text-text-muted hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Sub-Category Rows (expandable) */}
                      {isExpanded && subcategories.map((sub) => (
                        <tr key={sub._id} className="bg-dark-surface/10 hover:bg-dark-surface/20 transition-colors">
                          <td className="px-6 py-3"></td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <FiCornerDownRight size={14} className="text-text-muted/40 flex-shrink-0" />
                              <div className="w-9 h-9 rounded-lg bg-dark-bg overflow-hidden flex-shrink-0 border border-dark-border">
                                <img 
                                  src={sub.image?.url || 'https://via.placeholder.com/36'} 
                                  alt={sub.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-text/80">{sub.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-text-muted">{sub.slug}</td>
                          <td className="px-6 py-3">
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                              Sub of {category.name}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button 
                                onClick={() => navigate(`/admin/products?subcategory=${sub._id}`)}
                                className="text-text-muted hover:text-blue-400 transition-colors"
                                title="View Products"
                              >
                                <FiEye size={18} />
                              </button>
                              <button 
                                onClick={() => navigate(`/admin/products?action=add&category=${category._id}&subcategory=${sub._id}`)}
                                className="text-text-muted hover:text-green-400 transition-colors"
                                title="Add Product"
                              >
                                <FiPlus size={18} />
                              </button>
                              <button 
                                onClick={() => openModal(sub)}
                                className="text-text-muted hover:text-[#00CEC9] transition-colors"
                                title="Edit"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(sub._id, sub.name)}
                                className="text-text-muted hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {/* End Sub-Category Rows */}    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CategoryModal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
            category={editingCategory}
            parentCategory={parentForNewSub}
            allCategories={categories}
            invalidateAll={invalidateAll}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const CategoryModal = ({ isOpen, onClose, category, parentCategory, allCategories, invalidateAll }) => {
  const [imageFile, setImageFile] = useState(null);

  const isSubcategoryMode = !!parentCategory;
  const isEditing = !!category;

  // When editing, figure out the current parent
  // category.parent could be an ObjectId string or null
  const currentParentId = isEditing ? (category.parent || '') : '';

  const defaultParent = isEditing
    ? currentParentId
    : (isSubcategoryMode ? parentCategory._id : '');

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: isEditing ? {
      name: category.name,
      description: category.description || '',
      parent: defaultParent,
    } : {
      name: '',
      description: '',
      parent: defaultParent,
    }
  });

  const watchedParent = watch('parent');

  const mutation = useMutation({
    mutationFn: (data) => category ? adminApi.updateCategory(category._id, data) : adminApi.createCategory(data),
    onSuccess: () => {
      toast.success(`${isEditing ? 'Updated' : 'Created'} successfully`);
      invalidateAll();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    
    // Always send name
    formData.append('name', data.name);
    
    // Always send description (even if empty)
    formData.append('description', data.description || '');
    
    // Always send parent — 'null' string means "make this a main category"
    if (data.parent && data.parent !== '') {
      formData.append('parent', data.parent);
    } else {
      formData.append('parent', 'null');
    }
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    mutation.mutate(formData);
  };

  // Build modal title
  let modalTitle = 'Add New Category';
  if (isEditing) {
    modalTitle = `Edit: ${category.name}`;
  } else if (isSubcategoryMode) {
    modalTitle = `Add Sub-Category to "${parentCategory.name}"`;
  }

  // For the parent dropdown, don't show the category being edited (can't be its own parent)
  const parentOptions = allCategories.filter(cat => !isEditing || cat._id !== category._id);

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
        className="relative w-full max-w-lg bg-dark-bg border border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-xl font-bold text-text">{modalTitle}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Parent Category Selector — ALWAYS editable */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Parent Category <span className="text-text-muted font-normal">(leave "None" for main category)</span>
              </label>
              <select
                {...register('parent')}
                className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none"
              >
                <option value="">None (Main Category)</option>
                {parentOptions.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {watchedParent && watchedParent !== '' && (
                <p className="text-xs text-primary mt-1">
                  This will be a sub-category of "{parentOptions.find(c => c._id === watchedParent)?.name || 'selected parent'}"
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description (Optional)</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Image</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dark-border border-dashed rounded-xl cursor-pointer bg-dark-card hover:bg-dark-surface transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiImage className="w-8 h-8 mb-3 text-text-muted" />
                    <p className="mb-2 text-sm text-text-muted"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </label>
              </div>
              {imageFile && (
                <p className="text-sm text-green-400 mt-2">{imageFile.name} selected</p>
              )}
              {isEditing && category.image?.url && !imageFile && (
                <p className="text-xs text-text-muted mt-2">Current image will be kept unless you upload a new one.</p>
              )}
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-dark-border flex justify-end gap-4 bg-dark-surface/30">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button 
            type="submit" 
            form="category-form" 
            className="btn-primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Category')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminCategoriesPage;
