import React from 'react';

export const SkeletonBase = ({ className = '' }) => (
  <div className={`skeleton rounded-md ${className}`} />
);

export const ProductCardSkeleton = () => (
  <div className="glass-card rounded-2xl overflow-hidden p-4 h-full flex flex-col">
    <SkeletonBase className="w-full h-48 sm:h-56 rounded-xl mb-4" />
    <SkeletonBase className="w-1/4 h-4 mb-2" />
    <SkeletonBase className="w-3/4 h-6 mb-2" />
    <SkeletonBase className="w-full h-4 mb-4 flex-grow" />
    <div className="flex justify-between items-center mt-auto">
      <SkeletonBase className="w-1/3 h-6" />
      <SkeletonBase className="w-1/4 h-8 rounded-lg" />
    </div>
  </div>
);

export const TextSkeleton = ({ lines = 3 }) => (
  <div className="space-y-2 w-full">
    {[...Array(lines)].map((_, i) => (
      <SkeletonBase 
        key={i} 
        className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
      />
    ))}
  </div>
);

export default SkeletonBase;
