import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminBannersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminBanners'],
    queryFn: adminApi.getBanners,
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteBanner,
    onSuccess: () => {
      toast.success('Banner deleted');
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      queryClient.invalidateQueries({ queryKey: ['publicBanners'] });
    },
    onError: () => toast.error('Failed to delete banner'),
  });

  const handleDelete = (id) => {
    if (window.confirm('Delete this banner?')) deleteMutation.mutate(id);
  };

  const openModal = (banner = null) => { setEditingBanner(banner); setIsModalOpen(true); };
  const closeModal = () => { setEditingBanner(null); setIsModalOpen(false); };

  const banners = data?.data?.banners || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text">Promotional Banners</h2>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Banner
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader size="lg" /></div>
      ) : banners.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-text-muted">
          No banners yet. Click "Add Banner" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner, index) => (
            <motion.div
              key={banner._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="glass-card rounded-2xl overflow-hidden group"
            >
              <div className="relative aspect-[21/9] bg-dark-surface overflow-hidden">
                <img
                  src={banner.image?.url || 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80'}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-text font-bold text-lg">{banner.title}</h3>
                  {banner.subtitle && <p className="text-gray-300 text-sm mt-0.5">{banner.subtitle}</p>}
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                    banner.isActive ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-text-muted'
                  }`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {banner.link && <span className="text-xs text-gray-500 truncate max-w-[150px]">{banner.link}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal(banner)} className="text-text-muted hover:text-[#00CEC9] transition-colors" title="Edit">
                    <FiEdit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(banner._id)} className="text-text-muted hover:text-red-400 transition-colors" title="Delete">
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && <BannerModal onClose={closeModal} banner={editingBanner} />}
      </AnimatePresence>
    </div>
  );
};

const BannerModal = ({ onClose, banner }) => {
  const [imageFile, setImageFile] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: banner ? {
      title: banner.title,
      subtitle: banner.subtitle || '',
      link: banner.link || '',
      buttonText: banner.buttonText || '',
      buttonUrl: banner.buttonUrl || '',
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().substring(0, 16) : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().substring(0, 16) : '',
      displayOrder: banner.displayOrder || 0,
      isActive: banner.isActive,
    } : { isActive: true, link: '/', displayOrder: 0 }
  });

  const mutation = useMutation({
    mutationFn: (data) => banner ? adminApi.updateBanner(banner._id, data) : adminApi.createBanner(data),
    onSuccess: () => {
      toast.success(`Banner ${banner ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      queryClient.invalidateQueries({ queryKey: ['publicBanners'] });
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Something went wrong'),
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => { if (data[key] !== '' && data[key] !== undefined && data[key] !== null) formData.append(key, data[key]); });
    if (imageFile) formData.append('image', imageFile);
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-dark-bg border border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-xl font-bold text-text">{banner ? 'Edit Banner' : 'Add New Banner'}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors"><FiX size={24} /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form id="banner-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
              <input {...register('title', { required: 'Title is required' })} className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none" />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Subtitle (Optional)</label>
              <input {...register('subtitle')} className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Button Text (Optional)</label>
                <input {...register('buttonText')} placeholder="e.g. Shop Now" className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Button URL / Link (Optional)</label>
                <input {...register('buttonUrl')} placeholder="e.g. /products" className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Start Date (Optional)</label>
                <input type="datetime-local" {...register('startDate')} className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">End Date (Optional)</label>
                <input type="datetime-local" {...register('endDate')} className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Display Order</label>
                <input type="number" {...register('displayOrder')} className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="bannerActive" {...register('isActive')} className="w-5 h-5 rounded border-dark-border bg-dark-card text-primary focus:ring-primary" />
                <label htmlFor="bannerActive" className="text-sm font-medium text-text">Active</label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Banner Image</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dark-border border-dashed rounded-xl cursor-pointer bg-dark-card hover:bg-dark-surface transition-colors">
                <FiImage className="w-8 h-8 mb-2 text-text-muted" />
                <p className="text-sm text-text-muted"><span className="font-semibold text-primary">Click to upload</span></p>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
              </label>
              {imageFile && <p className="text-sm text-green-400 mt-2">{imageFile.name}</p>}
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-dark-border flex justify-end gap-4 bg-dark-surface/30">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" form="banner-form" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Banner'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminBannersPage;
