import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '../../api/adminApi';
import Skeleton from '../../components/common/Skeleton';

import { FiGrid, FiArrowRight } from 'react-icons/fi';

const CategorySection = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: adminApi.getCategories
  });

  const categories = data?.data?.categories || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background transition-colors duration-300">
        <div className="container-custom">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="h-6 w-32 bg-surface rounded mb-3 skeleton"></div>
            <div className="h-10 w-64 bg-surface rounded skeleton"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-surface/40 border border-white/5 p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background transition-colors duration-300 border-t border-white/5">
      <div className="container-custom">
        <div className="flex flex-col items-center mb-12 text-center">
          <span className="text-xs uppercase tracking-widest text-primary-light font-bold mb-2">
            Browse Collections
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-text">
            Shop By Category
          </h2>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
        >
          {categories.map((cat) => {
            const subcategories = cat.subcategories || [];
            const hasSubcategories = subcategories.length > 0;

            return (
              <motion.div key={cat._id} variants={itemVariants}>
                <div className="glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-300 group">
                  {/* Parent category header with image */}
                  <Link 
                    to={`/products?category=${cat.slug}`}
                    className="block relative"
                  >
                    <div className="h-40 overflow-hidden relative">
                      {cat.image?.url ? (
                        <>
                          <img 
                            src={cat.image.url} 
                            alt={cat.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] via-[#0F0F1A]/60 to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <FiGrid className="w-12 h-12 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-display font-bold text-white drop-shadow-lg">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-white/60 mt-1">
                          {cat.productCount || 0} Products
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Subcategories list */}
                  {hasSubcategories && (
                    <div className="p-4 border-t border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3 font-bold">Sub-categories</p>
                      <div className="flex flex-wrap gap-2">
                        {subcategories.map((sub) => (
                          <Link
                            key={sub._id}
                            to={`/products?category=${sub.slug}`}
                            className="text-xs bg-surface hover:bg-primary/20 text-text-muted hover:text-primary-light px-3 py-1.5 rounded-lg border border-white/5 hover:border-primary/20 transition-all font-medium"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View all link */}
                  <Link 
                    to={`/products?category=${cat.slug}`}
                    className="flex items-center justify-between px-4 py-3 border-t border-white/5 text-xs text-text-muted hover:text-primary-light transition-colors group/link"
                  >
                    <span className="font-semibold">View all {cat.name}</span>
                    <FiArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Categories Link */}
        <div className="flex justify-center mt-10">
          <Link 
            to="/categories" 
            className="btn-secondary flex items-center gap-2"
          >
            View All Categories <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
