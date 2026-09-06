import React from 'react';
import AdminLayout from '../../component/AdminLayout';
import { motion } from 'framer-motion';
import { 
  User, Mail, Shield, Key, Camera, 
  Settings, Bell, LogOut, CheckCircle
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

function AdminProfile() {
  const { adminUser, logout } = useAdmin();

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Admin Profile</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-6 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl hover:bg-rose-100 transition-all font-bold"
          >
            <LogOut size={18} />
            <span>Logout Account</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-[2.5rem] p-8 text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-500 p-1 shadow-2xl shadow-indigo-500/20">
                  <div className="w-full h-full rounded-[2.2rem] bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                    <User size={64} className="text-indigo-500" />
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 p-2.5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-indigo-600 border border-gray-100 dark:border-gray-700 hover:scale-110 transition-transform">
                  <Camera size={18} />
                </button>
              </div>
              <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{adminUser?.username}</h2>
              <p className="text-indigo-500 font-bold uppercase tracking-widest text-[10px] mt-2">Super Administrator</p>
              
              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xl font-black dark:text-white">124</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black dark:text-white">12</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Products</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-[2.5rem] p-6 space-y-2"
            >
              <button className="w-full flex items-center justify-between p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20 transition-all font-bold">
                <div className="flex items-center space-x-3">
                  <User size={20} />
                  <span>General Info</span>
                </div>
                <CheckCircle size={18} />
              </button>
              <button className="w-full flex items-center space-x-3 p-4 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all font-bold">
                <Shield size={20} />
                <span>Security</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all font-bold">
                <Bell size={20} />
                <span>Notifications</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all font-bold">
                <Settings size={20} />
                <span>Preferences</span>
              </button>
            </motion.div>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-[2.5rem] p-8 space-y-8"
            >
              <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600">
                  <Settings size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black dark:text-white">Account Information</h3>
                  <p className="text-xs text-gray-400">Update your basic profile details here</p>
                </div>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Username</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        defaultValue={adminUser?.username}
                        className="w-full pl-12 pr-6 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="email" 
                        defaultValue="admin@kp-ecommerce.com"
                        className="w-full pl-12 pr-6 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Bio</label>
                  <textarea 
                    rows="4"
                    placeholder="Tell us about yourself..."
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white min-h-[120px]"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-[2.5rem] p-8 space-y-8"
            >
              <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600">
                  <Key size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black dark:text-white">Security & Password</h3>
                  <p className="text-xs text-gray-400">Manage your password and authentication methods</p>
                </div>
              </div>

              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Current Password</label>
                  <input 
                    type="password" 
                    className="w-full px-6 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">New Password</label>
                    <input 
                      type="password" 
                      className="w-full px-6 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="w-full px-6 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button className="px-10 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20">
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminProfile;
