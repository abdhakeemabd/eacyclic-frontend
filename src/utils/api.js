import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use((config) => {
  // Try adminToken first (admin panel), then fallback to userToken (customer)
  const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
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
  getSalesReport: (period) => api.get(`/analytics/sales/${period}`), // period: 'day', 'month', 'year'
  getDashboardStats: () => api.get('/analytics/dashboard'),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => api.post('/cart/add', { product_id: productId, quantity }),
  updateCartItem: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// User Profile API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
};

// Admin Auth API
export const adminAPI = {
  login: (username, password) => api.post('/admin/login', { username, password }),
};

export default api;
