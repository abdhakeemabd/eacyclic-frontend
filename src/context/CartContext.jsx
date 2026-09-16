import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../utils/api';
import { useUser } from './UserContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Lazy state initialization from localStorage so refresh never wipes saved items
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
      return [];
    }
  });

  const [likes, setLikes] = useState(() => {
    try {
      const savedLikes = localStorage.getItem('likes');
      return savedLikes ? JSON.parse(savedLikes) : [];
    } catch (e) {
      console.error('Failed to load likes from localStorage:', e);
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { isAuthenticated } = useUser();

  // Fetch cart from API if authenticated
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated) {
        try {
          const response = await cartAPI.getCart();
          if (response.data && response.data.items) {
            const apiCart = response.data.items.map(item => ({
              ...item.product_details,
              quantity: item.quantity
            }));
            if (apiCart.length > 0) {
              setCart(apiCart);
            }
          }
        } catch (e) {
          console.error('Failed to fetch cart from API:', e);
        }
      }
      setIsInitialized(true);
    };
    fetchCart();
  }, [isAuthenticated]);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Persist likes to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('likes', JSON.stringify(likes));
  }, [likes]);

  // Toggle Like / Wishlist
  const toggleLike = (product) => {
    const exists = likes.some(item => item.id === product.id);
    let updatedLikes;
    if (exists) {
      updatedLikes = likes.filter(item => item.id !== product.id);
    } else {
      updatedLikes = [...likes, product];
    }
    setLikes(updatedLikes);
    return !exists;
  };

  const isLiked = (productId) => {
    return likes.some(item => item.id === productId);
  };


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
    likes,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    toggleLike,
    isLiked,
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
