import React, { useState, useRef, useEffect } from 'react';
import Logo from '../assets/images/logo/logo.png';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, ShoppingCart, Truck, Mail, 
  User, Settings, Bell, Search, X, Menu, LogOut, Sun, Moon,
  ExternalLink, ChevronRight, ChevronLeft, ChevronDown, CheckCircle2, ShieldCheck, Key
} from 'lucide-react';

const NavItem = ({ item, isCollapsed, isActive, navigate, setIsMobileMenuOpen }) => {
  const Icon = item.icon;

  return (
    <button
      onClick={() => {
        navigate(item.path);
        setIsMobileMenuOpen(false);
      }}
      title={isCollapsed ? item.name : undefined}
      className={`w-full flex items-center p-3 mb-1.5 rounded-xl transition-all duration-200 group relative text-left cursor-pointer
        ${isActive 
          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md shadow-orange-500/20' 
          : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
        } ${isCollapsed ? 'justify-center !px-2' : ''}`}
    >
      <div className={`p-2 rounded-xl transition-all shrink-0 ${
        isActive 
          ? 'bg-white/20 text-white shadow-xs backdrop-blur-xs' 
          : 'bg-slate-900/90 text-slate-400 border border-slate-800/80 group-hover:text-white group-hover:bg-slate-800 group-hover:border-slate-700'
      }`}>
        <Icon size={18} />
      </div>
      {!isCollapsed && (
        <span className="ml-3 text-xs font-semibold whitespace-nowrap tracking-wide flex-1 truncate">
          {item.name}
        </span>
      )}
      {item.badge && !isCollapsed && (
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
          isActive 
            ? 'bg-white/25 text-white' 
            : 'bg-slate-800 text-orange-400 border border-orange-500/30'
        }`}>
          {item.badge}
        </span>
      )}
      {isActive && !isCollapsed && (
        <div className="w-1.5 h-5 rounded-full bg-white ml-2 shrink-0 shadow-xs" />
      )}
    </button>
  );
};

const AdminLayout = ({ children }) => {
  const { adminUser, logout, darkMode, toggleDarkMode } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', color: 'text-blue-500' },
    { name: 'Products', icon: Package, path: '/admin/products', color: 'text-indigo-500' },
    { name: 'Orders', icon: ShoppingCart, path: '/admin/orders', color: 'text-emerald-500' },
    { name: 'Shipped', icon: Truck, path: '/admin/shipped', color: 'text-cyan-500' },
    { name: 'Delivered', icon: CheckCircle2, path: '/admin/delivery', color: 'text-amber-500' },
    { name: 'Messages', icon: Mail, path: '/admin/contacts', color: 'text-pink-500' },
  ];

  // Breadcrumbs title helper
  const getBreadcrumbTitle = () => {
    const p = location.pathname;
    if (p.includes('/admin/products/add')) return 'Add New Product';
    if (p.includes('/admin/products/edit')) return 'Edit Product Details';
    if (p === '/admin/products') return 'Products Catalog';
    if (p.includes('/admin/orders/')) return 'Order Details';
    if (p === '/admin/orders') return 'Customer Orders';
    if (p === '/admin/shipped') return 'Shipped Consignments';
    if (p === '/admin/delivery') return 'Delivered Shipments';
    if (p === '/admin/contacts') return 'Customer Inquiries';
    if (p === '/admin/profile') return 'Security & Profile';
    if (p === '/admin/dashboard') return 'Store Overview';
    return 'Admin Central';
  };

  const sidebarVariants = {
    open: { width: '270px', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { width: '80px', transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300 w-full overflow-x-hidden">
      
      {/* ============================================================== */}
      {/* DESKTOP SIDEBAR                                                */}
      {/* ============================================================== */}
      <motion.aside
        initial={false}
        variants={sidebarVariants}
        animate={isSidebarOpen ? 'open' : 'closed'}
        className={`hidden lg:flex flex-col border-r border-slate-800/80 bg-[#0c1322] text-slate-200 sticky top-0 h-screen z-40 overflow-hidden shadow-2xl shrink-0 min-w-0 ${
          isSidebarOpen ? 'w-[270px]' : 'w-[80px]'
        }`}
      >
        {/* Brand Header */}
        <div className="px-4 py-5 flex items-center justify-between border-b border-slate-800/80 shrink-0 overflow-hidden bg-[#0c1322]">
          <AnimatePresence mode="wait" initial={false}>
            {isSidebarOpen ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 cursor-pointer overflow-hidden"
                onClick={() => navigate('/admin/dashboard')}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-700/60 flex items-center justify-center p-1.5 shadow-md shrink-0">
                  <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base tracking-tight text-white truncate">
                      Eacyclic
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase shrink-0">
                      Admin
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" /> Live Store
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="logo-small"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-10 h-10 rounded-xl bg-white border border-slate-700/60 flex items-center justify-center p-1.5 mx-auto cursor-pointer shrink-0 shadow-md"
                onClick={() => navigate('/admin/dashboard')}
                title="Eacyclic Admin"
              >
                <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-6">
          <div>
            {isSidebarOpen && (
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2.5 block truncate">
                Store Apps
              </span>
            )}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isItemActive = location.pathname === item.path || 
                  (item.path === '/admin/products' && location.pathname.startsWith('/admin/products'));
                return (
                  <NavItem 
                    key={item.path} 
                    item={item} 
                    isCollapsed={!isSidebarOpen} 
                    isActive={isItemActive}
                    navigate={navigate}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                  />
                );
              })}
            </nav>
          </div>

          {/* Quick Links Section */}
          <div>
            {isSidebarOpen && (
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2.5 block truncate">
                Quick Actions
              </span>
            )}
            <div className="space-y-1">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className={`w-full flex items-center p-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all group ${
                  !isSidebarOpen ? 'justify-center !px-2' : ''
                }`}
                title="View Online Store"
              >
                <div className="p-2 rounded-xl bg-slate-900/90 text-slate-400 border border-slate-800/80 group-hover:text-orange-400 group-hover:border-slate-700 transition-colors shrink-0">
                  <ExternalLink size={17} />
                </div>
                {isSidebarOpen && (
                  <div className="ml-3 text-left overflow-hidden">
                    <span className="text-xs font-semibold block text-slate-200 group-hover:text-white truncate">View Online Store</span>
                    <span className="text-[10px] text-slate-400 truncate">eacyclic.com</span>
                  </div>
                )}
              </a>

              <button
                onClick={() => navigate('/admin/profile')}
                className={`w-full flex items-center p-3 rounded-xl transition-all cursor-pointer ${
                  location.pathname === '/admin/profile' 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md shadow-orange-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                } ${!isSidebarOpen ? 'justify-center !px-2' : ''}`}
                title="Admin Settings & Profile"
              >
                <div className={`p-2 rounded-xl shrink-0 transition-all ${
                  location.pathname === '/admin/profile' 
                    ? 'bg-white/20 text-white shadow-xs backdrop-blur-xs' 
                    : 'bg-slate-900/90 text-slate-400 border border-slate-800/80'
                }`}>
                  <Settings size={17} />
                </div>
                {isSidebarOpen && (
                  <span className="ml-3 text-xs font-semibold truncate">Settings & Security</span>
                )}
                {location.pathname === '/admin/profile' && isSidebarOpen && (
                  <div className="w-1.5 h-5 rounded-full bg-white ml-auto shrink-0 shadow-xs" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer with Collapse & Sign Out */}
        <div className="p-3 border-t border-slate-850/80 bg-slate-950/60 space-y-1.5 shrink-0 overflow-hidden">
          <button
            id="admin-sidebar-toggle-btn"
            type="button"
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className={`w-full flex items-center p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-xs font-medium ${
              !isSidebarOpen ? 'justify-center !px-2' : ''
            }`}
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? (
              <>
                <ChevronLeft size={18} className="shrink-0" />
                <span className="ml-3 font-semibold whitespace-nowrap overflow-hidden">Collapse Sidebar</span>
              </>
            ) : (
              <ChevronRight size={18} className="shrink-0" />
            )}
          </button>
          
          <button
            onClick={async () => {
              await logout();
              navigate('/admin/login');
            }}
            className={`w-full flex items-center p-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer text-xs font-bold ${
              !isSidebarOpen ? 'justify-center !px-2' : ''
            }`}
            title="Sign Out"
          >
            <LogOut size={18} className="shrink-0" />
            {isSidebarOpen && <span className="ml-3 whitespace-nowrap overflow-hidden">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* ============================================================== */}
      {/* MOBILE DRAWER SIDEBAR                                          */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#0c1322] text-slate-200 border-r border-slate-800 z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-5 flex items-center justify-between border-b border-slate-800 bg-[#0c1322]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-700/60 flex items-center justify-center p-1 shadow-sm">
                    <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="font-black text-base text-white block leading-tight">Eacyclic</span>
                    <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Admin Panel</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-2">
                {menuItems.map((item) => {
                  const isItemActive = location.pathname === item.path || 
                    (item.path === '/admin/products' && location.pathname.startsWith('/admin/products'));
                  return (
                    <NavItem 
                      key={item.path} 
                      item={item} 
                      isCollapsed={false} 
                      isActive={isItemActive}
                      navigate={navigate}
                      setIsMobileMenuOpen={setIsMobileMenuOpen}
                    />
                  );
                })}

                <div className="pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/admin/profile');
                    }}
                    className={`w-full flex items-center p-3 rounded-xl transition-all ${
                      location.pathname === '/admin/profile'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-900/90 text-slate-400 border border-slate-800/80">
                      <Settings size={18} />
                    </div>
                    <span className="ml-3 text-xs font-semibold">Settings & Security</span>
                  </button>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/60">
                <button
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await logout();
                    navigate('/admin/login');
                  }}
                  className="w-full flex items-center p-3 rounded-xl text-rose-400 hover:bg-rose-500/15 font-bold text-xs cursor-pointer transition-colors"
                >
                  <LogOut size={18} />
                  <span className="ml-3">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MAIN VIEWPORT & TOPBAR                                         */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Header */}
        <header 
          style={{ backgroundColor: '#0c1322', borderColor: 'rgba(30, 41, 59, 0.8)' }}
          className="h-16 bg-[#0c1322] border-b border-slate-800/80 text-white flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-md backdrop-blur-md"
        >
          
          {/* Mobile Hamburger & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] border border-slate-800 transition-colors"
            >
              <Menu size={18} />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Admin Portal</span>
              <ChevronRight size={13} className="text-slate-600" />
              <span className="font-bold text-white bg-slate-900 border border-slate-800/80 px-2.5 py-1 rounded-lg shadow-xs">
                {getBreadcrumbTitle()}
              </span>
            </div>
          </div>

          {/* Right Header Tools */}
          <div className="flex items-center space-x-3">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 transition-all cursor-pointer shadow-xs"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-300" />}
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

            {/* Admin Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button 
                id="admin-profile-dropdown-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileDropdownOpen(prev => !prev);
                }}
                className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer border border-transparent hover:border-slate-800/80 group"
              >
                <div className="hidden md:block text-right">
                  <p className="text-xs font-bold text-white leading-tight group-hover:text-orange-400 transition-colors">
                    {adminUser?.username || 'Admin'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">Store Manager</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-md ring-2 ring-orange-500/20 shrink-0">
                  {(adminUser?.username || 'A').substring(0, 1).toUpperCase()}
                </div>
                <ChevronDown 
                  size={14} 
                  className={`text-slate-400 transition-transform duration-200 hidden sm:block group-hover:text-white ${
                    isProfileDropdownOpen ? 'rotate-180 text-orange-400' : ''
                  }`} 
                />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    style={{ backgroundColor: '#0c1322' }}
                    className="absolute right-0 mt-2 w-64 bg-[#0c1322] text-slate-200 rounded-2xl shadow-2xl border border-slate-800 py-1.5 z-50 overflow-hidden"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/80">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          {(adminUser?.username || 'A').substring(0, 1).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white truncate">
                            {adminUser?.username || 'Administrator'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {adminUser?.email || 'admin@eacyclic.com'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 rounded-md">
                          {adminUser?.role === 'superadmin' ? 'Super Administrator' : 'Admin'}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          navigate('/admin/profile?tab=general');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
                      >
                        <User size={15} className="text-slate-400 shrink-0" />
                        <span>Profile & Account</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          navigate('/admin/profile?tab=security');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
                      >
                        <Key size={15} className="text-slate-400 shrink-0" />
                        <span>Change Password</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          navigate('/admin/profile?tab=security');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
                      >
                        <ShieldCheck size={15} className="text-slate-400 shrink-0" />
                        <span>Security & Sessions</span>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-800 my-1" />

                    {/* Sign Out Action */}
                    <div className="p-1.5">
                      <button
                        onClick={async () => {
                          setIsProfileDropdownOpen(false);
                          await logout();
                          navigate('/admin/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer text-left"
                      >
                        <LogOut size={15} className="shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
