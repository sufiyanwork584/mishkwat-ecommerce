import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiArrowLeft, FiMessageSquare, FiSend, FiTag, FiFolder } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../../features/authSlice';
import { blogApi } from '../../api/blogApi';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const BlogDetailPage = () => {
  const { id: slug } = useParams(); // URL path is /blog/:id where :id is the slug
  const queryClient = useQueryClient();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectUser);
  const [commentText, setCommentText] = useState('');

  // Fetch blog data
  const { data: blogResult, isLoading, isError } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => blogApi.getBlog(slug),
  });

  const post = blogResult?.data || blogResult?.data?.blog || null;
  const blogId = post?._id;

  // Fetch comments
  const { data: commentsResult } = useQuery({
    queryKey: ['blog-comments', blogId],
    queryFn: () => blogApi.getComments(blogId),
    enabled: !!blogId,
  });

  const comments = commentsResult?.data || [];

  // Mutation to post a new comment
  const createCommentMutation = useMutation({
    mutationFn: (commentData) => blogApi.createComment(blogId, commentData),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['blog-comments', blogId]);
      setCommentText('');
      toast.success(res.message || 'Comment posted successfully! It will show up once approved.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to post comment. Please try again.');
    }
  });

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    createCommentMutation.mutate({ content: commentText.trim() });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-background text-center py-20">
        <h2 className="text-2xl font-bold text-text mb-4">Article Not Found</h2>
        <p className="text-text-muted mb-8">The guide or post you are looking for does not exist or has been removed.</p>
        <Link to="/blogs">
          <Button variant="primary">Back to Guides</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-text pt-6 pb-20 transition-colors duration-300">
      <div className="container-custom max-w-4xl">
        
        {/* Back Link */}
        <div className="mb-6 text-left">
          <Link to="/blogs" className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-primary transition-colors">
            <FiArrowLeft size={14} /> Back to Guides & Articles
          </Link>
        </div>

        {/* Article Meta / Header */}
        <header className="mb-10 text-left space-y-4">
          {post.category && (
            <span className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 text-primary-light text-xs font-bold rounded-lg uppercase tracking-wider">
              {post.category.name}
            </span>
          )}
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-text leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-xs text-text-muted pt-2 border-b border-border pb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                {post.author?.name?.charAt(0).toUpperCase() || 'M'}
              </div>
              <div>
                <p className="font-semibold text-text">{post.author?.name || 'Mishkwat Staff'}</p>
                <p className="text-[10px] text-text-muted">Author</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pl-4 border-l border-border">
              <FiCalendar /> {formatDate(post.publishedAt)}
            </div>

            <div className="flex items-center gap-1.5 pl-4 border-l border-border">
              <FiClock /> {post.readingTime || 3} min read
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.image?.url && (
          <div className="rounded-2xl overflow-hidden aspect-[21/9] w-full mb-10 shadow-xl border border-border">
            <img
              src={post.image.url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Main Content Area */}
        <article className="prose prose-slate dark:prose-invert max-w-none mb-12 text-left leading-relaxed text-sm md:text-base space-y-6">
          <div 
            dangerouslySetInnerHTML={{ __html: post.content }} 
            className="text-text space-y-4 font-sans select-text"
          />
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center border-t border-b border-border py-4 mb-12 text-left">
            <span className="text-xs text-text-muted font-bold flex items-center gap-1">
              <FiTag /> Tags:
            </span>
            {post.tags.map((t) => (
              <Link
                key={t._id}
                to={`/blogs?tag=${t.slug}`}
                className="text-[10px] bg-surface hover:bg-primary/10 border border-border hover:border-primary text-text-muted hover:text-primary transition-all px-2.5 py-1 rounded-lg"
              >
                #{t.name}
              </Link>
            ))}
          </div>
        )}

        {/* Comments Section */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 text-left space-y-8">
          <h3 className="font-display font-bold text-xl text-text flex items-center gap-2 border-b border-border pb-4">
            <FiMessageSquare /> Discussion ({comments.length} Comments)
          </h3>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                  {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-text">{currentUser?.name}</p>
                  <p className="text-[10px] text-text-muted">Post a public comment</p>
                </div>
              </div>

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your thought, feedback or question..."
                rows="4"
                className="w-full bg-background border border-border rounded-xl p-3.5 text-sm text-text placeholder-text-muted outline-none focus:border-primary transition-all"
                required
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={createCommentMutation.isLoading}
                  className="flex items-center gap-1.5 py-2 px-5 text-xs font-bold"
                >
                  <FiSend /> Post Comment
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-background border border-border rounded-xl p-6 text-center">
              <p className="text-text-muted text-xs mb-3">Please sign in to join the conversation and post a comment.</p>
              <Link to="/login" className="text-primary font-semibold text-xs hover:underline">
                Sign In to Account
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="bg-background/40 border border-border rounded-xl p-4 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-text text-xs font-bold flex-shrink-0">
                  {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-text">{comment.user?.name || 'Anonymous'}</h5>
                    <span className="text-[10px] text-text-muted">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">{comment.content}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-xs text-text-muted text-center py-4">No comments yet. Be the first to start the discussion!</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default BlogDetailPage;
