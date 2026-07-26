import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { productApi } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';
import Skeleton from '../../components/common/Skeleton';
import Button from '../../components/common/Button';
import { FiChevronLeft, FiFolder } from 'react-icons/fi';

const CategoryPage = () => {
  const { slug } = useParams();

  // 1. Fetch category details by slug
  const { data: categoryData, isLoading: loadingCat } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => adminApi.getCategory(slug)
  });

  const categoryObj = categoryData?.data?.category;
  const categoryId = categoryObj?._id;

  // 2. Fetch products under categoryId
  const { data: productsResult, isLoading: loadingProds, error } = useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: () => productApi.getProducts({ category: categoryId, limit: 20 }),
    enabled: !!categoryId
  });

  const products = productsResult?.data?.products || [];

  if (loadingCat || (categoryId && loadingProds)) {
    return (
      <div className="container-custom section min-h-screen text-text-muted space-y-8">
        <Skeleton className="h-12 w-1/3 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="w-full aspect-square rounded-2xl" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!categoryObj) {
    return (
      <div className="container-custom section min-h-[70vh] flex flex-col items-center justify-center">
        <FiFolder className="w-16 h-16 text-text-muted mb-4" />
        <h2 className="text-2xl font-bold text-text mb-2">Category Not Found</h2>
        <p className="text-text-muted mb-6">The specified collection cannot be loaded.</p>
        <Link to="/products">
          <Button variant="primary">Browse All Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background text-text py-8 min-h-screen">
      <div className="container-custom text-left space-y-8">
        {/* Back Link */}
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors">
          <FiChevronLeft /> Back to Catalog
        </Link>

        {/* Banner Details */}
        <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden bg-gradient-to-r from-primary/25 to-secondary/25 border border-white/5 flex flex-col justify-center">
          <div className="absolute inset-0 bg-dark-bg/60 backdrop-blur-sm -z-10" />
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-text tracking-wide">
            {categoryObj.name}
          </h1>
          <p className="text-text-muted mt-2 text-sm md:text-base max-w-xl">
            Explore our curated inventory of verified premium items, grade tested, and delivered express.
          </p>
        </div>

        {/* Grid Area */}
        <div className="min-h-[400px]">
          {products.length === 0 ? (
            <div className="glass-card rounded-2xl py-20 text-center border border-white/5">
              <p className="text-text-muted font-semibold mb-2">No items found</p>
              <p className="text-sm text-text-muted mb-6">Check back soon for new arrivals in this collection.</p>
              <Link to="/products">
                <Button variant="primary">Browse All Products</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
