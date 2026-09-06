import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Check if product already exists in cart
      const existingItemIndex = cart.findIndex(item => item.id === product.id);

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const updatedCart = [...cart];
        updatedCart[existingItemIndex].quantity += quantity;
        setCart(updatedCart);
      } else {
        // Add new item to cart
        setCart([...cart, { ...product, quantity }]);
      }

      // Optional: Sync with backend API
      // await axios.post(`${API_BASE_URL}/api/v1/cart/add`, {
      //   product_id: product.id,
      //   quantity
      // });

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      setError(null);

      setCart(cart.filter(item => item.id !== productId));

      // Optional: Sync with backend API
      // await axios.delete(`${API_BASE_URL}/api/v1/cart/${productId}`);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      setLoading(true);
      setError(null);

      if (quantity <= 0) {
        return removeFromCart(productId);
      }

      const updatedCart = cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      setCart(updatedCart);

      // Optional: Sync with backend API
      // await axios.put(`${API_BASE_URL}/api/v1/cart/${productId}`, { quantity });

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      setCart([]);

      // Optional: Sync with backend API
      // await axios.delete(`${API_BASE_URL}/api/v1/cart/clear`);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.offerPrice || item.price || 0);
      return total + (price * item.quantity);
    }, 0);
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
