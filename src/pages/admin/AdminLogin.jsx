import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAdmin();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const result = login(username, password);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white color-black backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div>
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <FaUser className="text-black text-3xl" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
              Admin Panel
            </h2>
            <p className="mt-2 text-center text-sm text-black/80">
              Sign in to access the dashboard
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-black px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-black" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-black/30 placeholder-black/60 text-black bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm backdrop-blur-sm"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-black/60" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-black/30 placeholder-black/60 text-black bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm backdrop-blur-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-black/60 hover:text-black" />
                    ) : (
                      <FaEye className="h-5 w-5 text-black/60 hover:text-black" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 shadow-lg transform transition hover:scale-105"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
