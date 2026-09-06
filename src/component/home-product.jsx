import React, { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import ImageLoader from './image-loader'
import { useProducts } from '../context/ProductContext'
import ProductSkeleton from './product-skeleton'

function HomeProduct() {
  const { products, loading } = useProducts();
  const [visibleCount, setVisibleCount] = useState(20);
  const observer = useRef();

  const lastProductElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < products.length) {
        setVisibleCount(prevCount => prevCount + 20);
      }
    });
    if (node) observer.current.observe(node);
  }, [visibleCount, products.length]);

  const displayProducts = products.slice(0, visibleCount);

  return (
    <section className='home_prodcut_sec py-16 bg-white'>
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Discover Near By You with Eacyclic</h2>
          <div className="w-20 h-1.5 bg-orange-600 mx-auto mt-4 mb-8 rounded-full"></div>
          
          {/* Section Search */}
          <div className="max-w-xl mx-auto relative group">
            <input 
              type="text" 
              aria-label="Search products"
              placeholder="What are you looking for today on Eacyclic?" 
              className="w-full pl-6 pr-16 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:ring-0 transition-all duration-300 shadow-sm group-hover:shadow-md outline-none text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  window.location.href = `/product?search=${e.target.value}`;
                }
              }}
            />
            <button 
              aria-label="Search"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-colors"
              onClick={(e) => {
                const input = e.currentTarget.previousSibling;
                window.location.href = `/product?search=${input.value}`;
              }}
            >
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {loading && displayProducts.length === 0 ? (
          <ProductSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayProducts.map((item, index) => (
              <div 
                key={item.id} 
                ref={index === displayProducts.length - 1 ? lastProductElementRef : null}
                className="group bg-white rounded-xl hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden relative"
              >
              <Link to={`/product-view/${item.id}`} state={{ product: item }} aria-label={`View details for ${item.title}`} className="absolute inset-0 z-0"></Link>
              
              <div className="aspect-[4/3] overflow-hidden bg-gray-50 relative z-10">
                 {item.offer && (
                    <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      -{item.offer.replace(/[^0-9]/g, '')}%
                    </div>
                  )}
                <ImageLoader 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  src={item.image_url || item.image || (item.gallery && item.gallery[0])} 
                  alt={item.title} 
                />
              </div>
              <div className="p-4 flex flex-col flex-1 relative z-20 pointer-events-none">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-base mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors leading-snug">{item.title}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <div className="text-xl font-semibold text-gray-900 leading-none">₹{item.offerPrice || item.price}</div>
                    {item.oldPrice && (
                      <div className="text-xs text-gray-500 line-through">₹{item.oldPrice}</div>
                    )}
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-50 flex justify-between items-center pointer-events-auto">
                  <div className="text-[10px] text-gray-500 font-medium tracking-wide">{item.count || 0} Views</div>
                  <Link
                    to={`/checkout`}
                    state={{ product: item, quantity: 1 }}
                    className="bg-black text-white text-xs font-semibold py-2 px-5 rounded hover:bg-gray-800 transition-colors uppercase tracking-wider"
                  >
                    Buy
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {visibleCount < products.length && (
          <div className="flex justify-center mt-12">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </section>
  )
}

export default HomeProduct
