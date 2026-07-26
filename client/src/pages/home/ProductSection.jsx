import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { productApi } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';
import Skeleton from '../../components/common/Skeleton';

const ProductSection = () => {
  const [activeTab, setActiveTab] = useState('featured');

  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: productApi.getFeatured
  });

  const { data: bestSellersData, isLoading: loadingBestSellers } = useQuery({
    queryKey: ['products', 'bestsellers'],
    queryFn: productApi.getBestSellers
  });

  const { data: newArrivalsData, isLoading: loadingNewArrivals } = useQuery({
    queryKey: ['products', 'newarrivals'],
    queryFn: productApi.getNewArrivals
  });

  const getProductsList = () => {
    let rawData;
    if (activeTab === 'featured') rawData = featuredData;
    else if (activeTab === 'bestsellers') rawData = bestSellersData;
    else rawData = newArrivalsData;

    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    return rawData.data?.products || rawData.products || [];
  };

  const getLoadingState = () => {
    if (activeTab === 'featured') return loadingFeatured;
    if (activeTab === 'bestsellers') return loadingBestSellers;
    return loadingNewArrivals;
  };

  const products = getProductsList().slice(0, 8); // show max 8 products on home page
  const isLoading = getLoadingState();

  const tabs = [
    { id: 'featured', label: 'Featured' },
    { id: 'bestsellers', label: 'Best Sellers' },
    { id: 'newarrivals', label: 'New Arrivals' }
  ];

  return (
    <section className="py-16 bg-background transition-colors duration-300">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="text-left">
            <span className="text-xs uppercase tracking-widest text-secondary font-bold mb-2 block">
              Trending Now
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-text">
              Discover Products
            </h2>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-surface border border-border self-start md:self-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-white bg-primary shadow-lg shadow-primary/30'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="w-full aspect-[4/5] rounded-2xl" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-text-muted">No products found in this collection.</p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <AnimatePresence mode="popLayout">
                {products.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
