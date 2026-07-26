import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFileText, FiEye, FiCheck, FiX, FiFolder } from 'react-icons/fi';
import { blogApi } from '../../api/blogApi';
import { adminApi } from '../../api/adminApi';
import axiosInstance from '../../api/axios';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

const AdminBlogsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    status: 'published',
    imageUrl: '',
  });

  // Fetch all blogs (admin view includes drafts)
  const { data: blogsResult, isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => {
      const response = await axiosInstance.get('/blogs/admin/all');
      return response.data;
    },
  });

  // Fetch blog categories for dropdown
  const { data: blogCategoriesResult } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: blogApi.getCategories,
  });

  const blogs = blogsResult?.data?.blogs || blogsResult?.data || [];
  const categories = blogCategoriesResult?.data || [];

  // Create Blog Mutation
  const createMutation = useMutation({
    mutationFn: async (blogData) => {
      const response = await axiosInstance.post('/blogs', blogData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-blogs']);
      queryClient.invalidateQueries(['blogs']);
      toast.success('Blog created successfully!');
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create blog');
    },
  });

  // Update Blog Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, blogData }) => {
      const response = await axiosInstance.put(`/blogs/${id}`, blogData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-blogs']);
      queryClient.invalidateQueries(['blogs']);
      toast.success('Blog updated successfully!');
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update blog');
    },
  });

  // Delete Blog Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/blogs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-blogs']);
      queryClient.invalidateQueries(['blogs']);
      toast.success('Blog deleted successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete blog');
    },
  });

  const openCreateModal = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: categories[0]?._id || '',
      status: 'published',
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      category: blog.category?._id || blog.category || '',
      status: blog.status || 'published',
      imageUrl: blog.image?.url || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and Content are required');
      return;
    }

    const payload = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      category: formData.category || categories[0]?._id,
      status: formData.status,
      image: formData.imageUrl ? { url: formData.imageUrl } : undefined,
    };

    if (editingBlog) {
      updateMutation.mutate({ id: editingBlog._id, blogData: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredBlogs = blogs.filter((b) =>
    b.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-text flex items-center gap-2">
            <FiFileText className="text-primary" /> Blog & Articles Management
          </h1>
          <p className="text-sm text-dark-muted mt-1">
            Create, edit, publish, and delete blog articles and spiritual guides.
          </p>
        </div>

        <Button onClick={openCreateModal} variant="primary" className="flex items-center gap-2">
          <FiPlus /> Create Article
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 max-w-md">
        <FiSearch className="text-dark-muted mr-3" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search articles by title..."
          className="bg-transparent text-sm text-dark-text placeholder-dark-muted outline-none w-full"
        />
      </div>

      {/* Articles Table */}
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-16 text-center text-dark-muted">
            <p className="font-semibold text-lg">No articles found</p>
            <p className="text-xs mt-1">Click "Create Article" to publish your first guide.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-dark-text">
              <thead className="bg-dark-surface/50 border-b border-dark-border text-xs uppercase tracking-wider text-dark-muted font-bold">
                <tr>
                  <th className="py-4 px-6">Article</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Views</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-dark-surface/30 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-dark-surface overflow-hidden flex-shrink-0 border border-dark-border">
                        <img
                          src={blog.image?.url || 'https://placehold.co/100x100?text=Blog'}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="max-w-md">
                        <p className="font-semibold text-dark-text line-clamp-1">{blog.title}</p>
                        <p className="text-xs text-dark-muted line-clamp-1">{blog.excerpt || 'No excerpt'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary-light">
                        <FiFolder size={12} /> {blog.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          blog.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {blog.status || 'draft'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-dark-muted font-mono">
                      {blog.views || 0}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(blog)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit Article"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${blog.title}"?`)) {
                            deleteMutation.mutate(blog._id);
                          }
                        }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Article"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit Blog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-dark-border pb-4">
                <h3 className="text-xl font-bold text-dark-text">
                  {editingBlog ? 'Edit Article' : 'Create New Article'}
                </h3>
                <button onClick={closeModal} className="text-dark-muted hover:text-dark-text p-1">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-dark-muted uppercase mb-1.5">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter article title"
                    className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none focus:border-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-dark-muted uppercase mb-1.5">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none focus:border-primary"
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dark-muted uppercase mb-1.5">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none focus:border-primary"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark-muted uppercase mb-1.5">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark-muted uppercase mb-1.5">
                    Short Excerpt
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows="2"
                    placeholder="Brief summary of the article..."
                    className="w-full bg-dark-surface border border-dark-border rounded-xl p-3 text-sm text-dark-text outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark-muted uppercase mb-1.5">
                    Full Content (HTML / Text) *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows="8"
                    placeholder="Write your guide or article content here..."
                    className="w-full bg-dark-surface border border-dark-border rounded-xl p-3 text-sm text-dark-text outline-none focus:border-primary font-mono"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={createMutation.isLoading || updateMutation.isLoading}
                  >
                    {editingBlog ? 'Update Article' : 'Publish Article'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBlogsPage;
