import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag, FaArrowRight } from 'react-icons/fa';
import { BiArrowBack } from 'react-icons/bi';

function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartItemCount, clearCart } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    const cartItems = cart.map(item => 
      `${item.title} (Qty: ${item.quantity}) - ₹${item.offerPrice || item.price}`
    ).join('\n');
    
    const total = getCartTotal();
    const message = `Hello, I want to place an order:\n\n${cartItems}\n\nTotal: ₹${total.toFixed(2)}\n\nPlease contact me to confirm the order.`;
    const whatsappUrl = `https://wa.me/919846007257?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (cart.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                <FaShoppingBag className="text-6xl text-orange-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
              </p>
              <Link
                to="/product"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <BiArrowBack className="text-xl" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            You have {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Cart Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Cart Items</h2>
                <button
                  onClick={clearCart}
                  className="text-white hover:text-red-200 transition-colors duration-200 flex items-center gap-2 text-sm"
                >
                  <FaTrash />
                  Clear All
                </button>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={item.image_url || item.image || item.gallery?.[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link
                            to={`/product-view/${item.id}`}
                            className="text-xl font-semibold text-gray-800 hover:text-orange-600 transition-colors duration-200"
                          >
                            {item.title}
                          </Link>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {item.content || item.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200"
                              disabled={item.quantity <= 1}
                            >
                              <FaMinus className="text-gray-700" />
                            </button>
                            <span className="w-16 text-center font-semibold text-lg text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-10 h-10 rounded-lg bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors duration-200"
                            >
                              <FaPlus className="text-white" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="flex flex-col items-end">
                              <div className="flex items-center gap-2">
                                {item.offer && (
                                  <span className="text-xl text-[#CC0C39] font-light">
                                    -{item.offer.replace(/[^0-9]/g, '')}%
                                  </span>
                                )}
                                <div className="flex items-start text-black">
                                  <span className="text-xs mt-1 font-medium italic">₹</span>
                                  <span className="text-2xl font-bold leading-none">
                                    {((item.offerPrice || item.price) * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              {item.oldPrice && (
                                <div className="text-xs text-gray-500 mt-1">
                                  M.R.P.: <span className="line-through">₹{(item.oldPrice * item.quantity).toFixed(2)}</span>
                                </div>
                              )}
                              <div className="text-[10px] text-gray-400 mt-1">
                                ₹{item.offerPrice || item.price} each
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 p-2"
                        title="Remove from cart"
                      >
                        <FaTrash className="text-xl" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping Button */}
            <Link
              to="/product"
              className="inline-flex items-center gap-2 mt-6 text-orange-600 hover:text-orange-700 font-semibold transition-colors duration-200"
            >
              <BiArrowBack />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({getCartItemCount()} items)</span>
                  <span className="font-semibold">₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (GST)</span>
                  <span className="font-semibold">Included</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">Total</span>
                    <span className="text-3xl font-bold text-orange-600">
                      ₹{getCartTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <FaArrowRight />
              </button>

              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 text-center font-medium">
                  🎉 Free shipping on all orders!
                </p>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Easy returns within 7 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Quality guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Cart;
