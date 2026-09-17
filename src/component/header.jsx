import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../assets/images/logo/logo.png';
import { FaRegUser, FaShoppingCart, FaHeart, FaSignOutAlt, FaBell } from "react-icons/fa";
import { IoCloseOutline, IoMenuOutline, IoChevronDown } from "react-icons/io5";
import { AlertTriangle, CreditCard, RotateCcw, Star, Tag, Check, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import OTPLoginModal from './OTPLoginModal';

function Header() {
  const { user, logout, isAuthenticated, isOfflineMode } = useUser();
  const { getCartItemCount, likes = [] } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  // Mock Notifications List matching image design
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      bg: 'bg-amber-50',
      title: '9 SKUs went out of stock in Notebooks',
      time: '6 min ago',
      read: false
    },
    {
      id: 2,
      icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50',
      title: 'Settlement of ₹3,12,480 credited by Razorpay',
      time: '38 min ago',
      read: false
    },
    {
      id: 3,
      icon: <RotateCcw className="w-4 h-4 text-amber-600" />,
      bg: 'bg-amber-50',
      title: 'Order #MB-40213 marked as returned',
      time: '2 hours ago',
      read: false
    },
    {
      id: 4,
      icon: <Star className="w-4 h-4 text-blue-500" />,
      bg: 'bg-blue-50',
      title: '4 new reviews awaiting moderation',
      time: '5 hours ago',
      read: false
    },
    {
      id: 5,
      icon: <Tag className="w-4 h-4 text-slate-500" />,
      bg: 'bg-slate-100',
      title: 'Diwali Bundle campaign ended',
      time: 'Yesterday',
      read: true
    }
  ]);

  const userMenuRef = useRef();
  const notifMenuRef = useRef();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/product') {
      return location.pathname === '/product' || location.pathname.startsWith('/product-view/');
    }
    return location.pathname === path;
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigate = useNavigate();

  const handleLogout = () => {
    setUserMenuOpen(false);
    Swal.fire({
      title: 'Log out of account?',
      text: 'Are you sure you want to sign out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Sign Out',
      customClass: {
        popup: 'rounded-2xl shadow-xl font-sans'
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

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white py-2.5 sm:py-4 relative z-50 shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-2 sm:px-4 flex justify-between items-center gap-1.5 sm:gap-4">
        {/* Mobile Menu Button */}
        <div className="md:hidden shrink-0 flex items-center justify-center">
          <button aria-label="Open Menu" className="p-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-800" onClick={() => setMenuOpen(true)}>
            <IoMenuOutline size={22} className="block" />
          </button>
        </div>

        {/* Logo */}
        <Link to="/" className="shrink-0" aria-label="Homepage">
          <img className="h-7 sm:h-9 md:h-10 object-contain max-w-[110px] sm:max-w-none" src={Logo} alt="Logo" />
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input
              type="text"
              aria-label="Search for products"
              placeholder="Search for products..."
              className="w-full border border-gray-300 rounded-full py-2.5 px-6 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  window.location.href = `/product?search=${e.target.value}`;
                }
              }}
            />
            <button 
              aria-label="Search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-black"
              onClick={(e) => {
                const input = e.currentTarget.previousSibling;
                window.location.href = `/product?search=${input.value}`;
              }}
            >
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-10 items-center">
          <Link to="/" className={`font-semibold transition-all duration-300 py-1 ${isActive('/') ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-800 hover:text-red-600'}`}>Home</Link>
          <Link to="/product" className={`font-semibold transition-all duration-300 py-1 ${isActive('/product') ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-800 hover:text-red-600'}`}>Product</Link>
          <Link to="/contact" className={`font-semibold transition-all duration-300 py-1 ${isActive('/contact') ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-800 hover:text-red-600'}`}>Contact</Link>
        </nav>

        {/* Cart and User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Offline Mode General indicator */}
          {isOfflineMode && isAuthenticated && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Offline
            </div>
          )}

          {/* Wishlist / Liked Items Icon */}
          {isAuthenticated ? (
            <Link to="/profile?tab=wishlist" aria-label="Liked Items" className="relative p-2 sm:p-2.5 rounded-full hover:bg-slate-100 transition-colors">
              <FaHeart className={`w-3 h-3 sm:w-5 sm:h-5 ${likes.length > 0 ? "text-red-500" : "text-slate-700"}`} />
              {likes.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {likes.length}
                </span>
              )}
            </Link>
          ) : (
            <button
              onClick={() => setIsOtpModalOpen(true)}
              aria-label="Liked Items"
              className="relative p-2 sm:p-2.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <FaHeart className="w-3 h-3 sm:w-5 sm:h-5 text-slate-700" />
            </button>
          )}

          {/* Cart Icon */}
          {isAuthenticated ? (
            <Link to="/profile?tab=cart" aria-label="Shopping Cart" className="relative p-2 sm:p-2.5 rounded-full hover:bg-slate-100 transition-colors">
              <FaShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </Link>
          ) : (
            <button
              onClick={() => setIsOtpModalOpen(true)}
              aria-label="Shopping Cart"
              className="relative p-2 sm:p-2.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <FaShoppingCart className="w-3 h-3 sm:w-5 sm:h-5 text-slate-700" />
            </button>
          )}

          {/* User Logged In Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1 sm:gap-2.5 pl-1.5 sm:pl-2 border-l border-gray-200">
              {/* Notification Icon Bell Dropdown */}
              <div className="relative" ref={notifMenuRef}>
                <button
                  onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center relative transition-all"
                  aria-label="Notifications"
                >
                  <FaBell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-4.5 sm:h-4.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Modal */}
                {notifMenuOpen && (
                  <div className="absolute right-0 mt-3 w-72 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="space-y-2 mt-3 max-h-80 overflow-y-auto pr-1">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl flex items-start gap-2.5 transition-colors ${
                            !n.read ? 'bg-emerald-50/60 border border-emerald-100' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg ${n.bg} flex items-center justify-center shrink-0`}>
                            {n.icon}
                          </div>
                          <div className="flex-1 text-left space-y-0.5">
                            <p className="text-xs font-semibold text-slate-800 leading-tight">{n.title}</p>
                            <span className="text-[10px] text-slate-400 font-medium block">{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Name Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-sm uppercase shrink-0">
                    {user?.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="hidden xl:flex flex-col text-left max-w-[140px]">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-tight truncate">
                      {user?.name || 'Valued User'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium leading-tight truncate">
                      {user?.email || user?.phone || 'Customer Account'}
                    </span>
                  </div>
                  <IoChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200" />
                </button>

                {/* Account Menu Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex flex-col">
                      <div className="px-4 py-3 bg-slate-50/80 border-b border-gray-100">
                        <div className="font-bold text-sm text-slate-900 truncate">{user?.name}</div>
                        <div className="text-xs text-slate-500 truncate">{user?.email || user?.phone}</div>
                      </div>
                      <div className="flex flex-col p-2 gap-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          My Account
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold flex items-center gap-2"
                        >
                          <FaSignOutAlt className="text-xs" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Direct Icon Button when not logged in */
            <button
              onClick={() => setIsOtpModalOpen(true)}
              aria-label="Login"
              title="Login"
              className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-orange-600 transition-all cursor-pointer"
            >
              <FaRegUser className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Side Drawer Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Side Drawer */}
      <div className={`fixed top-0 left-0 h-full w-2/3 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden z-50 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-end p-4">
          <button aria-label="Close Menu" className="text-black hover:text-orange-500 transition-colors" onClick={() => setMenuOpen(false)}>
            <IoCloseOutline size={24} />
          </button>
        </div>
        <nav className="flex flex-col gap-6 px-6">
          <Link to="/" onClick={() => setMenuOpen(false)} className={`font-medium transition-colors ${isActive('/') ? 'text-orange-600' : 'text-gray-700 hover:text-orange-500'}`}>Home</Link>
          <Link to="/product" onClick={() => setMenuOpen(false)} className={`font-medium transition-colors ${isActive('/product') ? 'text-orange-600' : 'text-gray-700 hover:text-orange-500'}`}>Product</Link>
          {isAuthenticated ? (
            <Link to="/profile?tab=cart" onClick={() => setMenuOpen(false)} className={`font-medium transition-colors flex items-center gap-2 ${isActive('/cart') ? 'text-orange-600' : 'text-gray-700 hover:text-orange-500'}`}>
              Cart {getCartItemCount() > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">{getCartItemCount()}</span>}
            </Link>
          ) : (
            <button
              onClick={() => {
                setMenuOpen(false);
                setIsOtpModalOpen(true);
              }}
              className="font-medium transition-colors flex items-center gap-2 text-gray-700 hover:text-orange-500 text-left"
            >
              Cart
            </button>
          )}
          <Link to="/contact" onClick={() => setMenuOpen(false)} className={`font-medium transition-colors ${isActive('/contact') ? 'text-orange-600' : 'text-gray-700 hover:text-orange-500'}`}>Contact</Link>
        </nav>
      </div>

      {/* OTP Login Modal */}
      <OTPLoginModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
      />
    </header>
  );
}

export default Header;
