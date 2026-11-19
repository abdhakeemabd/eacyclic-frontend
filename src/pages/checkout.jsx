import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { showSuccess, showError } from '../utils/swalUtils';
import ImageLoader from '../component/image-loader';
import { ordersAPI } from '../utils/api';
import OTPLoginModal from '../component/OTPLoginModal';
import { 
  Lock, ArrowLeft, Check, Minus, Plus,
  Banknote, ShieldCheck, CheckCircle2, Truck,
  Home, Building2, MapPin, MoreHorizontal, Edit2, Trash2, X
} from 'lucide-react';
import SearchableSelect from '../component/SearchableSelect';
import { COUNTRIES, getStatesForCountry, getDistrictsForState } from '../data/locationData';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, saveUserAddress, deleteUserAddress } = useUser();
  const { clearCart } = useCart();
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  
  // Extract product, quantity or cart items from navigation state
  const { product, quantity = 1, cartItems } = location.state || {};
  const [items, setItems] = useState(() => {
    if (cartItems && cartItems.length > 0) return cartItems;
    if (product) return [{ ...product, quantity }];
    return [];
  });

  // Saved Addresses from user profile
  const savedAddresses = Array.isArray(user?.saved_addresses) ? user.saved_addresses : [];

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    if (savedAddresses.length > 0) {
      const def = savedAddresses.find(a => a.isDefault);
      return def ? def.id : savedAddresses[0].id;
    }
    return null;
  });

  // Keep selectedAddressId valid and in-sync with user profile
  useEffect(() => {
    if (savedAddresses.length > 0) {
      if (!selectedAddressId || !savedAddresses.some(a => a.id === selectedAddressId)) {
        const def = savedAddresses.find(a => a.isDefault);
        setSelectedAddressId(def ? def.id : savedAddresses[0].id);
      }
    } else {
      setSelectedAddressId(null);
    }
  }, [user?.saved_addresses]);

  const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId) || (savedAddresses.length > 0 ? savedAddresses[0] : null);

  // Modal and address management states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Default address template for modal
  const defaultModalAddress = {
    name: user?.name || '',
    phone: user?.phone || '',
    houseName: '',
    area: '',
    country: 'India',
    state: '',
    district: '',
    city: '',
    pincode: '',
    type: 'HOME',
    isDefault: savedAddresses.length === 0
  };

  const [modalAddressForm, setModalAddressForm] = useState(defaultModalAddress);

  // Close three-dot menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeMenuId]);

  // Form data for when user enters a custom address without saved addresses
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
    type: 'HOME',
    email: user?.email || '',
    saveToProfile: true
  });

  // Payment method: strictly Cash on Delivery
  const paymentMethod = 'cod';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const availableStates = getStatesForCountry(formData.country || 'India');
  const availableDistricts = getDistrictsForState(formData.country || 'India', formData.state);

  const modalAvailableStates = getStatesForCountry(modalAddressForm.country || 'India');
  const modalAvailableDistricts = getDistrictsForState(modalAddressForm.country || 'India', modalAddressForm.state);

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
  const deliveryFee = 0; // Free delivery matching platform policy
  const total = subtotal + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Helper to construct a clean comma-separated address string matching the screenshots
  const getFormattedAddress = (addr) => {
    if (!addr) return '';
    return [
      addr.houseName,
      addr.area,
      addr.city,
      addr.district,
      addr.state ? `${addr.state} ${addr.pincode || ''}`.trim() : addr.pincode
    ].filter(Boolean).join(', ');
  };

  // Save address from modal (Add / Edit)
  const handleSaveModalAddress = async (e) => {
    if (e) e.preventDefault();

    if (!modalAddressForm.name?.trim() || !modalAddressForm.phone?.trim() || 
        !modalAddressForm.houseName?.trim() || !modalAddressForm.city?.trim() || 
        !modalAddressForm.district?.trim() || !modalAddressForm.state?.trim() || 
        !modalAddressForm.pincode?.trim()) {
      showError('Required Fields Missing', 'Please fill all mandatory address fields.');
      return;
    }

    const cleanPhone = String(modalAddressForm.phone).replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      showError('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    const cleanPincode = String(modalAddressForm.pincode).replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      showError('Invalid PIN Code', 'Please enter a valid 6-digit postal PIN code.');
      return;
    }

    try {
      setIsSavingAddress(true);
      const addressToSave = {
        ...modalAddressForm,
        name: modalAddressForm.name.trim(),
        phone: cleanPhone,
        houseName: modalAddressForm.houseName.trim(),
        area: modalAddressForm.area ? modalAddressForm.area.trim() : '',
        city: modalAddressForm.city.trim(),
        district: modalAddressForm.district.trim(),
        state: modalAddressForm.state.trim(),
        country: modalAddressForm.country || 'India',
        pincode: cleanPincode,
        type: modalAddressForm.type || 'HOME'
      };

      const res = await saveUserAddress(addressToSave);
      if (res?.success) {
        showSuccess('Address Saved', 'Delivery address has been saved to your profile.');
        setIsAddressFormOpen(false);
        setIsAddressModalOpen(false);
        if (addressToSave.id) {
          setSelectedAddressId(addressToSave.id);
        } else if (res.data?.saved_addresses?.length > 0) {
          setSelectedAddressId(res.data.saved_addresses[0].id);
        }
      } else {
        showError('Save Failed', res?.error || 'Failed to save address.');
      }
    } catch (err) {
      console.error('Error saving address:', err);
      showError('Error', err.message || 'Failed to save address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Delete an address
  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await deleteUserAddress(addressId);
      if (res?.success) {
        showSuccess('Address Removed', 'The address has been removed from your profile.');
        if (selectedAddressId === addressId) {
          const remaining = savedAddresses.filter(a => a.id !== addressId);
          if (remaining.length > 0) {
            setSelectedAddressId(remaining[0].id);
          } else {
            setSelectedAddressId(null);
          }
        }
      } else {
        showError('Delete Failed', res?.error || 'Failed to delete address.');
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      showError('Error', err.message || 'Failed to delete address.');
    }
  };

  // Submit Order
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const generateOrderId = () => {
      return Math.floor(Date.now() / 1000) * 1000 + Math.floor(Math.random() * 900) + 100;
    };
    
    // Active address resolution
    const activeAddress = selectedAddress ? {
      name: selectedAddress.name,
      phone: selectedAddress.phone,
      houseName: selectedAddress.houseName,
      area: selectedAddress.area,
      city: selectedAddress.city,
      district: selectedAddress.district,
      state: selectedAddress.state,
      country: selectedAddress.country || 'India',
      pincode: selectedAddress.pincode,
      type: selectedAddress.type || 'HOME'
    } : {
      name: formData.name,
      phone: formData.phone,
      houseName: formData.houseName,
      area: formData.area,
      city: formData.city,
      district: formData.district,
      state: formData.state,
      country: formData.country || 'India',
      pincode: formData.pincode,
      type: formData.type || 'HOME'
    };

    // Explicit validation fallback
    if (!activeAddress.name?.trim() || !activeAddress.phone?.trim() || 
        !activeAddress.houseName?.trim() || !activeAddress.city?.trim() || 
        !activeAddress.district?.trim() || !activeAddress.state?.trim() || !activeAddress.pincode?.trim()) {
      showError('Required Fields Missing', 'Please fill all mandatory delivery fields to continue.');
      setIsSubmitting(false);
      return;
    }

    const cleanPhone = String(activeAddress.phone).replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      showError('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      setIsSubmitting(false);
      return;
    }

    const cleanPincode = String(activeAddress.pincode).replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      showError('Invalid PIN Code', 'Please enter a valid 6-digit postal PIN code.');
      setIsSubmitting(false);
      return;
    }

    if (!isAuthenticated) {
      setIsOtpModalOpen(true);
      setIsSubmitting(false);
      return;
    }

    // If customer entered address in form directly (no saved address chosen), save to profile
    if (!selectedAddress && (formData.saveToProfile || savedAddresses.length === 0)) {
      try {
        await saveUserAddress({
          ...activeAddress,
          phone: cleanPhone,
          pincode: cleanPincode
        });
      } catch (err) {
        console.error('Failed to auto-save address to profile:', err);
      }
    }

    const generatedId = generateOrderId();
    const shippingString = [
      activeAddress.houseName.trim(),
      activeAddress.area ? activeAddress.area.trim() : '',
      activeAddress.city.trim(),
      activeAddress.district.trim(),
      `${activeAddress.state.trim()} - ${cleanPincode}`,
      activeAddress.country || 'India'
    ].filter(Boolean).join(', ');

    const orderPayload = {
      id: generatedId,
      customer_name: activeAddress.name.trim(),
      customer_email: (user?.email || formData.email || '').trim(),
      customer_phone: cleanPhone,
      shipping_address: shippingString,
      subtotal: subtotal,
      shipping_cost: deliveryFee,
      tax: 0,
      total: total,
      status: 'pending',
      payment_method: 'Cash on Delivery',
      payment_status: 'Pending',
      items: items.map(item => ({
        product_id: item.id || null,
        product_name: item.title || item.name || 'Unknown Product',
        product_image: item.image_url || item.image || (item.gallery && item.gallery[0]) || '',
        selected_size: item.selectedSize || item.size || '',
        selected_color: item.selectedColor || item.color || '',
        quantity: item.quantity || 1,
        price: item.offerPrice || item.price || 0
      }))
    };

    try {
      const response = await ordersAPI.create(orderPayload);
      const savedOrder = response?.data || orderPayload;

      // Clear cart if items came from the shopping cart
      if (cartItems && cartItems.length > 0 && typeof clearCart === 'function') {
        try {
          await clearCart();
        } catch (err) {
          console.error('Failed to clear cart after checkout:', err);
        }
      }

      showSuccess('Order Placed!', `Your order #${savedOrder.id || generatedId} has been placed successfully.`).then(() => {
        navigate(`/order-status/${savedOrder.id || generatedId}`, {
          state: { order: savedOrder, isNewOrder: true },
          replace: true
        });
      });
    } catch (error) {
      console.error('Failed to place order:', error);
      showError('Order Failed', error.response?.data?.error || 'Something went wrong while placing your order. Please try again.');
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

        {/* Header Block */}
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
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit Secure Encryption</span>
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
            <span>Delivery & Payment</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-400 font-medium border border-gray-200">
            <span>03</span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Delivery Details & Payment Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Delivery Details (Amazon/Flipkart Saved Address View or Form) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
              
              {selectedAddress ? (
                /* Compact Saved Address Card matching Screenshot 1 */
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className="text-base font-normal text-gray-900 font-sans">
                      Deliver to:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddressFormOpen(false);
                        setIsAddressModalOpen(true);
                        setActiveMenuId(null);
                      }}
                      className="border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-blue-600 font-medium text-xs sm:text-sm px-4 py-1 rounded transition-colors shadow-2xs cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base font-bold text-gray-900">
                      {selectedAddress.name}
                    </span>
                    <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded tracking-wider uppercase">
                      {selectedAddress.type || 'HOME'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-800 leading-relaxed">
                    {getFormattedAddress(selectedAddress)}
                  </p>

                  <p className="text-sm text-gray-900 font-medium mt-2">
                    {selectedAddress.phone}
                  </p>
                </div>
              ) : (
                /* Address Input Form for New Users or Manual Entry */
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">01</span>
                      <span>Delivery address</span>
                    </h2>

                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddressFormOpen(false);
                          setIsAddressModalOpen(true);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Choose from saved
                      </button>
                    )}
                  </div>

                  <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Address Type Pills */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Address Type
                      </label>
                      <div className="flex items-center gap-2">
                        {['HOME', 'WORK', 'OTHER'].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              formData.type === type
                                ? 'bg-[#134e35] text-white border-[#134e35]'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Full name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Full name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="First and last name (e.g. John Doe)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                      />
                    </div>

                    {/* Email and Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Email address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          required
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="e.g. name@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Phone number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          required
                          type="tel"
                          maxLength="10"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="10-digit mobile number (e.g. 9876543210)"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                        />
                      </div>
                    </div>

                    {/* Street address */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Flat, House no., Building, Apartment <span className="text-rose-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        name="houseName"
                        value={formData.houseName}
                        onChange={handleInputChange}
                        placeholder="Flat, House no., Building, Company, Apartment"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                      />
                    </div>

                    {/* Area / Landmark */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Area, Street, Sector, Landmark <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        placeholder="Area, Street, Sector, Landmark (e.g. Near Apollo Pharmacy)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                      />
                    </div>

                    {/* Country & State Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <SearchableSelect
                          label="Country"
                          required
                          value={formData.country || 'India'}
                          onChange={(selectedCountry) => {
                            setFormData(prev => ({
                              ...prev,
                              country: selectedCountry,
                              state: '',
                              district: ''
                            }));
                          }}
                          options={COUNTRIES}
                          placeholder="Select Country"
                          searchPlaceholder="Search country..."
                        />
                      </div>

                      <div>
                        <SearchableSelect
                          label="State / Province"
                          required
                          value={formData.state}
                          onChange={(selectedState) => {
                            setFormData(prev => ({
                              ...prev,
                              state: selectedState,
                              district: ''
                            }));
                          }}
                          options={availableStates}
                          placeholder="Select State"
                          searchPlaceholder="Search state..."
                        />
                      </div>
                    </div>

                    {/* District, Town/City, PIN Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <SearchableSelect
                          label="District"
                          required
                          value={formData.district}
                          onChange={(selectedDistrict) => {
                            setFormData(prev => ({ ...prev, district: selectedDistrict }));
                          }}
                          options={availableDistricts}
                          placeholder={formData.state ? "Select or type District..." : "Enter District name..."}
                          searchPlaceholder="Search district..."
                          allowCustom={true}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Town / City <span className="text-rose-500">*</span>
                        </label>
                        <input
                          required
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="City / Town (e.g. Kozhikode, Kochi)"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          PIN Code <span className="text-rose-500">*</span>
                        </label>
                        <input
                          required
                          type="text"
                          maxLength="6"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="6-digit PIN (e.g. 673001)"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35] text-xs sm:text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                        />
                      </div>
                    </div>

                    {/* Save to Profile Checkbox */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="saveToProfile"
                        name="saveToProfile"
                        checked={formData.saveToProfile}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#134e35] rounded focus:ring-[#134e35]"
                      />
                      <label htmlFor="saveToProfile" className="text-xs text-gray-700 cursor-pointer">
                        Save this address to profile for future orders
                      </label>
                    </div>

                  </form>
                </div>
              )}

            </div>

            {/* 2. Payment Method: Cash on Delivery Only */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400">02</span>
                  <span>Payment method</span>
                </h2>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Verified & Safe</span>
                </div>
              </div>

              {/* Dedicated Cash on Delivery Card */}
              <div className="rounded-2xl border-2 border-[#134e35] bg-[#f8faf8] p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all">
                <div className="flex items-start gap-4">
                  {/* Selected check circle */}
                  <div className="w-6 h-6 rounded-full bg-[#134e35] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>

                  <div className="flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-[#134e35]" />
                        <span>Cash on Delivery (Pay on Delivery)</span>
                      </span>
                      <span className="text-[11px] bg-[#134e35] text-white px-2.5 py-0.5 rounded-full font-bold">
                        Pay at Doorstep
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      Pay with cash or UPI directly to the courier partner when your parcel is delivered. Zero advance payment required.
                    </p>

                    {/* Trust badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-gray-200/80 text-[11px]">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Zero Advance Payment</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                        <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Free Home Delivery</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Doorstep Verification</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary ("Your good finds") */}
          <div className="lg:col-span-5">
            <div className="bg-[#f8f9f8] rounded-2xl border border-gray-200/80 p-6 sm:p-7 sticky top-24">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
                <h2 className="text-base font-bold text-gray-900">
                  Your good finds
                </h2>
                <span className="text-xs text-gray-400 font-medium">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-1">
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
                          {item.category || 'Store Item'}
                        </p>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 mt-1.5 border border-gray-200 w-fit rounded-md px-1.5 py-0.5 bg-white">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(idx, -1)}
                            className="text-gray-500 hover:text-black p-0.5 transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs font-bold text-gray-800 px-1">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(idx, 1)}
                            className="text-gray-500 hover:text-black p-0.5 transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-gray-900">
                          ₹{(price * qty).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Promise Badge */}
              <div className="flex items-center gap-2.5 bg-emerald-50/80 border border-emerald-100 rounded-xl p-3 mb-5">
                <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                <div className="text-[11px] text-emerald-800 font-medium">
                  <span className="font-bold">Guaranteed Delivery:</span> Express delivery within 3-5 business days with live tracking.
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2.5 text-xs border-t border-gray-200 pt-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Standard Delivery</span>
                  <span className="text-[#134e35] font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Payment Method</span>
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    Cash on Delivery
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Order Total</span>
                  <span className="text-base text-[#134e35]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-[#134e35] hover:bg-[#0e3a27] text-white font-semibold text-sm py-3.5 rounded-full shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    `Place Order (Cash on Delivery) • ₹${total.toLocaleString('en-IN')}`
                  )}
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <span>Safe & Secure 256-bit SSL encrypted checkout</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Select Delivery Address Modal matching Screenshot 2 */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Top Drag Handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="px-6 py-3 flex items-center justify-between border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {isAddressFormOpen 
                  ? (modalAddressForm.id ? 'Edit delivery address' : 'Add new address') 
                  : 'Select delivery address'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setIsAddressFormOpen(false);
                  setActiveMenuId(null);
                }}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            {!isAddressFormOpen ? (
              <div className="p-6">
                {/* Subheader: Saved addresses & + Add New */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-gray-900">
                    Saved addresses
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setModalAddressForm({
                        ...defaultModalAddress,
                        name: user?.name || '',
                        phone: user?.phone || '',
                        isDefault: savedAddresses.length === 0
                      });
                      setIsAddressFormOpen(true);
                      setActiveMenuId(null);
                    }}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New</span>
                  </button>
                </div>

                {/* List of saved addresses matching Screenshot 2 */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {savedAddresses.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs">
                      No saved addresses found. Click "+ Add New" to add one.
                    </div>
                  ) : (
                    savedAddresses.map((addr) => {
                      const isSelected = addr.id === selectedAddressId;
                      const IconComponent = addr.type === 'WORK' ? Building2 : (addr.type === 'HOME' ? Home : MapPin);

                      return (
                        <div
                          key={addr.id}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setIsAddressModalOpen(false);
                            setActiveMenuId(null);
                          }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'border-blue-400 bg-blue-50/20 shadow-2xs'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <IconComponent className="w-5 h-5 text-gray-700 shrink-0 mt-0.5" />
                            
                            <div className="flex-1 min-w-0 pr-6">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900 truncate">
                                  {addr.name}
                                </span>
                                {isSelected && (
                                  <span className="text-xs font-semibold bg-[#e0f2fe] text-[#0284c7] px-2 py-0.5 rounded shrink-0">
                                    Selected
                                  </span>
                                )}
                              </div>

                              {/* Truncated snippet matching Screenshot 2 */}
                              <p className="text-xs text-gray-500 truncate mt-1">
                                {getFormattedAddress(addr)}
                              </p>

                              {addr.phone && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {addr.phone}
                                </p>
                              )}
                            </div>

                            {/* Three-dot menu */}
                            <div className="relative shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === addr.id ? null : addr.id);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors cursor-pointer"
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </button>

                              {/* Dropdown Menu */}
                              {activeMenuId === addr.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-100 rounded-lg shadow-lg z-20 py-1"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setModalAddressForm({
                                        id: addr.id,
                                        name: addr.name || '',
                                        phone: addr.phone || '',
                                        houseName: addr.houseName || '',
                                        area: addr.area || '',
                                        country: addr.country || 'India',
                                        state: addr.state || '',
                                        district: addr.district || '',
                                        city: addr.city || '',
                                        pincode: addr.pincode || '',
                                        type: addr.type || 'HOME',
                                        isDefault: Boolean(addr.isDefault)
                                      });
                                      setIsAddressFormOpen(true);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      handleDeleteAddress(addr.id);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* Address Add / Edit Form */
              <form onSubmit={handleSaveModalAddress} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Address Type pills */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Address Type
                  </label>
                  <div className="flex items-center gap-2">
                    {['HOME', 'WORK', 'OTHER'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setModalAddressForm(prev => ({ ...prev, type }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          modalAddressForm.type === type
                            ? 'bg-[#134e35] text-white border-[#134e35]'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Full name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={modalAddressForm.name}
                      onChange={e => setModalAddressForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Recipient full name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#134e35] text-xs sm:text-sm text-gray-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phone number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      maxLength="10"
                      value={modalAddressForm.phone}
                      onChange={e => setModalAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#134e35] text-xs sm:text-sm text-gray-900 outline-none"
                    />
                  </div>
                </div>

                {/* House / Flat */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Flat, House no., Building, Company <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={modalAddressForm.houseName}
                    onChange={e => setModalAddressForm(prev => ({ ...prev, houseName: e.target.value }))}
                    placeholder="Flat, House no., Building, Company, Apartment"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#134e35] text-xs sm:text-sm text-gray-900 outline-none"
                  />
                </div>

                {/* Area / Landmark */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Area, Street, Landmark <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={modalAddressForm.area}
                    onChange={e => setModalAddressForm(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="Area, Street, Landmark (e.g. Near cyber park)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#134e35] text-xs sm:text-sm text-gray-900 outline-none"
                  />
                </div>

                {/* Country & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <SearchableSelect
                      label="Country"
                      required
                      value={modalAddressForm.country || 'India'}
                      onChange={val => setModalAddressForm(prev => ({ ...prev, country: val, state: '', district: '' }))}
                      options={COUNTRIES}
                      placeholder="Select Country"
                      searchPlaceholder="Search country..."
                    />
                  </div>
                  <div>
                    <SearchableSelect
                      label="State"
                      required
                      value={modalAddressForm.state}
                      onChange={val => setModalAddressForm(prev => ({ ...prev, state: val, district: '' }))}
                      options={modalAvailableStates}
                      placeholder="Select State"
                      searchPlaceholder="Search state..."
                    />
                  </div>
                </div>

                {/* District, City, PIN Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <SearchableSelect
                      label="District"
                      required
                      value={modalAddressForm.district}
                      onChange={val => setModalAddressForm(prev => ({ ...prev, district: val }))}
                      options={modalAvailableDistricts}
                      placeholder={modalAddressForm.state ? "Select or type District..." : "District name..."}
                      searchPlaceholder="Search district..."
                      allowCustom={true}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Town / City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={modalAddressForm.city}
                      onChange={e => setModalAddressForm(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City / Town"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#134e35] text-xs sm:text-sm text-gray-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      PIN Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      maxLength="6"
                      value={modalAddressForm.pincode}
                      onChange={e => setModalAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="6-digit PIN"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#134e35] text-xs sm:text-sm text-gray-900 outline-none"
                    />
                  </div>
                </div>

                {/* Set as default checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="modal-default-address"
                    checked={modalAddressForm.isDefault}
                    onChange={e => setModalAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="w-4 h-4 text-[#134e35] rounded focus:ring-[#134e35]"
                  />
                  <label htmlFor="modal-default-address" className="text-xs text-gray-700 cursor-pointer">
                    Set as default delivery address
                  </label>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsAddressFormOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAddress}
                    className="px-5 py-2 bg-[#134e35] hover:bg-[#0e3a27] text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                  >
                    {isSavingAddress ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Save Address'
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Mandatory OTP Login Modal for Order Confirmation */}
      <OTPLoginModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={() => handleSubmit()}
      />
    </div>
  );
}
