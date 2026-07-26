import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiSearch, FiCalendar, FiClock, FiUser, FiArrowRight, FiTag, FiFolder } from 'react-icons/fi';
import { blogApi } from '../../api/blogApi';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import Pagination from '../../components/common/Pagination';

const BlogsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'newest';

  // Sync search input with search URL params on change
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Fetch blogs query
  const queryParams = {
    page,
    limit: 6,
    sort,
    ...(category && { category }),
    ...(tag && { tag }),
    ...(search && { search }),
  };

  const { data: blogsResult, isLoading } = useQuery({
    queryKey: ['blogs', queryParams],
    queryFn: () => blogApi.getBlogs(queryParams),
    keepPreviousData: true,
  });

  // Fetch categories query
  const { data: categoriesResult } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: blogApi.getCategories,
  });

  // Fetch tags query
  const { data: tagsResult } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: blogApi.getTags,
  });

  const blogsData = blogsResult?.data || [];
  const pagination = blogsResult?.pagination || { page: 1, limit: 6, total: 0, pages: 1 };
  const categories = categoriesResult?.data || [];
  const tags = tagsResult?.data || [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', searchQuery);
  };

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

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-background min-h-screen text-text pt-8 pb-16 transition-colors duration-300">
      <div className="container-custom">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-primary font-bold mb-2.5 block">
            Mishkwat Insights
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-text mb-4">
            Knowledge & Spiritual Guides
          </h1>
          <p className="text-text-muted text-sm md:text-base leading-relaxed">
            Read expert packing checklists, spiritual histories of sacred places, and authentic step-by-step guides for your Hajj and Umrah journeys.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Blog Feed */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Search and Sort Mobile Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface border border-border p-4 rounded-2xl shadow-sm">
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text placeholder-text-muted focus:border-primary outline-none"
                />
              </form>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-text-muted">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold text-text outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Active Filters Indicators */}
            {(category || tag || search) && (
              <div className="flex flex-wrap gap-2 items-center text-left">
                <span className="text-xs text-text-muted font-medium mr-1">Active filters:</span>
                {category && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary-light text-xs font-semibold rounded-lg">
                    <FiFolder size={12} /> Category: {category}
                    <button onClick={() => updateFilter('category', '')} className="hover:text-white font-bold ml-1">×</button>
                  </span>
                )}
                {tag && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 text-emerald-400 text-xs font-semibold rounded-lg">
                    <FiTag size={12} /> Tag: {tag}
                    <button onClick={() => updateFilter('tag', '')} className="hover:text-white font-bold ml-1">×</button>
                  </span>
                )}
                {search && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border text-text-muted text-xs font-semibold rounded-lg">
                    <FiSearch size={12} /> Search: "{search}"
                    <button onClick={() => updateFilter('search', '')} className="hover:text-text font-bold ml-1">×</button>
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-red-500 hover:text-red-400 hover:underline transition-all px-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Grid display */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl overflow-hidden border border-border flex flex-col space-y-4 p-4">
                    <Skeleton className="w-full aspect-[16/10] rounded-xl animate-pulse" />
                    <Skeleton className="h-6 w-3/4 animate-pulse" />
                    <Skeleton className="h-4 w-full animate-pulse" />
                    <Skeleton className="h-4 w-2/3 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : blogsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-surface border border-border rounded-2xl p-6">
                <p className="text-text-muted font-bold mb-2">No articles found</p>
                <p className="text-xs text-text-muted mb-6">We couldn't find any articles matching your search query or filters.</p>
                <Button onClick={handleClearFilters} variant="primary">
                  Reset Feed
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blogsData.map((post) => (
                  <motion.article
                    key={post._id}
                    className="glass-card rounded-2xl overflow-hidden border border-border flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 text-left"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Featured Image */}
                    <Link to={`/blog/${post.slug}`} className="block overflow-hidden relative aspect-[16/10] bg-surface/50">
                      <img
                        src={post.image?.url || 'https://placehold.co/600x400/1C1C1C/B8860B?text=Mishkwat+Insights'}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      {post.category && (
                        <span className="absolute top-4 left-4 bg-primary/90 text-white backdrop-blur-sm text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md shadow-md">
                          {post.category.name}
                        </span>
                      )}
                    </Link>

                    {/* Content Area */}
                    <div className="p-6 flex flex-col flex-grow space-y-4">
                      {/* Meta information */}
                      <div className="flex items-center gap-4 text-[11px] text-text-muted">
                        <span className="flex items-center gap-1">
                          <FiCalendar /> {formatDate(post.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock /> {post.readingTime || 3} min read
                        </span>
                      </div>

                      {/* Title */}
                      <Link to={`/blog/${post.slug}`} className="group block">
                        <h3 className="font-display font-bold text-xl text-text line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                      </Link>

                      {/* Excerpt */}
                      <p className="text-text-muted text-xs md:text-sm line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* Author & CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                            {post.author?.name?.charAt(0).toUpperCase() || 'M'}
                          </div>
                          <span className="text-[11px] text-text-muted font-medium">
                            {post.author?.name || 'Mishkwat Staff'}
                          </span>
                        </div>

                        <Link to={`/blog/${post.slug}`} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
                          Read More <FiArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pt-8 flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

          </div>

          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-8 text-left">
            
            {/* Categories Widget */}
            <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
              <h4 className="text-sm font-display font-extrabold text-text uppercase tracking-wider mb-4 border-b border-border pb-2">
                Categories
              </h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`w-full text-left text-xs py-2 px-3 rounded-lg transition-colors flex justify-between items-center ${
                    !category ? 'bg-primary/10 text-primary-light font-semibold' : 'text-text-muted hover:text-text hover:bg-surface/50'
                  }`}
                >
                  <span>All Articles</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => updateFilter('category', cat.slug)}
                    className={`w-full text-left text-xs py-2 px-3 rounded-lg transition-colors flex justify-between items-center ${
                      category === cat.slug ? 'bg-primary/10 text-primary-light font-semibold' : 'text-text-muted hover:text-text hover:bg-surface/50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[9px] bg-border px-1.5 py-0.5 rounded-full text-text-muted font-bold">
                      {cat.blogCount || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Widget */}
            <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
              <h4 className="text-sm font-display font-extrabold text-text uppercase tracking-wider mb-4 border-b border-border pb-2">
                Trending Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => updateFilter('tag', t.slug)}
                    className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all ${
                      tag === t.slug
                        ? 'bg-accent/15 border-accent text-emerald-400 font-semibold'
                        : 'bg-background border-border text-text-muted hover:text-text hover:border-text-muted'
                    }`}
                  >
                    #{t.name}
                  </button>
                ))}
                {tags.length === 0 && (
                  <p className="text-xs text-text-muted">No tags available.</p>
                )}
              </div>
            </div>

          </aside>
        </div>

      </div>
    </div>
  );
};

export default BlogsPage;
