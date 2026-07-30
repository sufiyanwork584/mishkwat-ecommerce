import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, updateUser } from '../../features/authSlice';
import { authApi } from '../../api/authApi';
import { userApi } from '../../api/userApi';
import toast from 'react-hot-toast';
import { FiUser, FiShield, FiMail, FiPhone, FiLock, FiChevronLeft, FiCamera } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';

const ProfilePage = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('personal'); // personal | security

  // Loading States
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Forms
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    }
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, watch, reset: resetPasswordForm, formState: { errors: passwordErrors } } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = watch('newPassword');

  const onUpdateProfile = async (data) => {
    setUpdatingProfile(true);
    try {
      const res = await authApi.updateProfile({
        name: data.name,
        phone: data.phone
      });
      dispatch(updateUser(res.data?.user || res.user));
      toast.success(res.message || 'Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const onUpdatePassword = async (data) => {
    setUpdatingPassword(true);
    try {
      const res = await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success(res.message || 'Password changed successfully!');
      resetPasswordForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const res = await userApi.updateAvatar(formData);
      dispatch(updateUser({ avatar: res.data?.avatar || res.avatar }));
      toast.success('Avatar updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="bg-background text-text py-6 text-left space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors mb-2">
            <FiChevronLeft /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-text">Profile Settings</h1>
          <p className="text-xs text-text-muted mt-1">Configure your personal information and password credentials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar / Avatar Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/5 text-center flex flex-col items-center space-y-4">
            
            {/* Avatar upload */}
            <div className="relative w-28 h-28 group">
              <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-primary to-secondary p-[1px] shadow-lg">
                <div className="w-full h-full rounded-2xl bg-dark-surface overflow-hidden flex items-center justify-center relative">
                  {uploadingAvatar ? (
                    <div className="absolute inset-0 bg-dark-bg/60 z-10 flex items-center justify-center">
                      <Loader size="sm" />
                    </div>
                  ) : user?.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="w-10 h-10 text-primary-light" />
                  )}
                </div>
              </div>
              
              <label className="absolute bottom-[-6px] right-[-6px] bg-primary hover:bg-primary-dark border border-white/10 w-9 h-9 rounded-xl flex items-center justify-center text-text cursor-pointer shadow-lg transition-colors group-hover:scale-105">
                <FiCamera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="text-center">
              <h3 className="font-display font-bold text-text text-lg">{user?.name}</h3>
              <p className="text-xs text-text-muted font-medium capitalize mt-0.5">{user?.role || 'Customer'}</p>
            </div>

            {/* Tab buttons */}
            <div className="w-full space-y-2 pt-2 border-t border-white/5">
              <button
                onClick={() => setActiveTab('personal')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  activeTab === 'personal'
                    ? 'bg-primary text-text font-semibold shadow-lg shadow-primary/20'
                    : 'text-text-muted hover:bg-dark-card hover:text-text'
                }`}
              >
                <FiUser /> Personal Details
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  activeTab === 'security'
                    ? 'bg-primary text-text font-semibold shadow-lg shadow-primary/20'
                    : 'text-text-muted hover:bg-dark-card hover:text-text'
                }`}
              >
                <FiShield /> Security
              </button>
            </div>

          </div>
        </div>

        {/* Action Form Fields */}
        <div className="lg:col-span-8">
          <div className="glass-card rounded-3xl p-6 border border-white/5 min-h-[300px]">
            {activeTab === 'personal' ? (
              <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-5">
                <h3 className="text-lg font-display font-bold text-text border-b border-white/5 pb-2 mb-4">
                  Edit Personal Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Full Name"
                    type="text"
                    icon={FiUser}
                    error={profileErrors.name?.message}
                    {...registerProfile('name', {
                      required: 'Name is required',
                      minLength: { value: 3, message: 'Name must be at least 3 characters' }
                    })}
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    icon={FiPhone}
                    error={profileErrors.phone?.message}
                    {...registerProfile('phone', {
                      required: 'Phone number is required',
                      pattern: { value: /^[0-9]{10}$/, message: 'Phone must be a valid 10-digit number' }
                    })}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Email Address (Disabled)"
                      type="email"
                      icon={FiMail}
                      value={user?.email || ''}
                      disabled
                      className="bg-surface/20 text-text-muted border-slate-700/50 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-text-muted mt-1.5">
                      💡 To change your email address, please contact system support help desk.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-white/5">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={updatingProfile}
                    className="px-6 py-2.5 text-sm"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="space-y-5">
                <h3 className="text-lg font-display font-bold text-text border-b border-white/5 pb-2 mb-4">
                  Account Security
                </h3>
                <div className="space-y-4 max-w-md">
                  <Input
                    label="Current Password"
                    type="password"
                    icon={FiLock}
                    placeholder="••••••••"
                    error={passwordErrors.currentPassword?.message}
                    {...registerPassword('currentPassword', {
                      required: 'Current password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    icon={FiLock}
                    placeholder="••••••••"
                    error={passwordErrors.newPassword?.message}
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    icon={FiLock}
                    placeholder="••••••••"
                    error={passwordErrors.confirmPassword?.message}
                    {...registerPassword('confirmPassword', {
                      required: 'Confirm password is required',
                      validate: (value) => value === newPassword || 'Passwords do not match'
                    })}
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-white/5">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={updatingPassword}
                    className="px-6 py-2.5 text-sm"
                  >
                    Change Password
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
