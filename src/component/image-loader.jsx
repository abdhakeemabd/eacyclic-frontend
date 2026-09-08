import React, { useState, useEffect, useRef } from 'react';

const ImageLoader = ({ src, alt, className = '', imgClassName = '', wrapperClassName = '', aspectRatio = 'aspect-[4/3]', ...props }) => {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setError(true);
      setIsLoaded(false);
      return;
    }
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalHeight !== 0) {
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400 text-xs select-none z-20">
          <svg className="w-8 h-8 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="opacity-75">Image not available</span>
        </div>
      )}

      {/* Semantic image tag is ALWAYS present in DOM for SEO */}
      <img
        ref={imgRef}
        src={src || undefined}
        alt={alt || 'Product image'}
        className={`w-full h-full object-cover transition-all duration-500 text-transparent ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } ${error ? 'hidden' : 'block'} ${className} ${imgClassName}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default ImageLoader;
