import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/images/logo/logo.png';
import { FaRegUser, FaShoppingCart, FaUserCircle, FaWifi, FaLock, FaEnvelope, FaPhone, FaUser } from "react-icons/fa";
import { IoCloseOutline, IoMenuOutline } from "react-icons/io5";
import Modal from 'react-modal';
import Product1 from '../assets/images/img/1.webp';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

Modal.setAppElement('#root');

function Header() {
  const { user, login, register, logout, isAuthenticated, isOfflineMode, loading: authLoading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalOpenAnimation, setModalOpenAnimation] = useState(false);
  
  // Modal state ('login' | 'register')
  const [activeTab, setActiveTab] = useState('login');
  
  // Credentials
  const [loginIdentifier, setLoginIdentifier] = useState(''); // email or phone
  const [loginPassword, setLoginPassword] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  const userMenuRef = useRef();
  const { getCartItemCount } = useCart();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/product') {
      return location.pathname === '/product' || location.pathname.startsWith('/product-view/');
    }
    return location.pathname === path;
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal controls
  const openModal = () => {
    setAuthError('');
    setAuthSuccessMsg('');
    setIsOpen(true);
  };
  const afterOpenModal = () => setTimeout(() => setModalOpenAnimation(true), 10);
  const closeModal = () => {
    setIsOpen(false);
    setModalOpenAnimation(false);
    setLoginIdentifier('');
    setLoginPassword('');
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
    setAuthError('');
    setAuthSuccessMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (!loginIdentifier || !loginPassword) {
      setAuthError('Please enter both username/phone/email and password.');
      return;
    }

    const credentials = {
      phone: !loginIdentifier.includes('@') ? loginIdentifier : undefined,
      email: loginIdentifier.includes('@') ? loginIdentifier : undefined,
      password: loginPassword
    };

    const result = await login(credentials);
    if (result.success) {
      setAuthSuccessMsg(result.isOffline ? 'Logged in offline successfully!' : 'Logged in successfully!');
      setTimeout(() => {
        closeModal();
      }, 1000);
    } else {
      setAuthError(result.error || 'Login failed. Please check credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (!regName || !regEmail || !regPhone || !regPassword) {
      setAuthError('All registration fields are required.');
      return;
    }

    const userData = {
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword
    };

    const result = await register(userData);
    if (result.success) {
      setAuthSuccessMsg(result.isOffline ? 'Registered locally (Offline mode active)!' : 'Registered successfully!');
      setTimeout(() => {
        closeModal();
      }, 1000);
    } else {
      setAuthError(result.error || 'Registration failed.');
    }
  };

  return (
    <header className="bg-white py-4 relative z-50 shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button aria-label="Open Menu" className="border p-2 rounded-full" onClick={() => setMenuOpen(true)}>
            <IoMenuOutline size={24} />
          </button>
        </div>

        {/* Logo */}
        <Link to="/" className="shrink-0" aria-label="Homepage">
          <img className="h-10" src={Logo} alt="Logo" />
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
        <div className="flex items-center gap-3">
          {/* Offline Mode General indicator */}
          {isOfflineMode && isAuthenticated && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Offline Mode
            </div>
          )}

          {/* Cart Icon */}
          <Link to="/cart" aria-label="Shopping Cart" className="relative border p-2 md:p-3 rounded-full hover:bg-gray-50 transition-colors duration-200">
            <FaShoppingCart size={22} className="text-gray-700" />
            {getCartItemCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {getCartItemCount()}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button aria-label="User Menu" className={`border p-2 md:p-3 rounded-full flex items-center justify-center ${isAuthenticated ? 'border-orange-500 text-orange-600' : 'border-gray-200 text-gray-700'}`} onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <FaRegUser size={22} />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {isAuthenticated ? (
                  <div className="flex flex-col">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <div className="font-semibold text-gray-900 truncate">{user?.name}</div>
                      <div className="text-xs text-gray-500 truncate">{user?.email || user?.phone}</div>
                      {isOfflineMode && (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Offline Session
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col p-2 gap-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        My Account
                      </Link>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col p-2 gap-1">
                    <button 
                      onClick={() => { setActiveTab('login'); openModal(); setUserMenuOpen(false); }} 
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => { setActiveTab('register'); openModal(); setUserMenuOpen(false); }} 
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
          <Link to="/cart" onClick={() => setMenuOpen(false)} className={`font-medium transition-colors flex items-center gap-2 ${isActive('/cart') ? 'text-orange-600' : 'text-gray-700 hover:text-orange-500'}`}>
            Cart {getCartItemCount() > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">{getCartItemCount()}</span>}
          </Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)} className={`font-medium transition-colors ${isActive('/contact') ? 'text-orange-600' : 'text-gray-700 hover:text-orange-500'}`}>Contact</Link>
        </nav>
      </div>

      {/* Modal for Login / Register */}
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={() => {
          setModalOpenAnimation(false);
          setTimeout(closeModal, 300);
        }}
        className={`relative w-full max-w-4xl mx-auto p-0 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-out overflow-hidden ${modalOpenAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} m-4`}
        overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
        contentLabel="Account Modal"
      >
        <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto md:overflow-visible">
          {/* Visual left panel */}
          <div className="hidden md:block md:w-1/2 bg-gray-900 relative min-h-[500px]">
            <img src={Product1} alt="Modal Visual" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-10 flex flex-col justify-end">
              <h2 className="text-white text-3xl font-bold mb-2">Eacyclic Marketplace</h2>
              <p className="text-gray-200 text-sm">Discover and purchase curated premium goods directly with seamless WhatsApp checkout fallbacks.</p>
            </div>
          </div>

          {/* Form right panel */}
          <div className="w-full md:w-1/2 p-8 relative flex flex-col justify-center bg-white">
            <button
              aria-label="Close modal"
              className="absolute right-4 top-4 text-gray-400 hover:text-black transition-all hover:rotate-90 duration-200"
              onClick={() => {
                setModalOpenAnimation(false);
                setTimeout(closeModal, 300);
              }}
            >
              <IoCloseOutline className="text-3xl" />
            </button>

            {/* Switcher Tab header */}
            <div className="flex gap-4 border-b border-gray-100 pb-4 mb-6">
              <button 
                onClick={() => { setActiveTab('login'); setAuthError(''); }}
                className={`text-lg font-bold pb-2 transition-all border-b-2 ${activeTab === 'login' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setActiveTab('register'); setAuthError(''); }}
                className={`text-lg font-bold pb-2 transition-all border-b-2 ${activeTab === 'register' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}
              >
                Create Account
              </button>
            </div>

            {/* Error / Success Feedback */}
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-semibold rounded">
                {authError}
              </div>
            )}
            {authSuccessMsg && (
              <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs font-semibold rounded">
                {authSuccessMsg}
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email or Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><FaEnvelope size={14} /></span>
                    <input
                      type="text"
                      className="border border-gray-200 pl-10 pr-4 py-3 w-full rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all placeholder-gray-400"
                      placeholder="name@email.com or phone"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><FaLock size={14} /></span>
                    <input
                      type="password"
                      className="border border-gray-200 pl-10 pr-4 py-3 w-full rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all placeholder-gray-400"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-6 rounded-xl w-full transition-all duration-300 transform active:scale-[0.98] hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center shadow-lg cursor-pointer"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Log In'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><FaUser size={14} /></span>
                    <input
                      type="text"
                      className="border border-gray-200 pl-10 pr-4 py-3 w-full rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all placeholder-gray-400"
                      placeholder="John Doe"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><FaEnvelope size={14} /></span>
                      <input
                        type="email"
                        className="border border-gray-200 pl-10 pr-4 py-3 w-full rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all placeholder-gray-400 text-sm"
                        placeholder="john@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Phone Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><FaPhone size={14} /></span>
                      <input
                        type="text"
                        className="border border-gray-200 pl-10 pr-4 py-3 w-full rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all placeholder-gray-400 text-sm"
                        placeholder="10-digit number"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><FaLock size={14} /></span>
                    <input
                      type="password"
                      className="border border-gray-200 pl-10 pr-4 py-3 w-full rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all placeholder-gray-400"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-6 rounded-xl w-full transition-all duration-300 transform active:scale-[0.98] hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center shadow-lg cursor-pointer"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Register Account'
                  )}
                </button>
              </form>
            )}

            {/* Offline Helper Warning */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400 font-medium">
              <FaWifi className="shrink-0 animate-pulse text-amber-500" />
              <span>Offline-ready protection: data saves locally if servers are offline.</span>
            </div>
          </div>
        </div>
      </Modal>
    </header>
  );
}

export default Header;
