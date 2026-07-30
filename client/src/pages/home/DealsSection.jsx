import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiArrowRight } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axios';
import Button from '../../components/common/Button';

const fetchPublicDeals = async () => {
  const response = await axiosInstance.get('/deals');
  return response.data;
};

const DealsSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['publicDeals'],
    queryFn: fetchPublicDeals,
    staleTime: 5 * 60 * 1000,
  });

  const deals = data?.data?.deals || [];

  const defaultDeal = {
    title: 'Deals of the Week',
    subtitle: 'Premium Hajj & Umrah Essentials',
    description: 'Get high-quality ihram belts, prayer mats, and travel essentials with up to 30% off this week. Premium quality products curated for your spiritual journey.',
    offerText: 'Limited Offer',
    buttonText: 'Shop Essentials',
    buttonLink: '/products',
    backgroundImage: { url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80' },
    productImage: { url: 'https://images.unsplash.com/photo-1609599006353-e629f1d2961f?w=600&q=80' }
  };

  const deal = deals.length > 0 ? deals[0] : defaultDeal;

  // Countdown timer to deal end date or midnight
  const getTargetTime = () => {
    if (deal?.endDate) {
      return new Date(deal.endDate).getTime();
    }
    const target = new Date();
    target.setHours(24, 0, 0, 0);
    return target.getTime();
  };

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!deal) return;
    const calcRemaining = () => Math.max(getTargetTime() - Date.now(), 0);
    setTimeLeft(calcRemaining());
    const interval = setInterval(() => {
      setTimeLeft(calcRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, [deal]);

  // If loading, render nothing — no empty spacing or layout shift
  if (isLoading) return null;

  const formatTime = (timeMs) => {
    const totalSecs = Math.floor(timeMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    };
  };

  const time = formatTime(timeLeft);

  return (
    <section className="py-16 bg-background transition-colors duration-300 border-t border-border">
      <div className="container-custom">
        <div className="relative rounded-3xl glass-card overflow-hidden glow-secondary p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Neon Glow spots */}
          <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[#B8860B]/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-[#14532D]/10 rounded-full blur-[120px]"></div>

          {/* Background image overlay */}
          {deal.backgroundImage?.url && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
              style={{ backgroundImage: `url('${deal.backgroundImage.url}')` }}
            />
          )}

          <div className="relative z-10 text-left space-y-6 lg:max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <FiClock className="animate-spin-slow" /> {deal.offerText || 'Special Offer'}
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-text leading-tight">
              {deal.title}
            </h2>

            <p className="text-text-muted leading-relaxed text-sm sm:text-base">
              {deal.description}
            </p>

            {/* Countdown timer widgets */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-xl bg-surface border border-border flex items-center justify-center text-2xl sm:text-3xl font-display font-bold text-text shadow-inner">
                  {time.hours}
                </div>
                <span className="text-[10px] uppercase font-bold text-text-muted mt-2 tracking-widest">Hrs</span>
              </div>
              <span className="text-2xl font-bold text-text mb-6">:</span>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-xl bg-surface border border-border flex items-center justify-center text-2xl sm:text-3xl font-display font-bold text-text shadow-inner">
                  {time.minutes}
                </div>
                <span className="text-[10px] uppercase font-bold text-text-muted mt-2 tracking-widest">Mins</span>
              </div>
              <span className="text-2xl font-bold text-text mb-6">:</span>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-xl bg-surface border border-border flex items-center justify-center text-2xl sm:text-3xl font-display font-bold text-text shadow-inner">
                  {time.seconds}
                </div>
                <span className="text-[10px] uppercase font-bold text-text-muted mt-2 tracking-widest">Secs</span>
              </div>
            </div>

            <div className="pt-4">
              <Link to={deal.buttonLink || '/products'}>
                <Button variant="primary" size="lg" className="flex items-center gap-2 group">
                  {deal.buttonText || 'Unlock Deals'}
                  <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating graphic card */}
          <div className="relative z-10 lg:w-96 w-full flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-surface rounded-3xl p-6 border border-border space-y-4"
            >
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-tr from-primary/30 to-accent/30 flex items-center justify-center relative overflow-hidden">
                {deal.offerText && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full">
                    {deal.offerText}
                  </div>
                )}
                {deal.productImage?.url ? (
                  <img src={deal.productImage.url} alt={deal.title} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-text font-display font-bold text-2xl opacity-90 uppercase tracking-widest">{deal.subtitle || deal.title}</span>
                )}
              </div>
              <div>
                <h3 className="font-display font-bold text-text text-xl">{deal.subtitle || deal.title}</h3>
                {deal.description && (
                  <p className="text-text-muted text-sm mt-1.5 line-clamp-2">{deal.description}</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
