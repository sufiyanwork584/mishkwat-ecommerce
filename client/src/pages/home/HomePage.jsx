import React from 'react';
import HeroSection from './HeroSection';
import CategorySection from './CategorySection';
import ProductSection from './ProductSection';
import DealsSection from './DealsSection';
import CustomerReviewsSection from './CustomerReviewsSection';
import SEO from '../../components/common/SEO';

const HomePage = () => {
  return (
    <div className="bg-background text-text transition-colors duration-300">
      <SEO 
        title="Mishkwat - Premium Islamic & Hajj Products" 
        description="Discover and shop the absolute best collection of Hajj essentials, Islamic attire, and premium products on Mishkwat."
      />
      {/* 1. Hero Carousel */}
      <HeroSection />

      {/* 2. Shop by Category */}
      <CategorySection />

      {/* 3. Discover Products (Featured, Best Sellers, New Arrivals) */}
      <ProductSection />

      {/* 4. Limited Time Deals */}
      <DealsSection />

      {/* 5. Customer Reviews / Testimonials */}
      <CustomerReviewsSection />
    </div>
  );
};

export default HomePage;
