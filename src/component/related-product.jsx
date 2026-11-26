import React, { useState } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link, useParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductSkeleton from './product-skeleton';
import QuickViewModal from './QuickViewModal';
import ProductCard from './ProductCard';

export default function RelatedProduct() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentProduct = products.find(p => p.id?.toString() === id?.toString());
  const relatedProducts = products
    .filter(p => p.id?.toString() !== id?.toString())
    .sort((a, b) => {
      if (currentProduct && a.category === currentProduct.category) return -1;
      if (currentProduct && b.category === currentProduct.category) return 1;
      return 0;
    })
    .slice(0, 8);

  const handleQuickView = (item) => {
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

  if (!loading && relatedProducts.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 bg-[#fafbfa] border-t border-gray-100 overflow-hidden">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16 max-w-7xl">
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

        {loading && relatedProducts.length === 0 ? (
          <ProductSkeleton count={4} />
        ) : (
          <div className="features_slider -mx-2.5">
            <Slider {...settings}>
              {relatedProducts.map((item, idx) => (
                <div key={item.id || idx} className="px-2.5 pb-6 h-full">
                  <ProductCard
                    product={item}
                    index={idx}
                    showDescription={true}
                    onQuickView={handleQuickView}
                  />
                </div>
              ))}
            </Slider>
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
