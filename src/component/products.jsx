import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, Heart, Plus, Sparkles, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import ImageLoader from './image-loader';
import ProductSkeleton from './product-skeleton';
import QuickViewModal from './QuickViewModal';

export default function Products() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(16);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { addToCart, toggleLike, isLiked } = useCart();
  const { products, loading } = useProducts();

  const location = useLocation();
  const navigate = useNavigate();
  const observer = useRef();

  // Extract unique categories from real products
  const categories = useMemo(() => {
    const cats = products.reduce((acc, p) => {
      if (p.category && !acc.includes(p.category.trim())) {
        acc.push(p.category.trim());
      }
      return acc;
    }, []);
    return ['All', ...cats];
  }, [products]);

  // Filter products based on search and tab
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const titleName = (product.name || product.title || '').toLowerCase();
      const desc = (product.description || product.content || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = !term || titleName.includes(term) || desc.includes(term);
      const matchesTab = activeTab === 'All' || product.category === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [products, searchTerm, activeTab]);

  // Initialize search and category from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    const category = params.get('category');
    if (search) setSearchTerm(search);
    if (category) setActiveTab(category);
  }, [location.search]);

  // Infinite Scroll Observer
  const lastProductElementRef = useCallback((node) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < filteredProducts.length) {
        setVisibleCount((prevCount) => prevCount + 16);
      }
    }, { rootMargin: '200px' });
    if (node) observer.current.observe(node);
  }, [visibleCount, filteredProducts.length]);

  const handleOpenAddToCartModal = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(item);
    setIsModalOpen(true);
  };

  const handleGoToProductDetails = (product) => {
    navigate(`/product-view/${product.id}`, { state: { product } });
  };

  const handleBuyNow = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/checkout', { state: { product, quantity: 1 } });
  };

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const badgeLabels = ['Best seller', 'Everyday essential', 'Popular pick', 'New arrival', 'Top rated'];

  return (
    <section className="py-12 bg-white min-h-screen">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16">
        
        {/* Controls: Search & Category Pills */}
        <div className="max-w-4xl mx-auto mb-10 space-y-6">
          
          {/* Search Input */}
          <div className="relative max-w-xl mx-auto">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search in all products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(16);
              }}
              className="w-full pl-11 pr-10 py-3 bg-[#f8f9f8] border border-gray-200/80 rounded-full text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#134e35] focus:bg-white transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 overflow-x-auto py-1 no-scrollbar">
            {categories.map((cat) => {
              const count = cat === 'All' 
                ? products.length 
                : products.filter(p => p.category === cat).length;
              const isActive = activeTab === cat;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveTab(cat);
                    setVisibleCount(16);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#134e35] text-white shadow-xs'
                      : 'bg-[#f4f6f4] text-gray-700 hover:bg-gray-200/80'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-6 border-b border-gray-100 pb-3">
          <span>Showing <strong className="text-gray-900">{displayedProducts.length}</strong> of {filteredProducts.length} items</span>
          {activeTab !== 'All' && (
            <button
              onClick={() => setActiveTab('All')}
              className="text-[#134e35] font-semibold hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* Product Grid */}
        {loading && displayedProducts.length === 0 ? (
          <ProductSkeleton count={8} />
        ) : displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayedProducts.map((product, index) => {
                const liked = isLiked(product.id);
                const tag = product.offer ? `-${product.offer.toString().replace(/[^0-9]/g, '')}%` : badgeLabels[index % badgeLabels.length];
                const price = product.offerPrice || product.price || 0;
                const oldPrice = product.oldPrice;
                const imageSrc = product.image_url || product.image || (product.gallery && product.gallery[0]);
                const title = product.name || product.title || 'Product';

                return (
                  <div
                    key={product.id || index}
                    onClick={() => handleGoToProductDetails(product)}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col relative cursor-pointer"
                  >
                    {/* Image Area */}
                    <div
                      className="aspect-square bg-[#f5f6f5] relative flex items-center justify-center p-4 overflow-hidden"
                    >
                      {/* Top Left Tag */}
                      <span className="absolute top-3 left-3 z-10 text-[10px] font-semibold text-gray-700 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-2xs">
                        {tag}
                      </span>

                      {/* Top Right Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleLike(product);
                        }}
                        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-2xs flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                        aria-label="Save to wishlist"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            liked ? 'text-red-500 fill-red-500' : 'text-gray-600'
                          }`}
                        />
                      </button>

                      {/* Image */}
                      <div className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                        <ImageLoader
                          src={imageSrc}
                          alt={title}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-1 truncate">
                          {product.category || 'STORE PICK'}
                        </div>

                        <h3
                          className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 group-hover:text-[#134e35] transition-colors mb-3"
                          title={title}
                        >
                          {title}
                        </h3>
                      </div>

                      {/* Price, Action & Buy */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base sm:text-lg font-bold text-gray-900">
                              ₹{price}
                            </span>
                            {oldPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{oldPrice}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={(e) => handleOpenAddToCartModal(e, product)}
                            className="w-8 h-8 rounded-lg border border-gray-200 hover:border-[#134e35] hover:bg-[#134e35] hover:text-white flex items-center justify-center text-gray-700 transition-all active:scale-95 shadow-2xs cursor-pointer z-10"
                            title="Add to Cart (Choose Variants)"
                            aria-label={`Add ${title} to Cart`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                          {product.freeShipping ? (
                            <span className="text-[11px] text-[#134e35] font-medium">
                              🚚 Free delivery
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium">
                              📦 Standard delivery
                            </span>
                          )}
                          <button
                            onClick={(e) => handleBuyNow(e, product)}
                            className="text-xs font-semibold text-[#134e35] hover:text-[#0b2b1d] px-2 py-1 rounded transition-colors uppercase tracking-wider cursor-pointer z-10"
                          >
                            Buy →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Infinite Scroll Loader */}
            {visibleCount < filteredProducts.length && (
              <div ref={lastProductElementRef} className="flex justify-center mt-12 py-4">
                <div className="w-7 h-7 border-3 border-[#134e35] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200 max-w-lg mx-auto">
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">No products found</h3>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your search terms or selecting another category.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveTab('All');
              }}
              className="mt-4 px-4 py-2 bg-[#134e35] text-white text-xs font-semibold rounded-full hover:bg-[#0e3a27] transition-all cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
