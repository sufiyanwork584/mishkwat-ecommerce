import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import { authApi } from '../../api/authApi';
import { setCredentials } from '../../features/authSlice';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleBtnRef = useRef(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' }
  });

  const password = watch('password');

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    try {
      const response = await authApi.googleLogin(credentialResponse.credential);
      
      dispatch(setCredentials({
        user: response.data.user,
        accessToken: response.data.accessToken
      }));
      
      toast.success(response.message || 'Signed up with Google!');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google sign up failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign up failed. Please try again.');
    setIsGoogleLoading(false);
  };

  const handleCustomGoogleClick = () => {
    if (googleBtnRef.current) {
      const btn = googleBtnRef.current.querySelector('[role="button"]')
                || googleBtnRef.current.querySelector('div[tabindex]')
                || googleBtnRef.current.querySelector('div');
      if (btn) btn.click();
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password
      });
      
      toast.success(response.message || 'Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
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

          <div className="relative text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-text mb-2">Create Account</h2>
            <p className="text-text-muted text-sm">Join Mishkwat and start shopping</p>
          </div>

          {/* Google Sign Up Button */}
          <div className="relative mb-6">
            <button
              id="google-signup-btn"
              type="button"
              onClick={handleCustomGoogleClick}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-700 bg-white/5 hover:bg-white/10 text-text font-medium transition-all duration-200 hover:border-slate-500 hover:shadow-lg hover:shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <GoogleIcon />
              )}
              <span>{isGoogleLoading ? 'Signing up...' : 'Sign up with Google'}</span>
            </button>
            {/* Hidden Google Login rendered by the library */}
            <div
              ref={googleBtnRef}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, overflow: 'hidden', pointerEvents: 'auto' }}
              aria-hidden="true"
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                width="400"
                text="signup_with"
                shape="rectangular"
                useOneTap={false}
              />
            </div>
          </div>

          {/* OR Divider */}
          <div className="relative flex items-center mb-6">
            <div className="flex-1 border-t border-slate-700"></div>
            <span className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">or</span>
            <div className="flex-1 border-t border-slate-700"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              icon={FiUser}
              error={errors.name?.message}
              {...register('name', {
                required: 'Full name is required',
                minLength: {
                  value: 3,
                  message: 'Name must be at least 3 characters'
                }
              })}
            />

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

            <Input
              label="Phone Number"
              type="tel"
              placeholder="1234567890"
              icon={FiPhone}
              error={errors.phone?.message}
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Phone number must be a valid 10-digit number'
                }
              })}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={FiLock}
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-[38px] text-text-muted hover:text-text transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={FiLock}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Confirm password is required',
                  validate: (value) => value === password || 'Passwords do not match'
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-[38px] text-text-muted hover:text-text transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              className="mt-6 py-3"
            >
              Sign Up
            </Button>
          </form>

          <p className="relative text-center mt-6 text-sm text-text-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-secondary hover:text-text font-semibold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

