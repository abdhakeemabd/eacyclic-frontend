import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash, FaShoppingCart, FaArrowRight } from 'react-icons/fa';
import { BiArrowBack } from 'react-icons/bi';
import ImageLoader from '../component/image-loader';
import { showSuccess } from '../utils/swalUtils';

function Wishlist() {
  const { likes, toggleLike, addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    showSuccess('Added to Cart', `${product.title || product.name} has been added to your cart.`);
  };

  if (likes.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <div className="w-32 h-32 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
                <FaHeart className="text-6xl text-red-500 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Wishlist is Empty</h2>
              <p className="text-gray-600 mb-8">
                Explore our catalog and click the heart icon on any product to save your favorite items!
              </p>
              <Link
                to="/product"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <BiArrowBack className="text-xl" />
                Explore Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <FaHeart className="text-red-500 text-2xl" />
              My Liked Items
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              You have {likes.length} saved {likes.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Link
            to="/product"
            className="inline-flex items-center gap-2 text-orange-600 font-semibold text-sm hover:underline"
          >
            <BiArrowBack />
            Back to Products
          </Link>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {likes.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col justify-between group"
            >
              <div className="relative">
                {/* Product Image */}
                <div className="w-full h-48 bg-gray-50 overflow-hidden relative">
                  <ImageLoader
                    src={product.image_url || product.image || (product.gallery && product.gallery[0])}
                    alt={product.title || product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.offer && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                      {product.offer}
                    </span>
                  )}

                  {/* Remove Like Button */}
                  <button
                    onClick={() => toggleLike(product)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-all shadow-md"
                    title="Remove from Liked"
                  >
                    <FaHeart className="text-base" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    {product.category || 'Product'}
                  </span>
                  <Link to={`/product-view/${product.id}`}>
                    <h3 className="font-bold text-gray-900 mt-2 line-clamp-1 hover:text-orange-600 transition-colors text-base">
                      {product.title || product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                    {product.description || product.content}
                  </p>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-gray-900">
                      ₹{product.offerPrice || product.price}
                    </span>
                    {product.oldPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{product.oldPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  <FaShoppingCart />
                  Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Wishlist;
