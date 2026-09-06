import React from 'react';

export const ProductCardSkeleton = () => {
  return (
    <article 
      className="bg-white rounded-xl shadow-sm flex flex-col h-full overflow-hidden relative border border-gray-100"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      {/* Image Skeleton */}
      <div className="aspect-[4/3] w-full skeleton bg-gray-200" />

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1 space-y-2">
          {/* Category */}
          <div className="h-3 w-1/4 rounded skeleton bg-gray-200" />
          {/* Title */}
          <div className="h-5 w-3/4 rounded skeleton bg-gray-200" />
          {/* Description Lines */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full rounded skeleton bg-gray-200" />
            <div className="h-3 w-5/6 rounded skeleton bg-gray-200" />
          </div>
          {/* Price */}
          <div className="h-6 w-1/3 rounded skeleton bg-gray-200 pt-1" />
        </div>

        {/* Footer Buttons Skeleton */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex gap-3">
            {/* Like button skeleton */}
            <div className="w-5 h-5 rounded-full skeleton bg-gray-200" />
            {/* Cart button skeleton */}
            <div className="w-5 h-5 rounded-full skeleton bg-gray-200" />
          </div>
          {/* Buy button skeleton */}
          <div className="w-16 h-8 rounded skeleton bg-gray-200" />
        </div>
      </div>
    </article>
  );
};

const ProductSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export default ProductSkeleton;
