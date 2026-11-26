import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Truck, RefreshCw, ShieldCheck, ArrowRight } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import QuickViewModal from './QuickViewModal';
import ImageLoader from './image-loader';
import ProductSkeleton from './product-skeleton';
import ProductCard from './ProductCard';

export default function HomeProduct() {
  const navigate = useNavigate();
  const { products = [], loading } = useProducts();
  const { recentOrders = [], reorderOrder } = useCart();
  const { requireLogin } = useUser();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const recentBoughtItems = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const ord of recentOrders) {
      for (const item of ord.items || []) {
        const key = (item.product_name || '').toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          list.push({ ...item, orderId: ord.id });
        }
        if (list.length >= 4) return list;
      }
    }
    return list;
  }, [recentOrders]);

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

    const list = Array.from(catMap.values());
    if (list.length > 0) return list.slice(0, 8);

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

  const displayProducts = useMemo(() => products.slice(0, 12), [products]);

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full bg-white">
      {/* 1. Category Discovery Section */}
      <section className="py-12 sm:py-16 border-b border-gray-100">
        <div className="container mx-auto px-6 sm:px-8 lg:px-16">
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

      {/* 2. Featured Products Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-6 sm:px-8 lg:px-16">
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

          {loading && displayProducts.length === 0 ? (
            <ProductSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {displayProducts.map((item, idx) => (
                <ProductCard
                  key={item.id || idx}
                  product={item}
                  index={idx}
                  priority={idx < 4}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Returning Customer "Buy It Again in 1 Click" Section */}
      {recentBoughtItems.length > 0 && (
        <section className="py-10 bg-[#f6f9f7] border-t border-gray-100">
          <div className="container mx-auto px-6 sm:px-8 lg:px-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#134e35]">
                  WELCOME BACK
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                  Buy it again in 1 click
                </h2>
              </div>
              <Link
                to="/profile?tab=orders"
                className="text-xs sm:text-sm font-semibold text-[#134e35] hover:underline"
              >
                View all orders →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentBoughtItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200/80 p-4 flex items-center gap-3.5 shadow-2xs"
                >
                  <div className="w-16 h-16 rounded-xl bg-[#f5f6f5] p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                    <ImageLoader
                      src={item.product_image || item.image_url || item.image}
                      alt={item.product_name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">
                      {item.product_name}
                    </h4>
                    <p className="text-xs font-extrabold text-[#134e35] mt-0.5">
                      ₹{Math.round(Number(item.price || 0)).toLocaleString('en-IN')}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        requireLogin(async () => {
                          const ord = recentOrders.find(o => String(o.id) === String(item.orderId));
                          if (ord) {
                            const { items } = await reorderOrder({ ...ord, items: [item] });
                            if (items.length > 0) {
                              navigate('/checkout', { state: { cartItems: items } });
                            }
                          }
                        });
                      }}
                      className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#134e35] hover:bg-[#0e3a27] text-white text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Order Again</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Instagram Community & Website Order Banner */}
      <section className="py-12 sm:py-16 bg-[#fbf9f6] border-t border-gray-100">
        <div className="container mx-auto px-6 sm:px-8 lg:px-16">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
                <FaInstagram className="w-3.5 h-3.5" />
                <span>@eacyclic on Instagram</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif">
                Watch product demos & real unboxing reels
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                See how our home organizers, furniture, and daily finds work in real homes, then order directly on our website with Cash on Delivery and live order tracking.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-gray-600 font-medium">
                <span className="inline-flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-[#134e35]" /> Zero Advance Needed</span>
                <span className="inline-flex items-center gap-1"><Truck className="w-4 h-4 text-[#134e35]" /> Fast Dispatch across India</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href="https://www.instagram.com/eacyclic/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white text-xs sm:text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
              >
                <FaInstagram className="w-4 h-4" />
                <span>Follow @eacyclic</span>
              </a>
              <Link
                to="/product"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#134e35] hover:bg-[#0e3a27] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors"
              >
                <span>Shop All Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <QuickViewModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
