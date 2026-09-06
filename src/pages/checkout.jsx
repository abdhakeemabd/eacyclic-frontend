import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ImageLoader from '../component/image-loader';
import { ordersAPI } from '../utils/api';

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract product and quantity from navigation state
  const { product, quantity = 1 } = location.state || {};

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    houseName: '',
    area: '',
    city: '',
    district: '',
    state: '',
    country: 'India',
    pincode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!product) {
      navigate('/product', { replace: true });
    }
  }, [product, navigate]);

  if (!product) return null;

  const price = product.offerPrice || product.price || 0;
  const deliveryFee = 0; // Fixed free delivery for now
  const total = (price * quantity) + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Professional Sequential Order ID Generation
    const generateOrderId = () => {
      try {
        const existingOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        const numericIds = existingOrders
          .map(o => parseInt(o.id, 10))
          .filter(id => !isNaN(id));
        
        if (numericIds.length === 0) return 1;
        return Math.max(...numericIds) + 1;
      } catch (e) {
        return Math.floor(Math.random() * 10000) + 1000;
      }
    };
    
    const orderPayload = {
      id: generateOrderId(),
      created_at: new Date().toISOString(),
      customer_name: formData.name,
      customer_email: "",
      customer_phone: formData.phone,
      shipping_address: `${formData.houseName}, ${formData.area}, ${formData.city}, ${formData.district}, ${formData.state} - ${formData.pincode}, ${formData.country}`,
      subtotal: price * quantity,
      shipping_cost: deliveryFee,
      tax: 0,
      total: total,
      status: 'pending',
      items: [
        {
          product_name: product.title,
          quantity: quantity,
          price: price
        }
      ]
    };

    try {
      // Save locally as source of truth for frontend demo
      const existingOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      localStorage.setItem('adminOrders', JSON.stringify([orderPayload, ...existingOrders]));

      // Try to post to backend API silently
      try {
        await ordersAPI.create(orderPayload);
      } catch (apiError) {
        console.warn("Backend API failed, but order saved locally.");
      }

      Swal.fire({
        icon: 'success',
        title: 'Order Placed!',
        text: 'Your order has been placed successfully.',
        confirmButtonColor: '#0ea5e9',
        customClass: { popup: 'rounded-2xl' }
      }).then(() => {
        navigate('/', { replace: true });
      });
      
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: 'Something went wrong while placing your order. Please try again.',
        customClass: { popup: 'rounded-2xl' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tight">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Delivery Address Form */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Delivery Address
              </h2>
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all" placeholder="Enter Your Name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                    <input required type="tel" maxLength="10" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all" placeholder="Enter Your Phone Number" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">House / Building Name <span className="text-red-500">*</span></label>
                  <input required type="text" name="houseName" value={formData.houseName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all" placeholder="Apartment, Studio, or Floor" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Area / Street <span className="text-red-500">*</span></label>
                  <input required type="text" name="area" value={formData.area} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all" placeholder="Main Street" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">City / Town <span className="text-red-500">*</span></label>
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all" placeholder="Enter City Name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">District <span className="text-red-500">*</span></label>
                    <input required type="text" name="district" value={formData.district} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all" placeholder="Enter District Name" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">State <span className="text-red-500">*</span></label>
                    <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all" placeholder="Enter State Name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Country <span className="text-red-500">*</span></label>
                    <input required type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Pincode <span className="text-red-500">*</span></label>
                    <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all" placeholder="Enter Pincode" />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <span className="bg-gray-100 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Order Summary
              </h2>
              
              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                  <ImageLoader 
                    src={product.image_url || product.image || (product.gallery && product.gallery[0])} 
                    alt={product.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">{product.title}</h3>
                  {product.category && <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">{product.category}</p>}
                  <p className="text-gray-500 text-sm">Qty: <span className="font-bold text-gray-900">{quantity}</span></p>
                </div>
              </div>

              <div className="space-y-3 text-sm border-t border-gray-100 pt-6">
                <div className="flex justify-between text-gray-600">
                  <span>Price ({quantity} item)</span>
                  <span>₹{price * quantity}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="text-green-600 font-medium">{deliveryFee === 0 ? 'FREE Delivery' : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-dashed border-gray-200 mt-2">
                  <span>Total Amount</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  type="submit" 
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Confirm Order'
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Safe and Secure Payments
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Checkout;
