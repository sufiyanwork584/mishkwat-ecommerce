import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiPercent } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axios';
import Button from '../../components/common/Button';

const fetchBanners = async () => {
  const res = await axiosInstance.get('/banners');
  return res.data;
};

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['publicBanners'],
    queryFn: fetchBanners,
    staleTime: 5 * 60 * 1000,
  });

  const bannerList = data?.data?.banners || [];

  const slides = bannerList.length > 0 ? bannerList.map(banner => ({
    image: banner.image?.url,
    title: banner.title,
    subtitle: banner.subtitle || 'Special Offer',
    description: banner.subtitle || banner.title || '',
    cta: banner.buttonText || 'Shop Now',
    link: banner.buttonUrl || banner.link || '/',
    bg: 'from-background to-surface',
    accent: 'from-primary to-accent'
  })) : [
    {
      image: '/images/hero-bg-hq.webp',
      title: (
        <>
          Branding
          <br className="block sm:hidden" />
          <span className="sm:inline"> & </span>
          Customization
        </>
      ),
      subtitle: 'Save Big on Bulk Orders',
      description: 'Personalise Hajj & Umrah guides | with your Brand Name. | Get upto 60% Discount on Bulk Orders.',
      cta: 'Bulk Order',
      link: `https://wa.me/${import.meta.env.VITE_ADMIN_PHONE || '917770032919'}?text=${encodeURIComponent('Hi, I am interested in Branding & Customization.')}`,
      bg: 'from-background to-surface',
      accent: 'from-primary to-accent'
    }
  ];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Handle slide index bounds safety if active slides change dynamically
  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [slides.length, current]);

  return (
    <section className="relative bg-background overflow-hidden transition-colors duration-300">
      {/* Dynamic Background Gradients */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className={`absolute inset-0 bg-gradient-to-br ${slides[current].bg}`}
        />
      </AnimatePresence>

      {/* Grid Mesh lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-text/5 via-transparent to-transparent"></div>

      {/* ===== MOBILE: Image shown as full-width block (visible below md) ===== */}
      <div className="block md:hidden relative w-full">
        <img
          src={slides[current].image}
          alt={typeof slides[current].title === 'string' ? slides[current].title : 'Promo Banner'}
          className="w-full h-[350px] object-cover"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
        />
      </div>

      {/* ===== DESKTOP: Original background image (visible md and above) ===== */}
      <div
        className="hidden md:block absolute inset-y-0 left-0 right-[-15%] lg:right-[-28%] bg-cover bg-right bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url('${slides[current].image}')`,
          imageRendering: '-webkit-optimize-contrast'
        }}
      />

      {/* Content — on desktop this overlaps the bg image; on mobile it sits below the image */}
      <div className="relative z-10 md:min-h-[62vh] lg:min-h-[70vh] md:flex md:items-center">
        <div className="container-custom py-8 md:py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Content Box on the Left */}
          <div className="sm:pt-4 mt-[-400px] lg:mt-0 lg:col-span-7 text-left space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-border">
                  <FiPercent className="text-primary text-sm" />
                  <span className="text-xs font-semibold tracking-wider uppercase text-text-muted">
                    {slides[current].subtitle}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-text leading-tight">
                  The{' '}
                  <span className={`bg-gradient-to-r ${slides[current].accent} bg-clip-text text-transparent`}>
                    {slides[current].title}
                  </span>
                </h1>

                <div className="text-base sm:text-lg text-text-muted max-w-xl leading-relaxed">
                  <p className="text-base sm:text-lg text-text-muted max-w-xl leading-relaxed">
                    {(slides[current].description || '').split("|").map((line, index, arr) => (
                      <React.Fragment key={index}>
                        {line}
                        {index < arr.length - 1 && (
                          <>
                            <br className="block sm:hidden" />
                            <span className="hidden sm:inline"> </span>
                          </>
                        )}
                      </React.Fragment>
                    ))}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
                  {slides[current].link.startsWith('http') ? (
                    <a href={slides[current].link} target="_blank" rel="noopener noreferrer">
                      <Button variant="primary" size="md" className="flex items-center gap-2 group">
                        {slides[current].cta}
                        <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </a>
                  ) : (
                    <Link to={slides[current].link}>
                      <Button variant="primary" size="md" className="flex items-center gap-2 group">
                        {slides[current].cta}
                        <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  )}
                  <Link to="/products">
                    <Button variant="outline" size="md">
                      View Catalog
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Empty column on the right side to let the background image's products shine through clearly */}
          <div className="lg:col-span-5 hidden lg:block" />
        </div>
      </div>

      {/* Slide Indicators - only visible if there are multiple slides */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2 rounded-full transition-all duration-300 ${current === index ? 'w-8 bg-primary glow-primary' : 'w-2 bg-border'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
