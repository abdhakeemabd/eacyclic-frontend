import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { BiLike, BiSolidLike, BiCart, BiSolidCart, BiSearch } from 'react-icons/bi';
import { PiShareFat } from 'react-icons/pi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import ImageLoader from './image-loader';
import ProductSkeleton from './product-skeleton';

function Products() {
  const [likes, setLikes] = useState({});
  const [carts, setCarts] = useState({});
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const { addToCart } = useCart();
  const { products, loading } = useProducts();
  const location = useLocation();
  const navigate = useNavigate();
  const observer = useRef();

  // Group categories for tabs
  const categories = useMemo(() => {
    const cats = products.reduce((acc, p) => {
      if (p.category && !acc.includes(p.category)) acc.push(p.category);
      return acc;
    }, []);
    return ['All', ...cats];
  }, [products]);

  // Filter products based on search and tab
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = (product.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.content || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'All' || product.category === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [products, searchTerm, activeTab]);

  // Initialize search from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [location.search]);

  // Infinite Scroll Observer
  const lastProductElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < filteredProducts.length) {
        setVisibleCount(prevCount => prevCount + 20);
      }
    });
    if (node) observer.current.observe(node);
  }, [visibleCount, products.length, searchTerm, activeTab]);

  const toggleLike = (id) => {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCart = async (product) => {
    const isInCart = carts[product.id];
    if (!isInCart) {
      const result = await addToCart({
        id: product.id,
        title: product.title,
        content: product.content,
        price: product.price || product.offerPrice,
        offerPrice: product.offerPrice || product.price,
        image: product.image_url || product.image || (product.gallery && product.gallery[0]),
        gallery: product.gallery || [product.image],
      });
      if (result.success) {
        setCarts((prev) => ({ ...prev, [product.id]: true }));
      }
    } else {
      setCarts((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const handleBuyNow = (product) => {
    navigate('/checkout', { state: { product, quantity: 1 } });
  };

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <section className="product_main_sec py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Categories List */}
          <div className="hidden md:flex flex-wrap pb-4 w-full md:w-auto gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveTab(cat); setVisibleCount(20); }}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap shadow-sm cursor-pointer
101:                     ${activeTab === cat ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mobile Category Carousel Selector */}
          <div className="flex md:hidden items-center justify-between w-full max-w-md mx-auto mb-6 bg-gray-100 rounded-full px-4 py-2 shadow-sm border border-gray-200">
            <button
              onClick={() => {
                const currentIndex = categories.indexOf(activeTab);
                const prevIdx = (currentIndex - 1 + categories.length) % categories.length;
                setActiveTab(categories[prevIdx]);
                setVisibleCount(20);
              }}
              className="p-2 text-gray-800 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Previous category"
            >
              <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            <span className="font-bold text-gray-900 text-sm tracking-wide">
              {activeTab}
            </span>
            
            <button
              onClick={() => {
                const currentIndex = categories.indexOf(activeTab);
                const nextIdx = (currentIndex + 1) % categories.length;
                setActiveTab(categories[nextIdx]);
                setVisibleCount(20);
              }}
              className="p-2 text-gray-800 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Next category"
            >
              <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          <div className="relative w-full md:w-[500px] mx-auto my-8 flex justify-center">
            <input
              type="text"
              placeholder="Filter these results..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(20);
              }}
              className="w-full pl-6 pr-14 py-3 bg-white text-black border border-gray-100 rounded-xl focus:ring-2 focus:ring-black focus:outline-none transition-all shadow-sm placeholder-gray-400"
            />

            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-black p-2.5 rounded-lg hover:bg-gray-800 transition shadow-lg">
              <BiSearch className="text-white text-xl" />
            </button>
          </div>

          {/* Product Grid */}
          {loading && displayedProducts.length === 0 ? (
            <ProductSkeleton count={8} />
          ) : displayedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProducts.map((product, index) => (
                  <div
                    key={product.id}
                    ref={index === displayedProducts.length - 1 ? lastProductElementRef : null}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden relative"
                  >
                    <Link to={`/product-view/${product.id}`} state={{ product }} className="absolute inset-0 z-0"></Link>

                    {/* Badge */}
                    {product.offer && (
                      <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[13px] font-bold px-1.5 py-0.5 rounded uppercase shadow-sm">
                        -{product.offer.replace(/[^0-9]/g, '')}%
                      </div>
                    )}

                    <div className="block overflow-hidden aspect-[4/3] bg-gray-50 relative z-10">
                      <ImageLoader
                        src={product.image_url || product.image || (product.gallery && product.gallery[0])}
                        alt={product.title}
                        className="transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="p-4 flex flex-col flex-1 relative z-20 pointer-events-none">
                      <div className="flex-1">
                        <div className="text-gray-400 text-[9px] uppercase font-bold tracking-widest mb-1">{product.category || 'Shop'}</div>
                        <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors pointer-events-auto leading-snug">
                          <Link to={`/product-view/${product.id}`} state={{ product }}>{product.title}</Link>
                        </h3>
                        <p className="text-gray-500 text-xs mb-3 line-clamp-2 min-h-[32px]">{product.content || product.description}</p>

                        <div className="flex items-baseline gap-2 mb-3">
                          <div className="text-xl font-semibold text-gray-900 leading-none">₹{product.offerPrice || product.price}</div>
                          {product.oldPrice && (
                            <div className="text-xs text-gray-400 line-through">₹{product.oldPrice}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50 pointer-events-auto">
                        <div className="flex gap-3">
                          <button onClick={() => toggleLike(product.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                            {likes[product.id] ? <BiSolidLike className="text-red-500 text-lg" /> : <BiLike className="text-lg" />}
                          </button>
                          <button onClick={() => toggleCart(product)} className={`transition-colors ${carts[product.id] ? 'text-orange-600' : 'text-gray-400 hover:text-orange-500'}`}>
                            {carts[product.id] ? <BiSolidCart className="text-xl" /> : <BiCart className="text-xl" />}
                          </button>
                        </div>
                        <button
                          onClick={() => handleBuyNow(product)}
                          className="bg-black text-white text-xs font-semibold py-2 px-5 cursor-pointer transition-colors duration-300 uppercase tracking-wider"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {visibleCount < filteredProducts.length && (
                <div className="flex justify-center mt-8">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
              <div className="text-gray-400 text-6xl mb-4 flex justify-center"><BiSearch /></div>
              <h3 className="text-xl font-bold text-gray-800">No products found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or category filter</p>
              <button
                onClick={() => { setSearchTerm(''); setActiveTab('All'); }}
                className="mt-6 text-orange-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Products;
