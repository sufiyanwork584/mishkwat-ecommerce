import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDealsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminDeals'],
    queryFn: adminApi.getDeals,
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteDeal,
    onSuccess: () => {
      toast.success('Deal deleted');
      queryClient.invalidateQueries({ queryKey: ['adminDeals'] });
    },
    onError: () => toast.error('Failed to delete deal'),
  });

  const handleDelete = (id) => {
    if (window.confirm('Delete this deal?')) deleteMutation.mutate(id);
  };

  const openModal = (deal = null) => { setEditingDeal(deal); setIsModalOpen(true); };
  const closeModal = () => { setEditingDeal(null); setIsModalOpen(false); };

  const deals = data?.data?.deals || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text">Promotional Deals of the Week</h2>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Deal
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader size="lg" /></div>
      ) : deals.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-text-muted">
          No promotional deals yet. Click "Add Deal" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deals.map((deal, index) => (
            <motion.div
              key={deal._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] bg-dark-surface overflow-hidden">
                <img
                  src={deal.backgroundImage?.url || 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80'}
                  alt={deal.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {deal.productImage?.url && (
                  <div className="absolute right-4 bottom-4 w-20 h-20 rounded-xl overflow-hidden border border-white/20 bg-dark-surface/80 p-1 flex items-center justify-center">
                    <img src={deal.productImage.url} alt="product" className="max-h-full max-w-full object-contain" />
                  </div>
                )}

                <div className="absolute bottom-4 left-4 pr-24 text-left">
                  <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full inline-block mb-1.5">
                    Order: {deal.displayOrder}
                  </span>
                  <h3 className="text-text font-bold text-lg leading-tight">{deal.title}</h3>
                  {deal.subtitle && <p className="text-gray-300 text-sm mt-0.5 truncate">{deal.subtitle}</p>}
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center text-xs text-text-muted text-left">
                  <div>
                    {deal.startDate && <p>Start: {new Date(deal.startDate).toLocaleDateString()}</p>}
                    {deal.endDate && <p>End: {new Date(deal.endDate).toLocaleDateString()}</p>}
                  </div>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    deal.isActive ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-text-muted'
                  }`}>
                    {deal.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
                
                <hr className="border-dark-border" />
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 truncate max-w-[200px]" title={deal.buttonLink}>
                    Link: {deal.buttonLink}
                  </span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => openModal(deal)} className="text-text-muted hover:text-[#00CEC9] transition-colors" title="Edit">
                      <FiEdit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(deal._id)} className="text-text-muted hover:text-red-400 transition-colors" title="Delete">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && <DealModal onClose={closeModal} deal={editingDeal} />}
      </AnimatePresence>
    </div>
  );
};

const DealModal = ({ onClose, deal }) => {
  const [bgFile, setBgFile] = useState(null);
  const [productFile, setProductFile] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: deal ? {
      title: deal.title,
      subtitle: deal.subtitle || '',
      description: deal.description || '',
      offerText: deal.offerText || '',
      buttonText: deal.buttonText || 'Unlock Deals',
      buttonLink: deal.buttonLink || '/',
      displayOrder: deal.displayOrder || 0,
      startDate: deal.startDate ? new Date(deal.startDate).toISOString().substring(0, 16) : '',
      endDate: deal.endDate ? new Date(deal.endDate).toISOString().substring(0, 16) : '',
      isActive: deal.isActive,
    } : { isActive: true, buttonText: 'Unlock Deals', buttonLink: '/', displayOrder: 0 }
  });

  const mutation = useMutation({
    mutationFn: (data) => deal ? adminApi.updateDeal(deal._id, data) : adminApi.createDeal(data),
    onSuccess: () => {
      toast.success(`Deal ${deal ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['adminDeals'] });
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Something went wrong'),
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== '' && data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    if (bgFile) formData.append('backgroundImage', bgFile);
    if (productFile) formData.append('productImage', productFile);
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
          <h2 className="text-xl font-bold text-text">{deal ? 'Edit Deal' : 'Add New Deal'}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors"><FiX size={24} /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh] text-left">
          <form id="deal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
                <input {...register('title', { required: 'Title is required' })} className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none" />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Subtitle (Optional)</label>
                <input {...register('subtitle')} className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Offer Badge Text (Optional)</label>
                <input {...register('offerText')} placeholder="e.g. SAVE 25%" className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description (Optional)</label>
              <textarea {...register('description')} rows={3} className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Button Text</label>
                <input {...register('buttonText')} className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Button Link</label>
                <input {...register('buttonLink')} className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none" />
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
                <input type="checkbox" id="dealActive" {...register('isActive')} className="w-5 h-5 rounded border-dark-border bg-dark-card text-primary focus:ring-primary" />
                <label htmlFor="dealActive" className="text-sm font-medium text-text">Active / Enabled</label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Background Image</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dark-border border-dashed rounded-xl cursor-pointer bg-dark-card hover:bg-dark-surface transition-colors">
                  <FiImage className="w-6 h-6 mb-1 text-text-muted" />
                  <p className="text-xs text-text-muted"><span className="font-semibold text-primary">Upload BG</span></p>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setBgFile(e.target.files[0])} />
                </label>
                {bgFile && <p className="text-xs text-green-400 mt-2 truncate">{bgFile.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Product Image (Optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dark-border border-dashed rounded-xl cursor-pointer bg-dark-card hover:bg-dark-surface transition-colors">
                  <FiImage className="w-6 h-6 mb-1 text-text-muted" />
                  <p className="text-xs text-text-muted"><span className="font-semibold text-primary">Upload Prod</span></p>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setProductFile(e.target.files[0])} />
                </label>
                {productFile && <p className="text-xs text-green-400 mt-2 truncate">{productFile.name}</p>}
              </div>
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-dark-border flex justify-end gap-4 bg-dark-surface/30">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" form="deal-form" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Deal'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDealsPage;
