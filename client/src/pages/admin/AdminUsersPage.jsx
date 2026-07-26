import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import { FiSearch, FiShield, FiShieldOff, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AdminUsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', page, searchTerm],
    queryFn: () => adminApi.getUsers({ page, limit: 10, search: searchTerm }),
  });

  const blockMutation = useMutation({
    mutationFn: (id) => adminApi.blockUser(id),
    onSuccess: () => {
      toast.success('User blocked successfully');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: () => toast.error('Failed to block user'),
  });

  const unblockMutation = useMutation({
    mutationFn: (id) => adminApi.unblockUser(id),
    onSuccess: () => {
      toast.success('User unblocked successfully');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: () => toast.error('Failed to unblock user'),
  });

  const handleToggleBlock = (user) => {
    const action = user.isBlocked ? 'unblock' : 'block';
    if (window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
      if (user.isBlocked) {
        unblockMutation.mutate(user._id);
      } else {
        blockMutation.mutate(user._id);
      }
    }
  };

  const users = data?.data?.users || data?.data || [];
  const pages = data?.data?.pages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-text">User Accounts</h2>
        <div className="relative w-full max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full bg-dark-card border border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-text focus:outline-none focus:border-primary transition-colors"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-dark-surface/50 text-xs uppercase text-text-muted border-b border-dark-border">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-text-muted">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-dark-surface/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px] flex-shrink-0">
                          <div className="w-full h-full rounded-full bg-dark-surface flex items-center justify-center overflow-hidden">
                            {user.avatar?.url ? (
                              <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <FiUser className="w-4 h-4 text-text-muted" />
                            )}
                          </div>
                        </div>
                        <span className="font-medium text-text">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-[#6C5CE7]/10 text-[#a29bfe]' : 'bg-[#00CEC9]/10 text-[#00CEC9]'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isBlocked ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                      }`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleBlock(user)}
                          className={`flex items-center gap-1.5 ml-auto text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            user.isBlocked
                              ? 'text-green-400 hover:bg-green-500/10'
                              : 'text-red-400 hover:bg-red-500/10'
                          }`}
                        >
                          {user.isBlocked ? <FiShield size={14} /> : <FiShieldOff size={14} />}
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="p-4 border-t border-dark-border flex items-center justify-between">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-text disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-text-muted">Page {page} of {pages}</span>
            <button
              disabled={page === pages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-text disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
