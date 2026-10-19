import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { showSuccess, showError } from '../utils/swalUtils';
import ImageLoader from '../component/image-loader';
import { ordersAPI } from '../utils/api';
import OTPLoginModal from '../component/OTPLoginModal';
import { Lock, ArrowLeft, Check, Minus, Plus } from 'lucide-react';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  
  // Extract product, quantity or cart items from navigation state
  const { product, quantity = 1, cartItems } = location.state || {};
  const [items, setItems] = useState(() => {
    if (cartItems && cartItems.length > 0) return cartItems;
    if (product) return [{ ...product, quantity }];
    return [];
  });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    houseName: user?.address || '',
    area: '',
    city: '',
    district: '',
    state: '',
    country: 'India',
    pincode: '',
    email: user?.email || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
        houseName: prev.houseName || user.address || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/product', { replace: true });
    }
  }, [items, navigate]);

  if (items.length === 0) return null;

  const handleQuantityChange = (index, delta) => {
    setItems(prev => {
      const updated = [...prev];
      const newQty = (updated[index].quantity || 1) + delta;
      if (newQty > 0) {
        updated[index] = { ...updated[index], quantity: newQty };
      }
      return updated;
    });
  };

  const subtotal = items.reduce((sum, item) => sum + (item.offerPrice || item.price || 0) * (item.quantity || 1), 0);
  const deliveryFee = 0; // Free delivery matching design
  const total = subtotal + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const generateOrderId = () => {
      return Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
    };
    
    // Explicit validation fallback to ensure no empty fields bypass HTML validation
    if (!formData.name?.trim() || !formData.phone?.trim() || !formData.email?.trim() || 
        !formData.houseName?.trim() || !formData.city?.trim() || 
        !formData.district?.trim() || !formData.state?.trim() || !formData.pincode?.trim()) {
      showError('Required Fields Missing', 'Please fill all mandatory fields to continue.');
      setIsSubmitting(false);
      return;
    }

    if (!isAuthenticated) {
      setIsOtpModalOpen(true);
      setIsSubmitting(false);
      return;
    }

    const orderPayload = {
      id: generateOrderId(),
      created_at: new Date().toISOString(),
      customer_name: formData.name.trim(),
      customer_email: formData.email.trim(),
      customer_phone: formData.phone.trim(),
      shipping_address: `${formData.houseName}, ${formData.area ? formData.area + ', ' : ''}${formData.city}, ${formData.district}, ${formData.state} - ${formData.pincode}, ${formData.country}`,
      subtotal: subtotal,
      shipping_cost: deliveryFee,
      tax: 0,
      total: total,
      status: 'pending',
      items: items.map(item => ({
        product_id: item.id || null,
        product_name: item.title || item.name || 'Unknown Product',
        selected_size: item.selectedSize || item.size || '',
        selected_color: item.selectedColor || item.color || '',
        quantity: item.quantity || 1,
        price: item.offerPrice || item.price || 0
      }))
    };

    try {
      await ordersAPI.create(orderPayload);
      showSuccess('Order Placed!', 'Your order has been placed successfully.').then(() => {
        navigate('/', { replace: true });
      });
    } catch (error) {
      showError('Order Failed', 'Something went wrong while placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16 max-w-6xl">
        
        {/* Back Link */}
        <Link
          to="/product"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to shopping</span>
        </Link>

        {/* Header Block (Screenshot 5) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-1">
              A FEW STEPS FROM HOME
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight font-serif">
              Checkout.
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Your good finds, all together.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Your details stay with you</span>
          </div>
        </div>

        {/* Stepper Progress Badges */}
        <div className="flex items-center gap-3 mb-10 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0f4f1] text-[#134e35] font-semibold">
            <Check className="w-3.5 h-3.5" />
            <span>Your bag</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#14261c] text-white font-semibold shadow-xs">
            <span>02</span>
            <span>Delivery</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-400 font-medium border border-gray-200">
            <span>03</span>
            <span>Review</span>
          </div>
        </div>

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Delivery Details Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
              <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">01</span>
                <span>Delivery details</span>
              </h2>

              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                
                {/* Full name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Full name
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Email address
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Phone number
                    </label>
                    <input
                      required
                      type="tel"
                      maxLength="10"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Your contact number"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Street address */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Street address
                  </label>
                  <input
                    required
                    type="text"
                    name="houseName"
                    value={formData.houseName}
                    onChange={handleInputChange}
                    placeholder="House, apartment, or flat name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                  />
                </div>

                {/* Area / Land mark */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Area / Landmark
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="Nearby landmark, street or neighbourhood"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                  />
                </div>

                {/* City & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      City / Town
                    </label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City or locality"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      District
                    </label>
                    <input
                      required
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="District"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* State, Country, Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      State
                    </label>
                    <input
                      required
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Kerala"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Country
                    </label>
                    <input
                      required
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Pincode
                    </label>
                    <input
                      required
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="673645"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Order Summary ("Your good finds") (Screenshot 5) */}
          <div className="lg:col-span-5">
            <div className="bg-[#f8f9f8] rounded-2xl border border-gray-200/80 p-6 sm:p-7 sticky top-24">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
                <h2 className="text-base font-bold text-gray-900">
                  Your good finds
                </h2>
                <span className="text-xs text-gray-400">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-4 mb-6">
                {items.map((item, idx) => {
                  const price = item.offerPrice || item.price || 0;
                  const qty = item.quantity || 1;

                  return (
                    <div key={idx} className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
                      <div className="w-14 h-14 bg-[#f0f2f0] rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1">
                        <ImageLoader
                          src={item.image_url || item.image || (item.gallery && item.gallery[0])}
                          alt={item.title || item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-xs truncate">
                          {item.title || item.name}
                        </h3>
                        
                        {/* Selected Variants */}
                        {(item.selectedSize || item.selectedColor) && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {item.selectedSize && (
                              <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200">
                                Size: {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200">
                                <span 
                                  className="w-2 h-2 rounded-full border border-gray-300 inline-block"
                                  style={{ backgroundColor: item.selectedColor.toLowerCase() }}
                                />
                                {item.selectedColor}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-[10px] text-gray-400 uppercase font-medium mt-0.5">
                          {item.category || 'Appliances'}
                        </p>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 mt-1.5 border border-gray-200 w-fit rounded-md px-1.5 py-0.5 bg-white">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(idx, -1)}
                            className="text-gray-500 hover:text-black p-0.5"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs font-bold text-gray-800 px-1">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(idx, 1)}
                            className="text-gray-500 hover:text-black p-0.5"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-gray-900">
                          ₹{price * qty}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2.5 text-xs border-t border-gray-200 pt-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-[#134e35] font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="mt-6">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full bg-[#134e35] hover:bg-[#0e3a27] text-white font-semibold text-sm py-3.5 rounded-full shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Confirm order'
                  )}
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <span>Secure 256-bit encrypted checkout</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mandatory OTP Login Modal for Order Confirmation */}
      <OTPLoginModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={() => handleSubmit()}
      />
    </div>
  );
}
