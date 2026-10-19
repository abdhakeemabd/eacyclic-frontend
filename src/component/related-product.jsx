import React, { useState } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link, useParams } from 'react-router-dom';
import { Heart, Plus, ArrowRight } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import ImageLoader from './image-loader';
import ProductSkeleton from './product-skeleton';
import QuickViewModal from './QuickViewModal';

export default function RelatedProduct() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const { toggleLike, isLiked } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter out current product and prioritize products in the same category or general catalog
  const currentProduct = products.find(p => p.id?.toString() === id?.toString());
  const relatedProducts = products
    .filter(p => p.id?.toString() !== id?.toString())
    .sort((a, b) => {
      if (currentProduct && a.category === currentProduct.category) return -1;
      if (currentProduct && b.category === currentProduct.category) return 1;
      return 0;
    })
    .slice(0, 8);

  const handleOpenQuickView = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(item);
    setIsModalOpen(true);
  };

  const settings = {
    dots: false,
    infinite: relatedProducts.length > 4,
    speed: 700,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    arrows: true,
    autoplaySpeed: 4000,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } }
    ]
  };

  const badgeLabels = ['Best seller', 'Everyday essential', 'Popular pick', 'New arrival', 'Staff pick'];

  if (!loading && relatedProducts.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 bg-[#fafbfa] border-t border-gray-100 overflow-hidden">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16 max-w-7xl">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <div className="text-[11px] font-bold text-[#5c6e61] tracking-[0.2em] uppercase mb-1">
              DISCOVER MORE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight font-serif">
              You might also love.
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Handpicked thoughtful finds from our collection.
            </p>
          </div>

          <Link
            to="/product"
            className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#134e35] flex items-center gap-1 transition-colors group"
          >
            <span>View all</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Carousel or Grid */}
        {loading && relatedProducts.length === 0 ? (
          <ProductSkeleton count={4} />
        ) : (
          <div className="features_slider -mx-2.5">
            <Slider {...settings}>
              {relatedProducts.map((item, idx) => {
                const liked = isLiked(item.id);
                const tag = item.offer ? `-${item.offer.toString().replace(/[^0-9]/g, '')}%` : badgeLabels[idx % badgeLabels.length];
                const price = item.offerPrice || item.price || 0;
                const oldPrice = item.oldPrice;
                const imageSrc = item.image_url || item.image || (item.gallery && item.gallery[0]);
                const title = item.name || item.title || 'Product';
                const description = item.description || item.content || '';
                const category = item.category || 'STORE PICK';

                return (
                  <div key={item.id || idx} className="px-2.5 pb-6">
                    <div className="group bg-white rounded-2xl border border-gray-100/90 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col relative h-full">
                      
                      {/* Image Area */}
                      <div
                        onClick={(e) => handleOpenQuickView(e, item)}
                        className="aspect-square bg-[#f5f6f5] relative flex items-center justify-center p-4 cursor-pointer overflow-hidden"
                      >
                        {/* Top Left Tag */}
                        <span className="absolute top-3 left-3 z-10 text-[10px] font-semibold text-gray-700 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-2xs">
                          {tag}
                        </span>

                        {/* Top Right Wishlist */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleLike(item);
                          }}
                          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-2xs flex items-center justify-center hover:scale-110 transition-transform"
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
                            {category}
                          </div>

                          <h3
                            onClick={(e) => handleOpenQuickView(e, item)}
                            className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 group-hover:text-[#134e35] transition-colors cursor-pointer mb-1.5"
                            title={title}
                          >
                            {title}
                          </h3>

                          {description && (
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                              {description}
                            </p>
                          )}
                        </div>

                        {/* Price & Action Row */}
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
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
                              onClick={(e) => handleOpenQuickView(e, item)}
                              className="w-8 h-8 rounded-lg border border-gray-200 hover:border-[#134e35] hover:bg-[#134e35] hover:text-white flex items-center justify-center text-gray-700 transition-all active:scale-95 shadow-2xs cursor-pointer"
                              title="Quick View"
                              aria-label={`Quick view ${title}`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                            {item.freeShipping ? (
                              <span className="text-[11px] text-[#134e35] font-medium">
                                🚚 Free delivery
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400 font-medium">
                                📦 Standard delivery
                              </span>
                            )}
                            <Link
                              to={`/product-view/${item.id}`}
                              state={{ product: item }}
                              className="text-xs font-semibold text-[#134e35] hover:text-[#0b2b1d] px-1 transition-colors uppercase tracking-wider"
                            >
                              View →
                            </Link>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </Slider>
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
