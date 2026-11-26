import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import OTPLoginModal from '../component/OTPLoginModal';
import ImageLoader from '../component/image-loader';

function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartSavings, getCartItemCount, clearCart } = useCart();
  const { isAuthenticated, requireLogin } = useUser();
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleQuantityChange = (itemKey, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(itemKey, newQuantity);
    }
  };

  const handleCheckout = () => {
    requireLogin(() => {
      navigate('/checkout', { state: { cartItems: cart } });
    });
  };

  const totalSavings = getCartSavings();

  if (cart.length === 0) {
    return (
      <section className="py-20 bg-[#fbf9f6] min-h-[75vh] flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-lg mx-auto text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-10 sm:p-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-[#edf6f1] rounded-full flex items-center justify-center text-[#134e35]">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#14261c] font-serif mb-3">
              Your bag is empty
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mb-8 leading-relaxed">
              Looks like you haven't added any thoughtful finds yet. Explore our store and pay easily with Cash on Delivery.
            </p>
            <Link
              to="/product"
              className="inline-flex items-center gap-2 bg-[#134e35] hover:bg-[#0e3a27] text-white px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-14 bg-[#fbf9f6] min-h-screen">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-1">
              YOUR SHOPPING BAG
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#14261c] font-serif">
              Shopping Bag.
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              You have {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'} ready for delivery
            </p>
          </div>

          <Link
            to="/product"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#134e35] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue shopping</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="bg-[#134e35] px-6 py-4 flex justify-between items-center text-white">
                <h2 className="text-sm sm:text-base font-bold">Items in Your Bag</h2>
                <button
                  onClick={clearCart}
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.map((item) => {
                  const itemKey = item.cart_item_key || item.id;
                  const unitPrice = parseFloat(item.offerPrice || item.price || 0);
                  const oldUnit = parseFloat(item.oldPrice || item.old_price || item.product_details?.oldPrice || item.product_details?.old_price || 0);
                  return (
                    <div key={itemKey} className="p-5 sm:p-6 hover:bg-[#fafbfa] transition-colors">
                      <div className="flex gap-4 sm:gap-6">
                        <Link
                          to={`/product-view/${item.id}`}
                          className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-[#f5f6f5] rounded-2xl overflow-hidden border border-gray-100 p-2 flex items-center justify-center"
                        >
                          <ImageLoader
                            src={item.image_url || item.image || item.gallery?.[0]}
                            alt={item.title || item.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </Link>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                to={`/product-view/${item.id}`}
                                className="text-sm sm:text-base font-bold text-gray-900 hover:text-[#134e35] transition-colors line-clamp-1"
                              >
                                {item.title || item.name}
                              </Link>
                              <button
                                onClick={() => removeFromCart(itemKey)}
                                className="text-gray-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                title="Remove from bag"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {(item.selectedSize || item.selectedColor) && (
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                {item.selectedSize && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                                    Size: {item.selectedSize}
                                  </span>
                                )}
                                {item.selectedColor && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full border border-gray-300 inline-block"
                                      style={{ backgroundColor: item.selectedColor.toLowerCase() }}
                                    />
                                    {item.selectedColor}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-gray-200 rounded-xl px-1.5 py-1 bg-white">
                              <button
                                onClick={() => handleQuantityChange(itemKey, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-1.5 text-gray-600 hover:text-black disabled:opacity-30 cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-10 text-center font-bold text-sm text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(itemKey, item.quantity + 1)}
                                className="p-1.5 text-gray-600 hover:text-black cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="text-base sm:text-lg font-black text-gray-900">
                                ₹{Math.round(unitPrice * (item.quantity || 1)).toLocaleString('en-IN')}
                              </div>
                              {oldUnit > unitPrice && (
                                <div className="text-[11px] text-gray-400 line-through">
                                  ₹{Math.round(oldUnit * (item.quantity || 1)).toLocaleString('en-IN')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sticky top-24 space-y-5">
              <h2 className="text-lg font-bold text-[#14261c]">Order Summary</h2>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({getCartItemCount()} items)</span>
                  <span className="font-semibold text-gray-900">₹{Math.round(getCartTotal()).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="font-bold text-[#134e35]">FREE</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl text-xs font-semibold">
                    <span>Your Total Savings</span>
                    <span>-₹{Math.round(totalSavings).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Payment</span>
                  <span className="font-semibold text-gray-800">Cash on Delivery</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Order Total</span>
                  <span className="text-2xl font-black text-[#134e35]">
                    ₹{Math.round(getCartTotal()).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-[#134e35] hover:bg-[#0e3a27] text-white px-6 py-3.5 rounded-full text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Proceed to Checkout (COD)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setIsOtpModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-full border border-[#134e35]/25 bg-[#f6f9f7] hover:bg-[#eaf4ee] text-[#134e35] text-xs font-bold transition-colors cursor-pointer"
                >
                  Have saved addresses? Sign in with OTP →
                </button>
              )}

              <div className="pt-2 space-y-2 text-xs text-gray-600 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#134e35]" />
                  <span>Free delivery across Kerala & India</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#134e35]" />
                  <span>7-day easy replacement & returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#134e35]" />
                  <span>Pay with Cash or UPI at doorstep</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OTPLoginModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={() => navigate('/checkout', { state: { cartItems: cart } })}
      />
    </section>
  );
}

export default Cart;
