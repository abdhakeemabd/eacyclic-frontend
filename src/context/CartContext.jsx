import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../utils/api';
import { useUser } from './UserContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useUser();

  // Load cart from API if authenticated, else from localStorage
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated) {
        try {
          const response = await cartAPI.getCart();
          // Assuming response.data.items is an array of { id, product, product_details, quantity }
          // We need to map it to match the local cart structure: { id, name, price, quantity, ... }
          const apiCart = response.data.items.map(item => ({
            ...item.product_details,
            quantity: item.quantity
          }));
          setCart(apiCart);
        } catch (e) {
          console.error('Failed to fetch cart from API:', e);
        }
      } else {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (e) {
            console.error('Failed to parse cart from localStorage:', e);
          }
        }
      }
    };
    fetchCart();
  }, [isAuthenticated]);

  // Save cart to localStorage whenever it changes (as backup or for guests)
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

      // Sync with backend API if authenticated
      if (isAuthenticated) {
        await cartAPI.addToCart(product.id, quantity);
      }

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

      // Sync with backend API
      if (isAuthenticated) {
        await cartAPI.removeFromCart(productId);
      }

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

      // Sync with backend API
      if (isAuthenticated) {
        await cartAPI.updateCartItem(productId, quantity);
      }

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

      // Sync with backend API
      if (isAuthenticated) {
        await cartAPI.clearCart();
      }

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
