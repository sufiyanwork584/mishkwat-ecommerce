import React from 'react';

const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
    accent: 'bg-accent/10 text-accent border border-accent/20',
    success: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400',
    error: 'bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:text-rose-400',
    info: 'bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400',
    outline: 'border border-border text-text-muted',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
