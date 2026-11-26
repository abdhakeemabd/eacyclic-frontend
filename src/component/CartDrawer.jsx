import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import ImageLoader from './image-loader';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { requireLogin } = useUser();
  const {
    cart,
    isDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartSavings,
    getCartItemCount,
  } = useCart();

  if (!isDrawerOpen) return null;

  const total = getCartTotal();
  const savings = getCartSavings();
  const count = getCartItemCount();

  const handleCheckout = () => {
    closeCartDrawer();
    requireLogin(() => {
      navigate('/checkout', { state: { cartItems: cart } });
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-fadeIn"
        onClick={closeCartDrawer}
      />

      {/* Drawer Panel */}
      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between border-l border-gray-100">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#fbf9f6]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#134e35] text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#14261c] leading-tight">
                Your Bag
              </h2>
              <p className="text-[11px] text-gray-500">
                {count} {count === 1 ? 'item' : 'items'} ready for checkout
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCartDrawer}
            className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Banner */}
        <div className="px-6 py-2.5 bg-[#edf6f1] border-b border-[#d6eadf] flex items-center gap-2 text-xs font-semibold text-[#134e35]">
          <Truck className="w-4 h-4 shrink-0" />
          <span>Cash on Delivery & Free Doorstep Shipping unlocked!</span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#f5f6f5] flex items-center justify-center text-[#134e35]">
                <ShoppingBag className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">Your bag is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  Add items from our collection to get fast doorstep Cash on Delivery.
                </p>
              </div>
              <Link
                to="/product"
                onClick={closeCartDrawer}
                className="px-6 py-2.5 rounded-full bg-[#134e35] hover:bg-[#0e3a27] text-white text-xs font-bold transition-colors"
              >
                Explore Products
              </Link>
            </div>
          ) : (
            cart.map((item) => {
              const itemKey = item.cart_item_key || item.id;
              const unitPrice = parseFloat(item.offerPrice || item.price || 0);
              return (
                <div
                  key={itemKey}
                  className="flex gap-3.5 p-3 rounded-2xl border border-gray-100 bg-white shadow-2xs"
                >
                  <Link
                    to={`/product-view/${item.id}`}
                    onClick={closeCartDrawer}
                    className="w-18 h-18 rounded-xl bg-[#f5f6f5] p-1.5 shrink-0 flex items-center justify-center overflow-hidden"
                  >
                    <ImageLoader
                      src={item.image_url || item.image || item.gallery?.[0]}
                      alt={item.title || item.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/product-view/${item.id}`}
                          onClick={closeCartDrawer}
                          className="text-xs font-bold text-gray-900 hover:text-[#134e35] line-clamp-1 block"
                        >
                          {item.title || item.name}
                        </Link>
                        {(item.selectedSize || item.selectedColor) && (
                          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                            {[item.selectedSize, item.selectedColor].filter(Boolean).join(' • ')}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(itemKey)}
                        className="text-gray-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 px-1 py-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemKey, (item.quantity || 1) - 1)}
                          className="p-1 text-gray-600 hover:text-black cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-gray-900">
                          {item.quantity || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemKey, (item.quantity || 1) + 1)}
                          className="p-1 text-gray-600 hover:text-black cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-extrabold text-gray-900">
                        ₹{Math.round(unitPrice * (item.quantity || 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-[#fbf9f6] space-y-3">
            {savings > 0 && (
              <div className="flex justify-between text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
                <span>Total Savings</span>
                <span>-₹{Math.round(savings).toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">Subtotal</span>
              <span className="text-xl font-black text-[#14261c]">
                ₹{Math.round(total).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Link
                to="/cart"
                onClick={closeCartDrawer}
                className="py-3 px-4 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold text-center transition-colors"
              >
                View Full Bag
              </Link>
              <button
                type="button"
                onClick={handleCheckout}
                className="py-3 px-4 rounded-full bg-[#134e35] hover:bg-[#0e3a27] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>Checkout (COD)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#134e35]" />
              <span>Pay via Cash or UPI at delivery • 7-Day Returns</span>
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
