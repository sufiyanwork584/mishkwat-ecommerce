import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCouponsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: adminApi.getCoupons,
  });

  const coupons = data?.data?.coupons || [];

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteCoupon,
    onSuccess: () => {
      toast.success('Coupon deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    },
    onError: () => toast.error('Failed to delete coupon'),
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      deleteMutation.mutate(id);
    }
  };

  const openModal = (coupon = null) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCoupon(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text">Discount Coupons</h2>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> Create Coupon
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-dark-surface/50 text-xs uppercase text-text-muted border-b border-dark-border">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Discount</th>
                <th className="px-6 py-4 font-medium">Expiry Date</th>
                <th className="px-6 py-4 font-medium">Usage</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center">
                    <Loader size="md" />
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-text-muted">
                    No coupons found.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-dark-surface/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-[#00CEC9] font-bold tracking-wider px-2 py-1 bg-[#00CEC9]/10 rounded-md">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-text">
                      {coupon.discountType === 'percentage' ? `${coupon.discountAmount}%` : `₹${coupon.discountAmount}`}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.usedCount} / {coupon.usageLimit || '∞'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        coupon.isActive && new Date(coupon.expiryDate) > new Date()
                          ? 'bg-green-500/10 text-green-400' 
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {coupon.isActive && new Date(coupon.expiryDate) > new Date() ? 'Active' : 'Expired/Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => openModal(coupon)}
                          className="text-text-muted hover:text-[#00CEC9] transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(coupon._id)}
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
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CouponModal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
            coupon={editingCoupon} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const CouponModal = ({ isOpen, onClose, coupon }) => {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: coupon ? {
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
      minPurchase: coupon.minPurchase || 0,
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive,
    } : {
      discountType: 'percentage',
      minPurchase: 0,
      isActive: true,
    }
  });

  const mutation = useMutation({
    mutationFn: (data) => coupon ? adminApi.updateCoupon(coupon._id, data) : adminApi.createCoupon(data),
    onSuccess: () => {
      toast.success(`Coupon ${coupon ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate({
      ...data,
      usageLimit: data.usageLimit === '' ? null : Number(data.usageLimit)
    });
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
        className="relative w-full max-w-lg bg-dark-bg border border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-xl font-bold text-text">{coupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form id="coupon-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Coupon Code</label>
              <input
                {...register('code', { required: 'Code is required' })}
                className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none uppercase"
                placeholder="e.g. SUMMER2026"
              />
              {errors.code && <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Discount Type</label>
                <select
                  {...register('discountType')}
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Discount Value</label>
                <input
                  type="number"
                  {...register('discountAmount', { required: 'Amount is required', min: 1 })}
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Min Purchase Amount (₹)</label>
                <input
                  type="number"
                  {...register('minPurchase', { min: 0 })}
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Usage Limit (Total)</label>
                <input
                  type="number"
                  {...register('usageLimit')}
                  placeholder="Leave empty for unlimited"
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Expiry Date</label>
              <input
                type="date"
                {...register('expiryDate', { required: 'Expiry date is required' })}
                className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-text focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="w-5 h-5 rounded border-dark-border bg-dark-card text-primary focus:ring-primary focus:ring-offset-dark-bg"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-text">
                Activate Coupon
              </label>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-dark-border flex justify-end gap-4 bg-dark-surface/30">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button 
            type="submit" 
            form="coupon-form" 
            className="btn-primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : 'Save Coupon'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminCouponsPage;
