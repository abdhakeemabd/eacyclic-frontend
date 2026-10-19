import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../../assets/images/logo/logo.png';
import { 
  User, Lock, Eye, EyeOff, ShieldCheck, 
  ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { motion } from 'framer-motion';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAdmin();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Check if redirected due to token expiry (24h)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired') === '1') {
      setError('Your administrative session has expired (24-hour limit). Please sign in again.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError(result.message || 'Invalid administrative credentials');
      }
    } catch (err) {
      setError('An error occurred during authentication. Please verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-radial from-background via-muted/30 to-background">
      <div className="w-full max-w-md">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={14} className="mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Customer Store
          </Link>
        </div>

        {/* Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card text-card-foreground rounded-3xl border border-border/80 shadow-2xl p-8 sm:p-10 backdrop-blur-md relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="text-center relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white border border-border shadow-md mx-auto flex items-center justify-center p-2 mb-4">
              <img src={Logo} alt="Eacyclic" className="w-full h-full object-contain" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={13} />
              <span>Admin Portal Access</span>
            </div>

            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Sign In to Eacyclic
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your authorized staff or administrator credentials
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium flex items-start gap-2.5"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form className="mt-6 space-y-4 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-muted-foreground block">
                Username or Staff ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <User size={16} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoFocus
                  className="block w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm font-medium text-foreground bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/60"
                  placeholder="e.g. superadmin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase font-bold text-muted-foreground block">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-10 pr-11 py-3 border border-border rounded-xl text-sm font-medium text-foreground bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/60"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Admin Center</span>
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Footer Note */}
          <div className="mt-8 pt-6 border-t border-border/60 text-center">
            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>256-Bit Encrypted Session • 24-Hour Expiry</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminLogin;
