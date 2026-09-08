import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ImageLoader from './image-loader'
import { useProducts } from '../context/ProductContext'
import ProductSkeleton from './product-skeleton'

function HomeProduct() {
  const { products, loading } = useProducts();
  const navigate = useNavigate();

  // Sort by newest first (highest id = newest), then take 15
  const displayProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.id - a.id)
      .slice(0, 15);
  }, [products]);

  // Get unique categories from all products with counts
  const categories = useMemo(() => {
    const catMap = products.reduce((acc, p) => {
      if (p.category) {
        acc[p.category] = (acc[p.category] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [products]);

  const categoryIcons = {
    Electronics: '📱', Fashion: '👗', Clothing: '👕', Books: '📚',
    Food: '🍔', Sports: '⚽', Toys: '🧸', Beauty: '💄',
    Furniture: '🛋️', Appliances: '🔌', Stationery: '✏️', Art: '🎨',
    Tools: '🔧', Garden: '🌿', Health: '💊', Default: '🛍️'
  };

  const getCategoryIcon = (cat) => {
    const key = Object.keys(categoryIcons).find(k => cat?.toLowerCase().includes(k.toLowerCase()));
    return key ? categoryIcons[key] : categoryIcons.Default;
  };

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
                  navigate(`/product?search=${e.target.value}`);
                }
              }}
            />
            <button 
              aria-label="Search"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-colors"
              onClick={(e) => {
                const input = e.currentTarget.previousSibling;
                navigate(`/product?search=${input.value}`);
              }}
            >
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Category Section */}
        {!loading && categories.length > 0 && (
          <div className="mb-14">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-6 text-center">Shop by Category</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {categories.map(([cat, count]) => (
                <Link
                  key={cat}
                  to={`/product?category=${encodeURIComponent(cat)}`}
                  className="group flex flex-col items-center justify-center bg-gray-50 hover:bg-orange-50 border-2 border-transparent hover:border-orange-200 rounded-2xl p-4 transition-all duration-300 text-center cursor-pointer"
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300 block">
                    {getCategoryIcon(cat)}
                  </span>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-orange-600 transition-colors leading-tight line-clamp-2">
                    {cat}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1">{count} items</span>
                </Link>
              ))}
              <Link
                to="/product"
                className="group flex flex-col items-center justify-center bg-black hover:bg-gray-800 rounded-2xl p-4 transition-all duration-300 text-center cursor-pointer"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300 block">🔍</span>
                <span className="text-xs font-bold text-white transition-colors leading-tight">All Products</span>
                <span className="text-[10px] text-gray-400 mt-1">{products.length} items</span>
              </Link>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {loading && displayProducts.length === 0 ? (
          <ProductSkeleton count={8} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Latest Products</h3>
              <Link
                to="/product"
                className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1"
              >
                View All
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {displayProducts.map((item) => (
                <div 
                  key={item.id} 
                  className="group bg-white rounded-xl hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden relative border border-gray-100"
                >
                  <Link to={`/product-view/${item.id}`} state={{ product: item }} aria-label={`View details for ${item.name || item.title}`} className="absolute inset-0 z-0"></Link>
                  
                  <div className="aspect-[4/3] overflow-hidden bg-gray-50 relative z-10">
                    {item.offer && (
                      <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        -{item.offer.replace(/[^0-9]/g, '')}%
                      </div>
                    )}
                    <ImageLoader 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      src={item.image_url || item.image || (item.gallery && item.gallery[0])} 
                      alt={item.name || item.title} 
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1 relative z-20 pointer-events-none">
                    <div className="flex-1">
                      {item.category && (
                        <div className="text-gray-400 text-[9px] uppercase font-bold tracking-widest mb-1">{item.category}</div>
                      )}
                      <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">{item.name || item.title}</h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        <div className="text-lg font-semibold text-gray-900 leading-none">₹{item.offerPrice || item.price}</div>
                        {item.oldPrice && (
                          <div className="text-xs text-gray-500 line-through">₹{item.oldPrice}</div>
                        )}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-50 flex justify-between items-center pointer-events-auto">
                      <div className="text-[10px] text-gray-500 font-medium tracking-wide">{item.freeShipping ? '🚚 Free Delivery' : '📦 Delivery'}</div>
                      <Link
                        to={`/checkout`}
                        state={{ product: item, quantity: 1 }}
                        className="bg-black text-white text-xs font-semibold py-2 px-4 rounded hover:bg-gray-800 transition-colors uppercase tracking-wider"
                      >
                        Buy
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More Button */}
            {products.length > 15 && (
              <div className="flex justify-center mt-12">
                <Link
                  to="/product"
                  className="group relative inline-flex items-center gap-3 bg-black hover:bg-gray-800 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm uppercase tracking-widest"
                >
                  <span>More Products</span>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default HomeProduct
