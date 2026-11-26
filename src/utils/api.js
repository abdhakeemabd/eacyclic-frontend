import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_BASE_URL = rawBaseUrl.split(',')[0].trim();

// Create axios instance with sensible timeout so cold starts don't hang silently forever
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let warmupPromise = null;

/**
 * Quietly wakes up the backend server when a visitor lands on the storefront
 * so OTP login and order placement respond rapidly when needed.
 */
export const warmupBackend = () => {
  if (!warmupPromise) {
    warmupPromise = api.get('/health', { timeout: 45000 }).catch(() => null);
  }
  return warmupPromise;
};

// Add a request interceptor to attach the auth token
api.interceptors.request.use((config) => {
  const isAuthEndpoint =
    config.url.includes('/login') ||
    config.url.includes('/register') ||
    config.url.includes('/send-otp') ||
    config.url.includes('/verify-otp') ||
    config.url.includes('/health');
  if (!isAuthEndpoint) {
    // Prioritize adminToken when accessing admin routes or endpoints to prevent customer token collision
    const isAdminRoute = (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) || config.url.includes('/admin/');
    const token = isAdminRoute
      ? (localStorage.getItem('adminToken') || localStorage.getItem('authToken'))
      : (localStorage.getItem('authToken') || localStorage.getItem('userToken') || localStorage.getItem('adminToken'));
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to automatically handle 24-hour token expiration and revoked sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      const isLoginOrAuth = url.includes('/login') || url.includes('/verify-otp');
      if (!isLoginOrAuth) {
        // Clear expired or revoked session tokens
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userToken');

        // Redirect admin users to login page if currently on admin portal
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login?expired=1';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Products API
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getMyOrders: () => api.get('/orders/my_orders'),
  trackOrder: (id) => api.get(`/orders/${id}/track`),
  cancelOrder: (id, reason = '') => api.post(`/orders/${id}/cancel`, { reason }),
  reorder: (id) => api.post(`/orders/${id}/reorder`, {}),
  create: (data) => api.post('/orders', data, { timeout: 45000 }),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Contact/Get in Touch API
export const contactAPI = {
  create: (data) => api.post('/contacts', data),
  getAll: () => api.get('/contacts'),
  getById: (id) => api.get(`/contacts/${id}`),
  delete: (id) => api.delete(`/contacts/${id}`),
  markAsRead: (id) => api.patch(`/contacts/${id}/read`),
};

// Delivery API
export const deliveryAPI = {
  getAll: () => api.get('/deliveries'),
  getById: (id) => api.get(`/deliveries/${id}`),
  update: (id, data) => api.put(`/deliveries/${id}`, data),
  updateStatus: (id, status) => api.patch(`/deliveries/${id}/status`, { status }),
};

// Analytics/Reports API
export const analyticsAPI = {
  getDailyStats: () => api.get('/analytics/daily'),
  getMonthlyStats: () => api.get('/analytics/monthly'),
  getYearlyStats: () => api.get('/analytics/yearly'),
  getSalesReport: (period) => api.get(`/analytics/sales/${period}`),
  getDashboardStats: () => api.get('/analytics/dashboard'),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1, selected_size = '', selected_color = '') => 
    api.post('/cart/add', { product_id: productId, quantity, selected_size, selected_color }),
  updateCartItem: (productId, quantity, selected_size = '', selected_color = '') =>
    api.put(`/cart/${productId}`, { quantity, selected_size, selected_color }),
  removeFromCart: (productId, selected_size = '', selected_color = '') =>
    api.delete(`/cart/${productId}`, { params: { selected_size, selected_color } }),
  clearCart: () => api.delete('/cart/clear'),
};

// User Profile API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  sendOTP: (email) => api.post('/auth/send-otp', { email }, { timeout: 45000 }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }, { timeout: 45000 }),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
};

// Admin Auth API
export const adminAPI = {
  login: (username, password) => api.post('/admin/login', { username, password }),
  logout: () => api.post('/admin/logout'),
  logoutAll: () => api.post('/admin/logout-all'),
  changePassword: (data) => api.post('/admin/change-password', data),
};

export default api;
