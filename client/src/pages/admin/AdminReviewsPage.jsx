import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import { FiCheck, FiX, FiTrash2, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AdminReviewsPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminReviews', page, statusFilter],
    queryFn: () => adminApi.getReviews({ page, limit: 10, status: statusFilter }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updateReviewStatus(id, status),
    onSuccess: () => {
      toast.success('Review status updated');
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
    },
    onError: () => toast.error('Failed to update review'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteReview,
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
    },
    onError: () => toast.error('Failed to delete review'),
  });

  const handleDelete = (id) => {
    if (window.confirm('Delete this review permanently?')) {
      deleteMutation.mutate(id);
    }
  };

  const reviews = data?.data?.reviews || data?.data || [];
  const pages = data?.data?.pages || 1;

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <FiStar
          key={star}
          size={14}
          className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-text">Review Moderation</h2>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-dark-card border border-dark-border rounded-xl px-4 py-2 text-text focus:outline-none focus:border-primary"
        >
          <option value="">All Reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader size="lg" /></div>
        ) : reviews.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center text-text-muted">No reviews found.</div>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row gap-5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  {renderStars(review.rating)}
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    review.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                    review.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {review.status || 'pending'}
                  </span>
                </div>
                <h4 className="text-text font-semibold mb-1">{review.title || 'No Title'}</h4>
                <p className="text-text-muted text-sm line-clamp-3 mb-3">{review.comment}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>by <span className="text-gray-300">{review.user?.name || 'Unknown'}</span></span>
                  <span>on <span className="text-gray-300">{review.product?.title || 'Unknown Product'}</span></span>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center gap-2 sm:justify-center flex-shrink-0">
                <button
                  onClick={() => updateStatusMutation.mutate({ id: review._id, status: 'approved' })}
                  disabled={review.status === 'approved'}
                  className="p-2.5 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Approve"
                >
                  <FiCheck size={18} />
                </button>
                <button
                  onClick={() => updateStatusMutation.mutate({ id: review._id, status: 'rejected' })}
                  disabled={review.status === 'rejected'}
                  className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Reject"
                >
                  <FiX size={18} />
                </button>
                <button
                  onClick={() => handleDelete(review._id)}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  title="Delete"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-sm text-gray-300 hover:text-text disabled:opacity-50">Previous</button>
          <span className="text-sm text-text-muted">Page {page} of {pages}</span>
          <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm text-gray-300 hover:text-text disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
