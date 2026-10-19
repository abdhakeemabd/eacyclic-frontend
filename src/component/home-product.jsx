import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Plus, Sparkles } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import QuickViewModal from './QuickViewModal';
import ImageLoader from './image-loader';
import ProductSkeleton from './product-skeleton';

export default function HomeProduct() {
  const navigate = useNavigate();
  const { products = [], loading } = useProducts();
  const { toggleLike, isLiked } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamically extract unique categories from actual store products
  const categoryList = useMemo(() => {
    const catMap = new Map();
    products.forEach((p) => {
      const cat = p.category?.trim();
      if (cat && !catMap.has(cat)) {
        const img = p.image_url || p.image || (p.gallery && p.gallery[0]);
        catMap.set(cat, { name: cat, image: img });
      }
    });

    // If categories exist in real data, take top 8
    const list = Array.from(catMap.values());
    if (list.length > 0) return list.slice(0, 8);

    // Fallback names matching the store categories
    return [
      { name: 'Chair', image: null },
      { name: 'Table', image: null },
      { name: 'Plant', image: null },
      { name: 'Dress', image: null },
      { name: 'Home Utilities', image: null },
      { name: 'Traditional Jewellery', image: null },
      { name: 'Appliances', image: null },
      { name: 'Health & Wellness', image: null }
    ];
  }, [products]);

  // Display only real products from the store (top 8 or 12)
  const displayProducts = useMemo(() => {
    return products.slice(0, 12);
  }, [products]);

  const handleOpenAddToCartModal = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(item);
    setIsModalOpen(true);
  };

  const handleGoToProductDetails = (item) => {
    navigate(`/product-view/${item.id}`, { state: { product: item } });
  };

  const badgeLabels = ['Best seller', 'Everyday essential', 'Popular pick', 'New arrival', 'Top rated', 'Staff pick'];

  return (
    <div className="w-full bg-white">
      {/* 1. Category Discovery Section (Screenshot 2) */}
      <section className="py-12 sm:py-16 border-b border-gray-100">
        <div className="container mx-auto px-6 sm:px-8 lg:px-16">
          {/* Header */}
          <div className="flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Find your everyday.
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                A world of good things, all in one place
              </p>
            </div>

            <Link
              to="/product"
              className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#134e35] flex items-center gap-1 transition-colors group"
            >
              <span>All categories</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* Circular Category Row */}
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 sm:gap-6">
            {categoryList.map((cat, idx) => (
              <Link
                key={idx}
                to={`/product?category=${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center group text-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full bg-[#f0f2f0] flex items-center justify-center p-2.5 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md border border-gray-100 overflow-hidden">
                  {cat.image ? (
                    <ImageLoader
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center bg-white/70 text-[#134e35]">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-gray-700 mt-2.5 group-hover:text-[#134e35] transition-colors leading-tight line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Real Store Products Section (Screenshot 2) */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-6 sm:px-8 lg:px-16">
          {/* Header */}
          <div className="flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Small finds. Big difference.
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Our latest picks for a home you love.
              </p>
            </div>

            <Link
              to="/product"
              className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#134e35] flex items-center gap-1 transition-colors group"
            >
              <span>View all products</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* Product Cards Grid */}
          {loading && displayProducts.length === 0 ? (
            <ProductSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {displayProducts.map((item, idx) => {
                const liked = isLiked(item.id);
                const tag = item.offer ? `-${item.offer.toString().replace(/[^0-9]/g, '')}%` : badgeLabels[idx % badgeLabels.length];
                const price = item.offerPrice || item.price || 0;
                const oldPrice = item.oldPrice;
                const imageSrc = item.image_url || item.image || (item.gallery && item.gallery[0]);
                const title = item.name || item.title || 'Product';
                const category = item.category || 'STORE PICK';

                return (
                  <div
                    key={item.id || idx}
                    onClick={() => handleGoToProductDetails(item)}
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
                          toggleLike(item);
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

                      {/* Product Image */}
                      <div className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                        <ImageLoader
                          src={imageSrc}
                          alt={title}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-1 truncate">
                          {category}
                        </div>

                        <h3 
                          className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 group-hover:text-[#134e35] transition-colors mb-3"
                          title={title}
                        >
                          {title}
                        </h3>
                      </div>

                      {/* Price & Action Row */}
                      <div>
                        <div className="flex items-center justify-between">
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
                            onClick={(e) => handleOpenAddToCartModal(e, item)}
                            className="w-8 h-8 rounded-lg border border-gray-200 hover:border-[#134e35] hover:bg-[#134e35] hover:text-white flex items-center justify-center text-gray-700 transition-all active:scale-95 shadow-2xs cursor-pointer z-10"
                            title="Add to Cart (Choose Variants)"
                            aria-label={`Add ${title} to Cart`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {item.freeShipping && (
                          <div className="text-[11px] text-[#134e35] font-medium mt-1.5 flex items-center gap-1">
                            <span>🚚 Free delivery</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Quick View Modal Dialog */}
      <QuickViewModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
