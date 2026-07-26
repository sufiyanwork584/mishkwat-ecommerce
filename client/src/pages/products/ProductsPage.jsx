import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiGrid, FiList, FiChevronDown } from 'react-icons/fi';
import { productApi } from '../../api/productApi';
import { adminApi } from '../../api/adminApi';
import ProductCard from '../../components/product/ProductCard';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import Pagination from '../../components/common/Pagination';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid | list

  // Sync state with URL params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const inStock = searchParams.get('inStock') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page')) || 1;

  // Local filter states (pre-apply)
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localBrand, setLocalBrand] = useState(searchParams.get('brand') || '');

  // Reset local inputs when URL query changes
  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
    setLocalBrand(searchParams.get('brand') || '');
  }, [minPrice, maxPrice, searchParams]);

  // Fetch all categories (to translate names/slugs or list filters)
  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn: adminApi.getCategories
  });

  const categories = catsData?.data?.categories || [];

  // Find category database ID based on URL slug — check both parents and subcategories
  let activeCategoryObj = categories?.find(c => c.slug === category);
  if (!activeCategoryObj) {
    // Check inside subcategories
    for (const cat of categories) {
      const sub = (cat.subcategories || []).find(s => s.slug === category);
      if (sub) { activeCategoryObj = sub; break; }
    }
  }
  const categoryId = activeCategoryObj?._id || '';

  // API parameters build
  const queryParams = {
    page,
    limit: 12,
    sort,
    ...(search && { search }),
    ...(categoryId && { category: categoryId }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    ...(rating && { rating }),
    ...(inStock && { inStock }),
    ...(searchParams.get('brand') && { brand: searchParams.get('brand') })
  };

  // Fetch products
  const { data: productsResult, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productApi.getProducts(queryParams),
    placeholderData: (previousData) => previousData
  });

  const productsData = productsResult?.data || { products: [], pagination: { page: 1, limit: 12, total: 0, pages: 1 } };
  const products = productsData.products || [];
  const pagination = productsData.pagination;

  // Handler to update specific filter
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1'); // reset page to 1
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const applyPriceAndBrandFilter = (e) => {
    e?.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    
    if (localMinPrice) newParams.set('minPrice', localMinPrice);
    else newParams.delete('minPrice');

    if (localMaxPrice) newParams.set('maxPrice', localMaxPrice);
    else newParams.delete('maxPrice');

    if (localBrand) newParams.set('brand', localBrand);
    else newParams.delete('brand');

    setSearchParams(newParams);
    setIsMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    setSearchParams(search ? { search } : {});
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalBrand('');
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterSidebar = (
    <div className="space-y-8 text-left">
      {/* Categories */}
      <div>
        <h4 className="text-sm uppercase tracking-wider font-bold text-text mb-4">Categories</h4>
        <div className="space-y-2.5">
          <button
            onClick={() => updateFilter('category', '')}
            className={`w-full text-left text-sm py-1.5 px-2 rounded-lg transition-colors ${
              !category ? 'bg-primary/10 text-primary-light font-semibold' : 'text-text-muted hover:text-text'
            }`}
          >
            All Categories
          </button>
          {categories?.map((cat) => {
            const subcategories = cat.subcategories || [];
            const isParentActive = category === cat.slug;
            const hasSubcategories = subcategories.length > 0;

            return (
              <div key={cat._id} className="space-y-1">
                <button
                  onClick={() => updateFilter('category', cat.slug)}
                  className={`w-full text-left text-sm py-1.5 px-2 rounded-lg transition-colors flex justify-between items-center ${
                    isParentActive ? 'bg-primary/10 text-primary-light font-semibold' : 'text-text-muted hover:text-text'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>

                {hasSubcategories && (
                  <div className="pl-4 space-y-1.5 border-l border-white/5 ml-2 mt-1">
                    {subcategories.map((sub) => {
                      const isSubActive = category === sub.slug;
                      return (
                        <button
                          key={sub._id}
                          onClick={() => updateFilter('category', sub.slug)}
                          className={`w-full text-left text-xs py-1 px-2 rounded-md transition-colors ${
                            isSubActive 
                              ? 'bg-primary/20 text-primary-light font-semibold' 
                              : 'text-text-muted/70 hover:text-text'
                          }`}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="text-sm uppercase tracking-wider font-bold text-text mb-4">Brand</h4>
        <input
          type="text"
          value={localBrand}
          onChange={(e) => setLocalBrand(e.target.value)}
          placeholder="Filter by brand..."
          className="w-full bg-surface/50 border border-slate-700 rounded-lg text-text placeholder-slate-500 px-3.5 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        />
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm uppercase tracking-wider font-bold text-text mb-4">Price Range (₹)</h4>
        <div className="flex gap-3">
          <input
            type="number"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            placeholder="Min"
            className="w-1/2 bg-surface/50 border border-slate-700 rounded-lg text-text placeholder-slate-500 px-3 py-2 text-sm focus:border-primary outline-none"
          />
          <input
            type="number"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-1/2 bg-surface/50 border border-slate-700 rounded-lg text-text placeholder-slate-500 px-3 py-2 text-sm focus:border-primary outline-none"
          />
        </div>
        <Button
          onClick={applyPriceAndBrandFilter}
          variant="outline"
          size="sm"
          className="w-full mt-3.5 text-xs py-2"
        >
          Apply Filters
        </Button>
      </div>

      {/* Minimum Rating */}
      <div>
        <h4 className="text-sm uppercase tracking-wider font-bold text-text mb-4">Customer Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((stars) => (
            <label key={stars} className="flex items-center text-text-muted hover:text-text cursor-pointer select-none text-sm">
              <input
                type="radio"
                name="ratingFilter"
                checked={rating === String(stars)}
                onChange={() => updateFilter('rating', rating === String(stars) ? '' : String(stars))}
                className="w-4 h-4 text-primary bg-surface border-slate-700 focus:ring-0 mr-3"
              />
              {stars}★ & above
            </label>
          ))}
        </div>
      </div>

      {/* Stock Status */}
      <div>
        <h4 className="text-sm uppercase tracking-wider font-bold text-text mb-4">Availability</h4>
        <label className="flex items-center text-text-muted hover:text-text cursor-pointer select-none text-sm">
          <input
            type="checkbox"
            checked={inStock === 'true'}
            onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
            className="w-4 h-4 rounded text-primary bg-surface border-slate-700 focus:ring-0 mr-3"
          />
          In Stock Only
        </label>
      </div>

      <Button
        onClick={clearFilters}
        variant="danger"
        fullWidth
        className="text-xs py-2.5"
      >
        Reset All Filters
      </Button>
    </div>
  );

  return (
    <div className="bg-background min-h-screen text-text pt-8 pb-16">
      <div className="container-custom">
        {/* Breadcrumbs & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 text-left">
          <div>
            <h1 className="text-3xl font-display font-extrabold text-text">
              {search ? `Search results for "${search}"` : 'Browse Products'}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Showing {products.length} of {pagination.total} products
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center border border-border rounded-lg p-0.5 bg-surface">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary text-text' : 'text-text-muted hover:text-text'}`}
                aria-label="Grid view"
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary text-text' : 'text-text-muted hover:text-text'}`}
                aria-label="List view"
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>

            {/* Sorting */}
            <div className="relative flex items-center bg-surface border border-border rounded-lg px-3 py-2">
              <span className="text-xs text-text-muted font-medium mr-2">Sort:</span>
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="bg-transparent text-sm text-text font-semibold outline-none cursor-pointer pr-4"
              >
                <option value="newest" className="bg-surface">Newest Arrivals</option>
                <option value="price_asc" className="bg-surface">Price: Low to High</option>
                <option value="price_desc" className="bg-surface">Price: High to Low</option>
                <option value="popularity" className="bg-surface">Popularity</option>
                <option value="rating" className="bg-surface">Average Rating</option>
              </select>
            </div>

            {/* Mobile Filter Button */}
            <Button
              onClick={() => setIsMobileFiltersOpen(true)}
              variant="outline"
              className="lg:hidden flex items-center gap-2"
            >
              <FiFilter /> Filters
            </Button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 border-r border-border pr-6">
            {filterSidebar}
          </aside>
 
          {/* Products Grid / List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="w-full aspect-[4/5] rounded-2xl animate-pulse" />
                    <Skeleton className="h-5 w-2/3 animate-pulse" />
                    <Skeleton className="h-4 w-1/3 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-surface border border-border rounded-2xl">
                <p className="text-text-muted font-semibold mb-2">No matching items found</p>
                <p className="text-sm text-text-muted mb-6">Try loosening your price filters, category scopes, or search strings.</p>
                <Button onClick={clearFilters} variant="primary">
                  Reset Search & Filters
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product._id} className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-left">
                    <div className="w-full sm:w-40 h-48 sm:h-40 flex-shrink-0 bg-surface/50 rounded-xl overflow-hidden p-2 relative">
                      <img
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/150'}
                        alt={product.title}
                        className="w-full h-full object-contain"
                      />
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                          <span className="text-text font-bold text-sm tracking-wider">OUT OF STOCK</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <span className="text-[10px] uppercase tracking-wider text-[#00CEC9] font-semibold">{product.brand}</span>
                      <h3 className="font-display font-bold text-text text-xl">{product.title}</h3>
                      <p className="text-sm text-text-muted line-clamp-2">{product.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 text-sm">★ {product.avgRating || 0}</span>
                        <span className="text-xs text-text-muted">({product.numReviews || 0} reviews)</span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 w-full sm:w-auto flex-shrink-0 border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-6">
                      <div className="text-left sm:text-right">
                        <p className="text-2xl font-bold text-text font-[Outfit]">
                          ₹{product.salePrice && product.salePrice < product.price ? product.salePrice : product.price}
                        </p>
                        {product.salePrice && product.salePrice < product.price && (
                          <p className="text-xs text-text-muted line-through font-[Outfit]">₹{product.price}</p>
                        )}
                      </div>
                      <Link to={`/product/${product.slug}`} className="w-full">
                        <Button variant="primary" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-background z-50 p-6 overflow-y-auto border-l border-border lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <h3 className="font-display font-bold text-text text-lg flex items-center gap-2">
                  <FiFilter /> Filters
                </h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              {filterSidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsPage;
