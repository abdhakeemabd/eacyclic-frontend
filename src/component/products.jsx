import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, X, Truck, SlidersHorizontal } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductSkeleton from './product-skeleton';
import QuickViewModal from './QuickViewModal';
import ProductCard from './ProductCard';

export default function Products() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [freeOnly, setFreeOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(16);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { products, loading } = useProducts();

  const location = useLocation();
  const observer = useRef();

  const categories = useMemo(() => {
    const cats = products.reduce((acc, p) => {
      if (p.category && !acc.includes(p.category.trim())) {
        acc.push(p.category.trim());
      }
      return acc;
    }, []);
    return ['All', ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const base = products.filter((product) => {
      const titleName = (product.name || product.title || '').toLowerCase();
      const desc = (product.description || product.content || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = !term || titleName.includes(term) || desc.includes(term);
      const matchesTab = activeTab === 'All' || product.category === activeTab;
      const matchesShipping = !freeOnly || product.freeShipping !== false;
      return matchesSearch && matchesTab && matchesShipping;
    });

    if (sortBy === 'price-asc') {
      return [...base].sort((a, b) => (parseFloat(a.offerPrice || a.price || 0) - parseFloat(b.offerPrice || b.price || 0)));
    }
    if (sortBy === 'price-desc') {
      return [...base].sort((a, b) => (parseFloat(b.offerPrice || b.price || 0) - parseFloat(a.offerPrice || a.price || 0)));
    }
    if (sortBy === 'discount') {
      const getPct = (p) => {
        const price = parseFloat(p.offerPrice || p.price || 0);
        const oldP = parseFloat(p.oldPrice || p.old_price || 0);
        if (oldP > price && price > 0) return ((oldP - price) / oldP) * 100;
        return parseFloat(p.discount || 0);
      };
      return [...base].sort((a, b) => getPct(b) - getPct(a));
    }
    return base;
  }, [products, searchTerm, activeTab, freeOnly, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    const category = params.get('category');
    if (search) setSearchTerm(search);
    if (category) setActiveTab(category);
  }, [location.search]);

  const lastProductElementRef = useCallback((node) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < filteredProducts.length) {
        setVisibleCount((prevCount) => prevCount + 16);
      }
    }, { rootMargin: '200px' });
    if (node) observer.current.observe(node);
  }, [visibleCount, filteredProducts.length]);

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <section className="py-12 bg-white min-h-screen">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16">
        {/* Controls: Search & Category Pills */}
        <div className="max-w-4xl mx-auto mb-8 space-y-5">
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

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

        {/* Results Counter, Free Delivery Toggle & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 mb-6 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <span>Showing <strong className="text-gray-900">{displayedProducts.length}</strong> of {filteredProducts.length} items</span>
            {(activeTab !== 'All' || searchTerm || freeOnly) && (
              <button
                onClick={() => {
                  setActiveTab('All');
                  setSearchTerm('');
                  setFreeOnly(false);
                }}
                className="text-[#134e35] font-semibold hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setFreeOnly(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                freeOnly
                  ? 'bg-[#edf6f1] text-[#134e35] border-[#134e35]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Free Delivery</span>
            </button>

            <div className="inline-flex items-center gap-1.5 bg-[#f8f9f8] border border-gray-200 rounded-full px-3 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
                className="bg-transparent text-xs font-semibold text-gray-800 outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Biggest Savings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading && displayedProducts.length === 0 ? (
          <ProductSkeleton count={8} />
        ) : displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayedProducts.map((product, index) => (
                <ProductCard
                  key={product.id || index}
                  product={product}
                  index={index}
                  priority={index < 4}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>

            {visibleCount < filteredProducts.length && (
              <div ref={lastProductElementRef} className="flex justify-center mt-12 py-4">
                <div className="w-7 h-7 border-3 border-[#134e35] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-[#fbf9f6] rounded-2xl border border-dashed border-gray-200 max-w-lg mx-auto">
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">No products found</h3>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your search terms or selecting another category.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveTab('All');
                setFreeOnly(false);
              }}
              className="mt-4 px-5 py-2 bg-[#134e35] text-white text-xs font-semibold rounded-full hover:bg-[#0e3a27] transition-all cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <QuickViewModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
