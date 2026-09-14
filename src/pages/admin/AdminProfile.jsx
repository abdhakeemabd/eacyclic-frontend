import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Shield, Key, Camera, 
  Settings, Bell, LogOut, CheckCircle, Eye, EyeOff, AlertCircle, Loader2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { adminAPI, userAPI } from '../../utils/api';

function AdminProfile() {
  const { adminUser, logout } = useAdmin();
  const [activeTab, setActiveTab] = useState('security'); // default to security/password view

  // Profile info state
  const [username, setUsername] = useState(adminUser?.username || '');
  const [email, setEmail] = useState(adminUser?.email || '');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status feedback
  const [pwStatus, setPwStatus] = useState({ type: '', text: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwStatus({ type: '', text: '' });

    if (!currentPassword) {
      setPwStatus({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (!newPassword) {
      setPwStatus({ type: 'error', text: 'Please enter a new password.' });
      return;
    }
    if (newPassword.length < 6) {
      setPwStatus({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwStatus({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setPwLoading(true);
    try {
      const response = await adminAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
      }

      setPwStatus({ type: 'success', text: response.data.message || 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to change password. Please check your credentials.';
      setPwStatus({ type: 'error', text: errorMsg });
    } finally {
      setPwLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setProfileLoading(true);
    try {
      await userAPI.updateProfile({ username, email });
      setProfileMsg({ type: 'success', text: 'Profile details updated successfully!' });
    } catch (error) {
      setProfileMsg({ type: 'error', text: error.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Admin Profile & Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account security and admin settings</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all font-bold"
        >
          <LogOut size={18} />
          <span>Logout Account</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Navigation Cards */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
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
            <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{adminUser?.username || 'Admin'}</h2>
            <p className="text-indigo-500 font-bold uppercase tracking-widest text-[10px] mt-2">
              {adminUser?.role === 'superadmin' ? 'Super Administrator' : 'Administrator'}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-[2.5rem] p-4 space-y-2"
          >
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all font-bold ${
                activeTab === 'security' 
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Key size={20} />
                <span>Security & Password</span>
              </div>
              {activeTab === 'security' && <CheckCircle size={18} />}
            </button>

            <button 
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all font-bold ${
                activeTab === 'general' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <User size={20} />
                <span>General Info</span>
              </div>
              {activeTab === 'general' && <CheckCircle size={18} />}
            </button>
          </motion.div>
        </div>

        {/* Right Column - Active Tab Form */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'security' && (
              <motion.div 
                key="security-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass-card rounded-[2.5rem] p-8 space-y-8"
              >
                <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-gray-800 pb-6">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600 dark:text-amber-400">
                    <Key size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black dark:text-white">Change Admin Password</h3>
                    <p className="text-xs text-gray-400">Update your account password safely</p>
                  </div>
                </div>

                {pwStatus.text && (
                  <div className={`p-4 rounded-2xl flex items-center space-x-3 text-sm font-medium ${
                    pwStatus.type === 'success' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  }`}>
                    {pwStatus.type === 'success' ? <CheckCircle size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                    <span>{pwStatus.text}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-black text-gray-500 dark:text-gray-400 tracking-wider ml-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full pl-5 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:text-white text-sm font-medium transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password & Confirm Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase font-black text-gray-500 dark:text-gray-400 tracking-wider ml-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input 
                          type={showNew ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full pl-5 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:text-white text-sm font-medium transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                          {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] uppercase font-black text-gray-500 dark:text-gray-400 tracking-wider ml-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input 
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full pl-5 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:text-white text-sm font-medium transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit"
                      disabled={pwLoading}
                      className="flex items-center space-x-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black uppercase tracking-wider text-xs transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      {pwLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <span>Update Password</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'general' && (
              <motion.div 
                key="general-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass-card rounded-[2.5rem] p-8 space-y-8"
              >
                <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-gray-800 pb-6">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black dark:text-white">Account Information</h3>
                    <p className="text-xs text-gray-400">Update your basic profile details here</p>
                  </div>
                </div>

                {profileMsg.text && (
                  <div className={`p-4 rounded-2xl flex items-center space-x-3 text-sm font-medium ${
                    profileMsg.type === 'success' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  }`}>
                    {profileMsg.type === 'success' ? <CheckCircle size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase font-black text-gray-500 dark:text-gray-400 tracking-wider ml-1">Username</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-12 pr-6 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] uppercase font-black text-gray-500 dark:text-gray-400 tracking-wider ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-6 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium text-sm transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit"
                      disabled={profileLoading}
                      className="flex items-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-wider text-xs transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                    >
                      {profileLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
