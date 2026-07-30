import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { authApi } from '../../api/authApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword(data.email);
      toast.success(response.message || 'Password reset link sent to your email.');
      if (response.resetUrl) {
        setDevResetUrl(response.resetUrl);
      }
      setIsSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-card rounded-2xl p-8 relative overflow-hidden shadow-2xl">
          {/* Decorative glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>

          <div className="relative mb-8 text-center">
            <h2 className="text-3xl font-display font-bold text-text mb-2">Forgot Password</h2>
            <p className="text-text-muted text-sm">
              {isSent 
                ? 'Check your inbox for the reset link' 
                : 'Enter your email address and we\'ll send you a password reset link'
              }
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                icon={FiMail}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="mt-4 py-3"
              >
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-5 relative">
              <div className="w-16 h-16 bg-success/15 text-success rounded-full flex items-center justify-center mx-auto text-2xl font-bold animate-pulse-glow">
                ✓
              </div>
              <p className="text-text-muted text-sm leading-relaxed">
                We have sent a secure link to reset your password. If you don't receive it in a few minutes, please check your spam folder.
              </p>

              {devResetUrl && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-left space-y-2">
                  <p className="text-xs font-bold text-primary-light uppercase tracking-wider">Development Fallback Link:</p>
                  <p className="text-xs text-text-muted">Since email service is not configured locally, click below to reset your password:</p>
                  <a
                    href={devResetUrl}
                    className="block text-xs font-semibold text-primary hover:underline break-all"
                  >
                    {devResetUrl}
                  </a>
                </div>
              )}

              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setIsSent(false);
                  setDevResetUrl('');
                }}
              >
                Resend Email
              </Button>
            </div>
          )}

          <div className="relative text-center mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
            >
              <FiArrowLeft /> Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
