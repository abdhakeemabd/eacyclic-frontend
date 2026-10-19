import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import OTPLoginModal from './OTPLoginModal';
import Logo from '../assets/images/logo/logo.png';

export default function Header() {
  const { user, logout, isAuthenticated, isOfflineMode } = useUser();
  const { getCartItemCount, likes = [] } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuRef = useRef();
  const searchInputRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/product') {
      return location.pathname === '/product' || location.pathname.startsWith('/product-view/');
    }
    return location.pathname === path;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    Swal.fire({
      title: 'Sign out?',
      text: 'Are you sure you want to sign out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#134e35',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Sign Out',
      customClass: {
        popup: 'rounded-2xl shadow-xl font-sans'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/', { replace: true });
      }
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/product?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  const cartCount = getCartItemCount();

  return (
    <>
      {/* 1. Top Announcement Bar (Screenshot 1) */}
      <div className="bg-[#134e35] text-white py-2 px-4 text-center text-xs font-medium tracking-wide flex items-center justify-center gap-1.5 transition-colors">
        <span>Good finds. Closer to home. Free delivery across Kerala & India</span>
        <Link to="/product" className="inline-flex items-center hover:underline opacity-90">
          <span>↗</span>
        </Link>
      </div>

      {/* 2. Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="container mx-auto px-6 sm:px-8 lg:px-16 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Mobile Menu Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-700 hover:text-black rounded-lg transition-colors"
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Brand Logo */}
          <Link to="/" className="shrink-0 flex items-center" aria-label="Eacyclic Home">
            <img src={Logo} alt="Eacyclic" className="h-7 sm:h-9 object-contain max-w-[140px]" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-[#134e35] font-semibold' : 'text-gray-600 hover:text-black'
              }`}
            >
              Home
            </Link>
            <Link
              to="/product"
              className={`text-sm font-medium transition-colors ${
                isActive('/product') ? 'text-[#134e35] font-semibold' : 'text-gray-600 hover:text-black'
              }`}
            >
              Products
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors ${
                isActive('/contact') ? 'text-[#134e35] font-semibold' : 'text-gray-600 hover:text-black'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Icons (Search, Cart, User) */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-700 hover:text-black hover:bg-gray-50 rounded-full transition-colors"
              aria-label="Search items"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Liked Items / Wishlist */}
            <Link
              to={isAuthenticated ? "/profile?tab=wishlist" : "/wishlist"}
              className="p-2 text-gray-700 hover:text-black hover:bg-gray-50 rounded-full transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${likes.length > 0 ? 'text-red-500 fill-red-500' : ''}`} />
              {likes.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#134e35] text-white text-[9px] font-bold flex items-center justify-center">
                  {likes.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag / Cart */}
            <Link
              to="/cart"
              className="p-2 text-gray-700 hover:text-black hover:bg-gray-50 rounded-full transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#134e35] text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-[#f0f4f1] border border-[#134e35]/20 flex items-center justify-center text-xs font-bold text-[#134e35] hover:ring-2 hover:ring-[#134e35]/30 transition-all"
                  aria-label="User account"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'My Account'}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.phone || user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      My Orders & Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsOtpModalOpen(true)}
                className="hidden sm:inline-flex items-center text-xs font-semibold text-[#134e35] border border-[#134e35]/30 hover:bg-[#134e35] hover:text-white px-3.5 py-1.5 rounded-full transition-all"
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Expandable Search Overlay */}
        {searchOpen && (
          <div className="border-t border-gray-100 bg-white py-3 px-6 sm:px-8 lg:px-16 animate-fadeIn">
            <div className="container mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center max-w-xl mx-auto">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for furniture, storage, plants..."
                  className="w-full bg-[#f5f6f5] border border-transparent focus:border-[#134e35] rounded-full pl-10 pr-20 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3.5 py-1.5 bg-[#134e35] text-white rounded-full text-xs font-medium hover:bg-[#0e3a27] transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3 animate-fadeIn">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-gray-800"
            >
              Home
            </Link>
            <Link
              to="/product"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-gray-800"
            >
              Products
            </Link>
            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-gray-800"
            >
              Contact
            </Link>
            {!isAuthenticated && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setIsOtpModalOpen(true);
                }}
                className="w-full mt-2 py-2.5 text-center text-xs font-semibold bg-[#134e35] text-white rounded-xl"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </header>

      {/* Login OTP Modal */}
      <OTPLoginModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
      />
    </>
  );
}
