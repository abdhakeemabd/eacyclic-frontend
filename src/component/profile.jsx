import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import ImageLoader from './image-loader';
import OTPLoginModal from './OTPLoginModal';
import { showSuccess } from '../utils/swalUtils';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Edit3,
  Save,
  X,
  Heart,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ChevronRight,
  UserCheck,
  WifiOff,
  BadgeAlert,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBasket,
  Lock,
  Layers,
  Award,
  Crown
} from 'lucide-react';
import Swal from 'sweetalert2';

function Profile() {
  const { user, updateUserProfile, loading, logout, isAuthenticated, isOfflineMode } = useUser();
  const {
    cart = [],
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartItemCount,
    clearCart,
    likes = [],
    toggleLike,
    addToCart
  } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'cart' | 'wishlist'
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
  });
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

  // Sync tab from URL query params or location state
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['personal', 'cart', 'wishlist'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (location.state?.tab && ['personal', 'cart', 'wishlist'].includes(location.state.tab)) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  // Sync form data from authenticated user context ONLY
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData({
        name: user.name || user.first_name || '',
        email: user.email || '',
        phone: user.phone || user.profile?.phone || '',
        age: user.age || user.profile?.age || '',
        gender: user.gender || user.profile?.gender || '',
        address: user.address || user.profile?.address || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: '',
        address: '',
      });
    }
  }, [user, isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateCompletion = () => {
    const fields = [formData.name, formData.email, formData.phone, formData.age, formData.gender, formData.address];
    const filled = fields.filter(f => f && String(f).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleSave = async () => {
    try {
      if (user) {
        const result = await updateUserProfile(formData);
        if (result.success) {
          setSaveMessage({
            type: 'success',
            text: 'Profile updated successfully!'
          });
        } else {
          setSaveMessage({
            type: 'warning',
            text: 'Profile saved locally. Syncing will occur when online.'
          });
        }
      } else {
        setSaveMessage({
          type: 'warning',
          text: 'Please log in to save your profile.'
        });
      }

      setIsEditing(false);
      setTimeout(() => setSaveMessage({ type: '', text: '' }), 4000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.'
      });
      setTimeout(() => setSaveMessage({ type: '', text: '' }), 4000);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || user.first_name || '',
        email: user.email || '',
        phone: user.phone || user.profile?.phone || '',
        age: user.age || user.profile?.age || '',
        gender: user.gender || user.profile?.gender || '',
        address: user.address || user.profile?.address || '',
      });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Log out of account?',
      text: 'Are you sure you want to sign out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Sign Out',
      customClass: {
        popup: 'rounded-2xl shadow-xl'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        localStorage.removeItem('userProfile');
        navigate('/', { replace: true });
        Swal.fire({
          icon: 'info',
          title: 'Logged Out',
          text: 'You have been signed out. Please log in to access your account.',
          timer: 3500,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-2xl shadow-xl border border-slate-200 bg-white font-sans'
          }
        });
      }
    });
  };

  const handleAddToCartFromWishlist = (product) => {
    addToCart(product, 1);
    showSuccess('Added to Cart', `${product.title || product.name} has been added to your cart.`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const completionPct = calculateCompletion();

  // If user is logged out, show clean authentication prompt card
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50/80 py-16 px-4 flex items-center justify-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-6">
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Sign In Required</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              You are currently logged out. Please sign in to view your profile details, cart, and saved items.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={() => setIsOtpModalOpen(true)}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Sign In / Login
            </button>
            <Link
              to="/"
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all block text-center"
            >
              Back to Home
            </Link>
          </div>

          <OTPLoginModal
            isOpen={isOtpModalOpen}
            onClose={() => setIsOtpModalOpen(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200/70">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-900">User Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            {isOfflineMode && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                Offline Mode
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified User
            </span>
          </div>
        </div>

        {/* Executive Professional Profile Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-850 to-orange-950 rounded-3xl text-white shadow-2xl border border-slate-700/60">
          {/* Subtle background ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Avatar & User Details Header */}
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-orange-400 p-1 shadow-2xl flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-white border border-slate-800">
                    <span className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-200">
                      {formData.name ? formData.name.charAt(0) : 'U'}
                    </span>
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 bg-emerald-500 border-2 border-slate-900 w-5 h-5 rounded-full shadow-lg" title="Active Account"></span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white capitalize">
                  {formData.name || 'Valued Customer'}
                </h1>
                <p className="text-sm text-slate-300 font-medium flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                  {formData.email || 'No email registered'}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
              {!isEditing ? (
                <button
                  onClick={() => {
                    setActiveTab('personal');
                    setIsEditing(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-200 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Details
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all duration-200 flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="px-5 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold rounded-xl border border-rose-500/30 transition-all duration-200 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        <AnimatePresence>
          {saveMessage.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold ${
                saveMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : saveMessage.type === 'warning'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {saveMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              {saveMessage.type === 'warning' && <BadgeAlert className="w-5 h-5 text-amber-600 shrink-0" />}
              {saveMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
              <span>{saveMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Dashboard Layout with Vertical Left Navigation Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Sidebar Vertical Tabs Navigation */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Navigation Card */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden p-2.5 space-y-1">
              <div className="p-3 pb-2 border-b border-slate-100 mb-1">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Navigation Tabs</h3>
              </div>

              {/* Vertical Tab 1: Personal Info */}
              <button
                onClick={() => setActiveTab('personal')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-left ${
                  activeTab === 'personal'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md'
                    : 'text-slate-700 hover:bg-slate-50 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className={`w-5 h-5 ${activeTab === 'personal' ? 'text-white' : 'text-orange-500'}`} />
                  <div>
                    <div className="text-sm font-bold">Personal Info</div>
                    <div className={`text-[11px] ${activeTab === 'personal' ? 'text-orange-100' : 'text-slate-400'}`}>
                      Profile details & address
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === 'personal' ? 'text-white' : 'text-slate-400'}`} />
              </button>

              {/* Vertical Tab 2: My Cart */}
              <button
                onClick={() => setActiveTab('cart')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-left ${
                  activeTab === 'cart'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md'
                    : 'text-slate-700 hover:bg-slate-50 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className={`w-5 h-5 ${activeTab === 'cart' ? 'text-white' : 'text-orange-500'}`} />
                  <div>
                    <div className="text-sm font-bold">My Cart</div>
                    <div className={`text-[11px] ${activeTab === 'cart' ? 'text-orange-100' : 'text-slate-400'}`}>
                      {getCartItemCount()} item(s) pending
                    </div>
                  </div>
                </div>
                {getCartItemCount() > 0 && (
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    activeTab === 'cart' ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'
                  }`}>
                    {getCartItemCount()}
                  </span>
                )}
              </button>

              {/* Vertical Tab 3: Wishlist */}
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-left ${
                  activeTab === 'wishlist'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md'
                    : 'text-slate-700 hover:bg-slate-50 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className={`w-5 h-5 ${activeTab === 'wishlist' ? 'text-white' : 'text-rose-500'}`} />
                  <div>
                    <div className="text-sm font-bold">Saved Wishlist</div>
                    <div className={`text-[11px] ${activeTab === 'wishlist' ? 'text-orange-100' : 'text-slate-400'}`}>
                      {likes.length} saved product(s)
                    </div>
                  </div>
                </div>
                {likes.length > 0 && (
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    activeTab === 'wishlist' ? 'bg-white text-orange-600' : 'bg-rose-500 text-white'
                  }`}>
                    {likes.length}
                  </span>
                )}
              </button>

            </div>

            {/* Profile Completion Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Profile Completion</h3>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">{completionPct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                {completionPct === 100 
                  ? 'Great job! Profile details are complete.' 
                  : 'Fill in your age, address, and phone number for faster checkout.'}
              </p>
            </div>

          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-8">

            {/* TAB 1: PERSONAL INFORMATION */}
            {activeTab === 'personal' && (
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
                
                <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-500" />
                    Personal Information
                  </h2>

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 hover:underline"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  
                  {/* Full Name & Email Address (Email READONLY) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-orange-500" />
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800 text-sm font-medium transition-all"
                          placeholder="Enter full name"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-slate-50/80 rounded-xl text-slate-800 font-semibold text-sm border border-slate-100">
                          {formData.name || <span className="text-slate-400 font-normal italic">Not specified</span>}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-4 h-4 text-orange-500" />
                          Email Address
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal lowercase flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          (Read-only)
                        </span>
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            readOnly
                            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium cursor-not-allowed outline-none pr-9"
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-slate-50/80 rounded-xl text-slate-800 font-semibold text-sm border border-slate-100 flex items-center justify-between">
                          <span>{formData.email || <span className="text-slate-400 font-normal italic">Not specified</span>}</span>
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phone & Age & Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-orange-500" />
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          maxLength="10"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800 text-sm font-medium transition-all"
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-slate-50/80 rounded-xl text-slate-800 font-semibold text-sm border border-slate-100">
                          {formData.phone || <span className="text-slate-400 font-normal italic">Not specified</span>}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        Age
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          min="1"
                          max="120"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800 text-sm font-medium transition-all"
                          placeholder="Age"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-slate-50/80 rounded-xl text-slate-800 font-semibold text-sm border border-slate-100">
                          {formData.age ? `${formData.age} years` : <span className="text-slate-400 font-normal italic">Not specified</span>}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-orange-500" />
                        Gender
                      </label>
                      {isEditing ? (
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800 text-sm font-medium transition-all capitalize"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      ) : (
                        <div className="px-4 py-3 bg-slate-50/80 rounded-xl text-slate-800 font-semibold text-sm border border-slate-100 capitalize">
                          {formData.gender || <span className="text-slate-400 font-normal italic">Not specified</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address Field */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        rows="3"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800 text-sm font-medium transition-all resize-none"
                        placeholder="Enter primary address"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-slate-50/80 rounded-xl text-slate-800 font-semibold text-sm border border-slate-100 leading-relaxed">
                        {formData.address || <span className="text-slate-400 font-normal italic">No address provided</span>}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: MY CART VIEW */}
            {activeTab === 'cart' && (
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="w-6 h-6 text-orange-500" />
                      My Shopping Cart
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      You have {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'} in your cart
                    </p>
                  </div>

                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear Cart
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                      <ShoppingBasket className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Your Cart is Empty</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Browse our products and add items to your cart to review them here.
                    </p>
                    <Link
                      to="/product"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                    >
                      Browse Products
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50/70 border border-slate-100 rounded-xl gap-4 hover:border-orange-200 transition-colors"
                        >
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            <img
                              src={item.image_url || item.image || item.gallery?.[0]}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-lg bg-white border border-slate-200 shrink-0"
                            />
                            <div>
                              <Link to={`/product-view/${item.id}`} className="font-bold text-slate-800 hover:text-orange-600 text-sm line-clamp-1">
                                {item.title}
                              </Link>
                              <div className="text-xs text-slate-500 font-semibold mt-0.5">
                                ₹{item.offerPrice || item.price} each
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-1.5 hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 hover:bg-slate-100 text-slate-600"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-extrabold text-slate-900">
                                ₹{((item.offerPrice || item.price) * item.quantity).toFixed(2)}
                              </div>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                      <h3 className="text-base font-bold text-slate-800">Order Summary</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal ({getCartItemCount()} items)</span>
                          <span className="font-bold text-slate-800">₹{getCartTotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Shipping</span>
                          <span className="font-bold text-emerald-600">FREE</span>
                        </div>
                        <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm font-bold text-slate-900">
                          <span>Total Amount</span>
                          <span className="text-lg text-orange-600">₹{getCartTotal().toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate('/checkout', { state: { cartItems: cart } })}
                        className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        Proceed to Checkout
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: WISHLIST VIEW */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Heart className="w-6 h-6 text-rose-500" />
                      Liked Wishlist Items
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {likes.length} product(s) saved in your wishlist
                    </p>
                  </div>
                </div>

                {likes.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                      <Heart className="w-10 h-10 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Your Wishlist is Empty</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Heart items while browsing to save them for later!
                    </p>
                    <Link
                      to="/product"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                    >
                      Explore Products
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {likes.map((product) => (
                      <div
                        key={product.id}
                        className="bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-orange-200 transition-all overflow-hidden flex flex-col justify-between group"
                      >
                        <div className="relative">
                          <div className="w-full h-44 bg-white relative overflow-hidden">
                            <ImageLoader
                              src={product.image_url || product.image || (product.gallery && product.gallery[0])}
                              alt={product.title || product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <button
                              onClick={() => toggleLike(product)}
                              className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 shadow-sm"
                              title="Remove from Liked"
                            >
                              <Heart className="w-4 h-4 fill-rose-500" />
                            </button>
                          </div>

                          <div className="p-4 space-y-1.5">
                            <Link to={`/product-view/${product.id}`}>
                              <h4 className="font-bold text-slate-800 hover:text-orange-600 text-sm line-clamp-1">
                                {product.title || product.name}
                              </h4>
                            </Link>
                            <div className="text-sm font-extrabold text-slate-900">
                              ₹{product.offerPrice || product.price}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <button
                            onClick={() => handleAddToCartFromWishlist(product)}
                            className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Move to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default Profile;