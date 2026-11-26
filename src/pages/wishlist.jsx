import React from 'react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import ImageLoader from '../component/image-loader';
import { showSuccess } from '../utils/swalUtils';

function Wishlist() {
  const { likes, toggleLike, addToCart, openCartDrawer } = useCart();
  const { requireLogin } = useUser();
  const navigate = useNavigate();

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
    openCartDrawer();
    showSuccess('Added to Bag', `${product.title || product.name} has been added to your bag.`);
  };

  if (likes.length === 0) {
    return (
      <section className="py-20 bg-[#fbf9f6] min-h-[75vh] flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-lg mx-auto text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-10 sm:p-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
              <Heart className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#14261c] font-serif mb-3">
              Your Wishlist is Empty
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mb-8 leading-relaxed">
              Tap the heart icon on any product you love to save it here for quick ordering anytime.
            </p>
            <Link
              to="/product"
              className="inline-flex items-center gap-2 bg-[#134e35] hover:bg-[#0e3a27] text-white px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Explore Products</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-14 bg-[#fbf9f6] min-h-screen">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16 max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-gray-200/80 pb-5">
          <div>
            <div className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-1">
              SAVED FINDS
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#14261c] font-serif flex items-center gap-3">
              <span>My Wishlist.</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              You have {likes.length} saved {likes.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Link
            to="/product"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#134e35] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {likes.map((product) => {
            const price = product.offerPrice || product.price || 0;
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-2xs hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-square bg-[#f5f6f5] overflow-hidden relative p-4">
                    <Link to={`/product-view/${product.id}`} className="w-full h-full block">
                      <ImageLoader
                        src={product.image_url || product.image || (product.gallery && product.gallery[0])}
                        alt={product.title || product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    <button
                      onClick={() => toggleLike(product)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/95 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all shadow-2xs cursor-pointer"
                      title="Remove from Wishlist"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>
                  </div>

                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#134e35] bg-[#edf6f1] px-2 py-0.5 rounded">
                      {product.category || 'Product'}
                    </span>
                    <Link to={`/product-view/${product.id}`}>
                      <h3 className="font-bold text-gray-900 mt-2 line-clamp-1 hover:text-[#134e35] transition-colors text-sm">
                        {product.title || product.name}
                      </h3>
                    </Link>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-black text-gray-900">
                        ₹{Math.round(Number(price)).toLocaleString('en-IN')}
                      </span>
                      {product.oldPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{Math.round(Number(product.oldPrice)).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="py-2.5 px-3 rounded-xl border border-gray-200 hover:border-[#134e35] hover:bg-[#edf6f1] text-gray-800 hover:text-[#134e35] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                  <button
                    onClick={() => requireLogin(() => navigate('/checkout', { state: { product, quantity: 1 } }))}
                    className="py-2.5 px-3 rounded-xl bg-[#134e35] hover:bg-[#0e3a27] text-white font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Wishlist;
