import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiGrid, FiArrowRight } from 'react-icons/fi';
import { adminApi } from '../../api/adminApi';
import Skeleton from '../../components/common/Skeleton';

const CategoriesPage = () => {
  const { data: catsData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: adminApi.getCategories
  });

  const categories = catsData?.data?.categories || [];

  return (
    <div className="bg-background min-h-screen text-text py-12">
      <div className="container-custom">
        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary-light flex items-center justify-center border border-primary/20">
            <FiGrid className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-extrabold text-text">All Categories</h1>
            <p className="text-sm text-text-muted mt-1">Browse our wide selection of products by category.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 space-y-4">
                <Skeleton className="w-full h-32 rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-2xl border border-white/5">
            <p className="text-text-muted font-semibold mb-2">No categories found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((cat, index) => {
              const subcategories = cat.subcategories || [];
              const hasSubcategories = subcategories.length > 0;

              return (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="glass-card rounded-2xl overflow-hidden border border-white/5"
                >
                  {/* Parent Category Header */}
                  <Link 
                    to={`/products?category=${cat.slug}`} 
                    className="flex items-center gap-5 p-6 hover:bg-dark-surface/30 transition-colors group"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                      {cat.image?.url ? (
                        <img 
                          src={cat.image.url} 
                          alt={cat.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <FiGrid className="w-8 h-8 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-xl font-display font-bold text-text group-hover:text-primary-light transition-colors">
                        {cat.name}
                      </h2>
                      {cat.description && (
                        <p className="text-sm text-text-muted mt-1 line-clamp-2">{cat.description}</p>
                      )}
                      <p className="text-xs text-text-muted mt-2">
                        {cat.productCount || 0} Products • {subcategories.length} Sub-categories
                      </p>
                    </div>
                    <FiArrowRight className="text-text-muted group-hover:text-primary-light group-hover:translate-x-1 transition-all flex-shrink-0" size={20} />
                  </Link>

                  {/* Subcategories Grid */}
                  {hasSubcategories && (
                    <div className="border-t border-border/40 p-6 bg-background/30 dark:bg-dark-surface/10">
                      <p className="text-[10px] uppercase tracking-widest text-text-muted mb-4 font-bold">Sub-categories</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {subcategories.map((sub) => (
                          <Link
                            key={sub._id}
                            to={`/products?category=${sub.slug}`}
                            className="flex items-center gap-3 p-3 rounded-xl bg-surface dark:bg-dark-surface/40 hover:bg-primary/10 border border-border/50 dark:border-white/5 hover:border-primary/20 transition-all group/sub"
                          >
                            {sub.image?.url ? (
                              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                <img src={sub.image.url} alt={sub.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                                <FiGrid className="w-4 h-4 text-primary/40" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-text-muted group-hover/sub:text-primary transition-colors line-clamp-1">
                              {sub.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
