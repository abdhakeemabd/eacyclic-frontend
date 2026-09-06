import React, { useState, useEffect, useRef } from 'react';

const ImageLoader = ({ src, alt, className = '', imgClassName = '', wrapperClassName = '', aspectRatio = 'aspect-[4/3]', ...props }) => {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Instantly resolve cached images to avoid skeleton flicker
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
      setError(false);
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden w-full ${aspectRatio} bg-gray-100 ${wrapperClassName}`}>
      {/* Skeleton Shimmer Overlay */}
      {!isLoaded && !error && (
        <div 
          className="skeleton absolute inset-0 z-10 w-full h-full" 
          aria-hidden="true"
        />
      )}

      {/* Fallback in case image fails to load */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-xs select-none">
          Image not available
        </div>
      )}

      {/* Semantic image tag is ALWAYS present in DOM for SEO */}
      <img
        ref={imgRef}
        src={src || ''}
        alt={alt || 'Product image'}
        className={`w-full h-full object-cover transition-all duration-500 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } ${className} ${imgClassName}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default ImageLoader;
