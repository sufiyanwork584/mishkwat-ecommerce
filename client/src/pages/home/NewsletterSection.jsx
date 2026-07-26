import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axios';
import Button from '../../components/common/Button';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/newsletter/subscribe', { email });
      toast.success(response.data?.message || 'Thank you for subscribing to our newsletter!');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 bg-background transition-colors duration-300 relative overflow-hidden border-t border-white/5">
      {/* Visual background flares */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="container-custom relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary-light flex items-center justify-center border border-primary/20 mx-auto text-2xl font-bold animate-float">
            <FiMail />
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-text">
            Join the Mishkwat Network
          </h2>

          <p className="text-text-muted text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Subscribe to receive launch announcements, early-access notifications, discount codes, and tech-grade reviews.
          </p>

          <form onSubmit={handleSubscribe} className="pt-4 max-w-md mx-auto">
            <div className="relative flex items-center p-1 rounded-xl bg-surface/50 border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <div className="pl-3.5 text-text-muted">
                <FiMail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full bg-transparent pl-3 pr-4 py-2.5 text-sm text-text placeholder-slate-500 focus:outline-none"
              />
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="px-4 py-2 flex items-center justify-center gap-1.5"
              >
                <span className="hidden sm:inline">Subscribe</span>
                <FiSend className="w-4 h-4" />
              </Button>
            </div>
          </form>

          <p className="text-[11px] text-text-muted font-sans tracking-wide">
            Zero spam. Unsubscribe anytime. View our{' '}
            <a href="/privacy" className="hover:text-text transition-colors underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
