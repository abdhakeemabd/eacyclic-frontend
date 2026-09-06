import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, ShoppingCart, Truck, Mail, 
  User, Settings, Bell, Search, X, Menu, LogOut, Palette, Sun, Moon
} from 'lucide-react';

const NavItem = ({ item, isCollapsed, isActive, navigate, setIsMobileMenuOpen }) => {
  const Icon = item.icon;

  return (
    <button
      onClick={() => {
        navigate(item.path);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center p-3 mb-2 rounded-xl transition-all duration-200 group relative
        ${isActive 
          ? 'bg-gradient-to-r from-indigo-600/10 to-purple-600/10 text-indigo-600 dark:text-indigo-400 font-semibold' 
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
    >
      <div className={`p-2 rounded-lg ${isActive ? 'bg-white dark:bg-gray-900 shadow-sm' : ''}`}>
        <Icon size={20} className={isActive ? item.color : ''} />
      </div>
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-3 whitespace-nowrap"
        >
          {item.name}
        </motion.span>
      )}
      {isActive && !isCollapsed && (
        <motion.div
          layoutId="activeNav"
          className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-600"
        />
      )}
      {isCollapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
          {item.name}
        </div>
      )}
    </button>
  );
};

const AdminLayout = ({ children }) => {
  const { adminUser, logout, darkMode, toggleDarkMode, themeColor, changeTheme } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', color: 'text-blue-500' },
    { name: 'Products', icon: Package, path: '/admin/products', color: 'text-indigo-500' },
    { name: 'Orders', icon: ShoppingCart, path: '/admin/orders', color: 'text-emerald-500' },
    { name: 'Shipped', icon: Truck, path: '/admin/shipped', color: 'text-cyan-500' },
    { name: 'Delivered', icon: Package, path: '/admin/delivery', color: 'text-amber-500' },
    { name: 'Messages', icon: Mail, path: '/admin/contacts', color: 'text-pink-500' },
  ];

  const themes = [
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
    { name: 'Rose', value: 'rose', class: 'bg-rose-500' },
    { name: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
    { name: 'Amber', value: 'amber', class: 'bg-amber-500' },
    { name: 'Violet', value: 'violet', class: 'bg-violet-500' },
  ];

  const sidebarVariants = {
    open: { width: '280px', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { width: '80px', transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <div className={`min-h-screen flex bg-gray-50 dark:bg-[#0f111a] transition-colors duration-300`}>
      {/* Sidebar for Desktop */}
      <motion.aside
        variants={sidebarVariants}
        animate={isSidebarOpen ? 'open' : 'closed'}
        className="hidden lg:flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151823] sticky top-0 h-screen z-40 overflow-hidden"
      >
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <span className="text-white font-bold text-xl">KP</span>
                </div>
                <span className="ml-3 font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="logo-small"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30"
              >
                <span className="text-white font-bold text-lg">KP</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 mt-4">
          {menuItems.map((item) => (
            <NavItem 
              key={item.path} 
              item={item} 
              isCollapsed={!isSidebarOpen} 
              isActive={location.pathname === item.path}
              navigate={navigate}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center p-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} className="mx-auto" />}
            {isSidebarOpen && <span className="ml-3">Collapse</span>}
          </button>
          
          <button
            onClick={logout}
            className="w-full flex items-center p-3 mt-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut size={20} className={!isSidebarOpen ? 'mx-auto' : ''} />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#151823] z-50 lg:hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center mb-10">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">KP</span>
                  </div>
                  <span className="ml-3 font-bold text-xl dark:text-white">Admin Panel</span>
                </div>
                <nav>
                  {menuItems.map((item) => (
                    <NavItem 
                      key={item.path} 
                      item={item} 
                      isCollapsed={false} 
                      isActive={location.pathname === item.path}
                      navigate={navigate}
                      setIsMobileMenuOpen={setIsMobileMenuOpen}
                    />
                  ))}
                </nav>
                <div className="mt-auto pt-10 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={logout}
                    className="w-full flex items-center p-4 rounded-xl text-red-500 hover:bg-red-50"
                  >
                    <LogOut size={20} />
                    <span className="ml-3">Logout</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-[#151823]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center flex-1">
            <div className="relative w-full max-w-md group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-indigo-500 transition-all text-sm dark:text-gray-200"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Color Picker */}
            <div className="relative">
              <button
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-all"
              >
                <Palette size={20} />
              </button>
              <AnimatePresence>
                {showThemePicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-48 z-50"
                  >
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1 uppercase tracking-wider">Select Theme</p>
                    <div className="grid grid-cols-5 gap-2">
                      {themes.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => {
                            changeTheme(t.value);
                            setShowThemePicker(false);
                          }}
                          className={`w-7 h-7 rounded-full ${t.class} ring-offset-2 transition-all ${themeColor === t.value ? 'ring-2 ring-indigo-500 scale-110' : 'hover:scale-110'}`}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-all"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />

            {/* Profile */}
            <div 
              onClick={() => navigate('/admin/profile')}
              className="flex items-center space-x-3 pl-2 group cursor-pointer"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold dark:text-white group-hover:text-indigo-500 transition-colors">{adminUser?.username}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-0.5 shadow-lg group-hover:shadow-indigo-500/20 transition-all">
                <div className="w-full h-full rounded-[10px] bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                  <User size={20} className="text-indigo-500" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-2 md:p-3 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
