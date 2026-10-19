import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Shield, Key, Camera, 
  Settings, Bell, LogOut, CheckCircle, Eye, EyeOff, AlertCircle, Loader2, Sparkles, Check
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { adminAPI, userAPI } from '../../utils/api';

function AdminProfile() {
  const { adminUser, logout, logoutAll } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'general' ? 'general' : 'security');

  useEffect(() => {
    if (tabParam === 'general' || tabParam === 'security') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

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

  // Logout All state
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [logoutAllMsg, setLogoutAllMsg] = useState({ type: '', text: '' });

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
    if (newPassword.length < 8) {
      setPwStatus({ type: 'error', text: 'New password must be at least 8 characters long.' });
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

      setPwStatus({ 
        type: 'success', 
        text: response.data.message || 'Password changed successfully! All other sessions logged out.' 
      });
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

  const handleLogoutAll = async () => {
    if (!window.confirm("Are you sure you want to log out from all devices? All other sessions will be terminated and you will need to log back in.")) {
      return;
    }
    setLogoutAllLoading(true);
    setLogoutAllMsg({ type: '', text: '' });
    try {
      await logoutAll();
      window.location.href = '/admin/login';
    } catch (error) {
      setLogoutAllMsg({ type: 'error', text: error.response?.data?.error || 'Failed to terminate all sessions.' });
      setLogoutAllLoading(false);
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
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-xs border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Admin Center</span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-bold text-primary">Account & Security</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1 flex items-center">
            <Shield className="mr-2 text-primary" size={24} />
            Admin Security & Profile
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Manage your credentials, password updates, and global administrative sessions.
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-all font-bold text-xs cursor-pointer self-start sm:self-auto"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Navigation Cards */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card text-card-foreground border border-border rounded-2xl p-6 text-center shadow-xs"
          >
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 p-1 border border-primary/20 shadow-sm mx-auto">
                <div className="w-full h-full rounded-xl bg-background flex items-center justify-center overflow-hidden">
                  <User size={44} className="text-primary" />
                </div>
              </div>
            </div>
            
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              {adminUser?.username || 'Administrator'}
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                {adminUser?.role === 'superadmin' ? 'Super Administrator' : 'Admin'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-mono bg-muted/40 py-1 px-3 rounded-lg border border-border/50 inline-block">
              {adminUser?.email || 'admin@eacyclic.com'}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card text-card-foreground border border-border rounded-2xl p-3 space-y-1.5 shadow-xs"
          >
            <button 
              onClick={() => handleSelectTab('security')}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-xs font-bold cursor-pointer ${
                activeTab === 'security' 
                  ? 'bg-primary text-primary-foreground shadow-xs' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Key size={17} />
                <span>Security & Password</span>
              </div>
              {activeTab === 'security' && <Check size={16} />}
            </button>

            <button 
              onClick={() => handleSelectTab('general')}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-xs font-bold cursor-pointer ${
                activeTab === 'general' 
                  ? 'bg-primary text-primary-foreground shadow-xs' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center space-x-3">
                <User size={17} />
                <span>Account Information</span>
              </div>
              {activeTab === 'general' && <Check size={16} />}
            </button>
          </motion.div>
        </div>

        {/* Right Column - Active Tab Form */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'security' && (
              <motion.div 
                key="security-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-card text-card-foreground border border-border rounded-2xl p-6 space-y-6 shadow-xs"
              >
                <div className="flex items-center space-x-3 border-b border-border pb-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <Key size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Change Password</h3>
                    <p className="text-xs text-muted-foreground">Keep your administrative credentials safe and updated</p>
                  </div>
                </div>

                {pwStatus.text && (
                  <div className={`p-4 rounded-xl flex items-center space-x-3 text-xs font-medium ${
                    pwStatus.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}>
                    {pwStatus.type === 'success' ? <CheckCircle size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
                    <span>{pwStatus.text}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-muted-foreground block">
                      Current Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full pl-4 pr-11 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground text-sm font-medium transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password & Confirm Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-bold text-muted-foreground block">
                        New Password
                      </label>
                      <div className="relative">
                        <input 
                          type={showNew ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 8 characters"
                          className="w-full pl-4 pr-11 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground text-sm font-medium transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-bold text-muted-foreground block">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input 
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full pl-4 pr-11 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground text-sm font-medium transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit"
                      disabled={pwLoading}
                      className="flex items-center space-x-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {pwLoading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <span>Update Password</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Session & Device Management */}
                <div className="mt-8 pt-6 border-t border-border space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                        <Shield size={16} />
                        <span>Global Session Invalidation</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground max-w-md">
                        Terminate all active administrative sessions and revoke access tokens across every device where you are currently signed in.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogoutAll}
                      disabled={logoutAllLoading}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {logoutAllLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Revoking...</span>
                        </>
                      ) : (
                        <>
                          <LogOut size={14} />
                          <span>Log Out Everywhere</span>
                        </>
                      )}
                    </button>
                  </div>
                  {logoutAllMsg.text && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pl-1">{logoutAllMsg.text}</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'general' && (
              <motion.div 
                key="general-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-card text-card-foreground border border-border rounded-2xl p-6 space-y-6 shadow-xs"
              >
                <div className="flex items-center space-x-3 border-b border-border pb-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Account Information</h3>
                    <p className="text-xs text-muted-foreground">Update your administrative profile details</p>
                  </div>
                </div>

                {profileMsg.text && (
                  <div className={`p-4 rounded-xl flex items-center space-x-3 text-xs font-medium ${
                    profileMsg.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}>
                    {profileMsg.type === 'success' ? <CheckCircle size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-bold text-muted-foreground block">Username</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground font-medium text-sm transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-bold text-muted-foreground block">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground font-medium text-sm transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit"
                      disabled={profileLoading}
                      className="flex items-center space-x-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {profileLoading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
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
