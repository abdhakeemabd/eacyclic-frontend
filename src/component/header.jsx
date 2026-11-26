import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useProducts } from '../context/ProductContext';
import OTPLoginModal from './OTPLoginModal';
import Logo from '../assets/images/logo/logo.png';

export default function Header() {
  const { user, logout, isAuthenticated } = useUser();
  const { getCartItemCount, likes = [], openCartDrawer } = useCart();
  const { products = [] } = useProducts();
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

  // Live instant search suggestions
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return products
      .filter((p) => {
        const name = (p.name || p.title || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        return name.includes(q) || cat.includes(q);
      })
      .slice(0, 5);
  }, [searchQuery, products]);

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
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#134e35] text-white py-2 px-4 text-center text-[11px] sm:text-xs font-medium tracking-wide flex items-center justify-center gap-1.5">
        <span>Cash on Delivery & Free Doorstep Shipping across Kerala & India</span>
        <Link to="/product" className="inline-flex items-center hover:underline font-bold ml-1">
          <span>Shop now ↗</span>
        </Link>
      </div>

      {/* 2. Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="container mx-auto px-5 sm:px-8 lg:px-16 h-16 sm:h-20 flex items-center justify-between">
          {/* Mobile Menu Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-700 hover:text-black rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Brand Logo */}
          <Link to="/" className="shrink-0 flex items-center" aria-label="Eacyclic Home">
            <img src={Logo} alt="Eacyclic" className="h-11 sm:h-12 object-contain max-w-[140px]" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9">
            {[
              { label: 'Home', to: '/' },
              { label: 'Products', to: '/product' },
              { label: 'About', to: '/about' },
              { label: 'FAQ', to: '/faq' },
              { label: 'Contact', to: '/contact' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  isActive(item.to)
                    ? 'text-[#134e35] font-semibold'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {item.label}
                {isActive(item.to) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#134e35] rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons (Search, Wishlist, Bag, User) */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-700 hover:text-[#134e35] hover:bg-[#f0f4f1] rounded-full transition-colors cursor-pointer"
              aria-label="Search items"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <Link
              to={isAuthenticated ? "/profile?tab=wishlist" : "/wishlist"}
              className="p-2 text-gray-700 hover:text-[#134e35] hover:bg-[#f0f4f1] rounded-full transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${likes.length > 0 ? 'text-red-500 fill-red-500' : ''}`} />
              {likes.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#134e35] text-white text-[9px] font-bold flex items-center justify-center">
                  {likes.length}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={openCartDrawer}
              className="p-2 text-gray-700 hover:text-[#134e35] hover:bg-[#f0f4f1] rounded-full transition-colors relative cursor-pointer"
              aria-label="Open Bag"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#134e35] text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-[#f0f4f1] border border-[#134e35]/20 flex items-center justify-center text-xs font-bold text-[#134e35] hover:ring-2 hover:ring-[#134e35]/30 transition-all cursor-pointer"
                  aria-label="User account"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'My Account'}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.phone || user?.email}</p>
                    </div>
                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Your Orders (Buy Again)
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsOtpModalOpen(true)}
                className="hidden sm:inline-flex items-center text-xs font-semibold text-[#134e35] border border-[#134e35]/30 hover:bg-[#134e35] hover:text-white px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Expandable Search Overlay with Instant Live Results */}
        {searchOpen && (
          <div className="border-t border-gray-100 bg-white py-3.5 px-6 sm:px-8 lg:px-16 animate-fadeIn">
            <div className="container mx-auto max-w-xl relative">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search furniture, kitchen organizers, gifts..."
                  className="w-full bg-[#f5f6f5] border border-transparent focus:border-[#134e35] rounded-full pl-10 pr-24 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-4 py-1.5 bg-[#134e35] text-white rounded-full text-xs font-semibold hover:bg-[#0e3a27] transition-colors cursor-pointer"
                >
                  Search
                </button>
              </form>

              {searchSuggestions.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg divide-y divide-gray-100 overflow-hidden">
                  {searchSuggestions.map((item) => {
                    const img = item.image_url || item.image || item.gallery?.[0];
                    const price = item.offerPrice || item.price || 0;
                    return (
                      <Link
                        key={item.id}
                        to={`/product-view/${item.id}`}
                        state={{ product: item }}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f6f9f7] transition-colors"
                      >
                        <img
                          src={img}
                          alt={item.name || item.title}
                          className="w-10 h-10 rounded-lg object-contain bg-gray-50 p-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{item.name || item.title}</p>
                          <p className="text-[11px] text-gray-500 truncate">{item.category}</p>
                        </div>
                        <span className="text-xs font-extrabold text-[#134e35] shrink-0">
                          ₹{Math.round(Number(price)).toLocaleString('en-IN')}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-2 animate-fadeIn">
            {[
              { label: 'Home', to: '/' },
              { label: 'Products', to: '/product' },
              { label: 'About Us', to: '/about' },
              { label: 'FAQ', to: '/faq' },
              { label: 'Contact', to: '/contact' },
              { label: 'Shopping Bag', to: '/cart' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-gray-800 hover:text-[#134e35]"
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setIsOtpModalOpen(true);
                }}
                className="w-full mt-2 py-2.5 text-center text-xs font-semibold bg-[#134e35] text-white rounded-full cursor-pointer"
              >
                Sign In with OTP
              </button>
            )}
          </div>
        )}
      </header>

      <OTPLoginModal isOpen={isOtpModalOpen} onClose={() => setIsOtpModalOpen(false)} />
    </>
  );
}
