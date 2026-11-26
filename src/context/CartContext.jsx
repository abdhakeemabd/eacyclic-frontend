import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../utils/api';
import { useUser } from './UserContext';

const CartContext = createContext();

const RECENT_ORDERS_KEY = 'eacyclic_recent_orders';

export const CartProvider = ({ children }) => {
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

  const [recentOrders, setRecentOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_ORDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openCartDrawer = () => setIsDrawerOpen(true);
  const closeCartDrawer = () => setIsDrawerOpen(false);

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
              cart_item_key: `${item.product}_${item.selected_size || ''}_${item.selected_color || ''}`,
              selectedSize: item.selected_size || '',
              selectedColor: item.selected_color || '',
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
    };
    fetchCart();
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('likes', JSON.stringify(likes));
  }, [likes]);

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(recentOrders.slice(0, 10)));
    } catch (e) {
      console.warn('Could not persist recent orders:', e);
    }
  }, [recentOrders]);

  // Save a placed order locally for instant "Buy It Again" UX across sessions
  const recordLocalOrder = (order) => {
    if (!order || !order.id) return;
    setRecentOrders(prev => {
      const filtered = prev.filter(o => String(o.id) !== String(order.id));
      return [order, ...filtered].slice(0, 10);
    });
  };

  // Toggle Like / Wishlist
  const toggleLike = (product) => {
    const exists = likes.some(item => item.id === product.id);
    const updatedLikes = exists
      ? likes.filter(item => item.id !== product.id)
      : [...likes, product];
    setLikes(updatedLikes);
    return !exists;
  };

  const isLiked = (productId) => {
    return likes.some(item => item.id === productId);
  };

  // Add item to cart (with optional variant: size, color)
  const addToCart = async (product, quantity = 1, variantOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      const size = variantOptions.size || variantOptions.selectedSize || product.selectedSize || '';
      const color = variantOptions.color || variantOptions.selectedColor || product.selectedColor || '';
      const itemKey = `${product.id}_${size}_${color}`;

      setCart(prev => {
        const existingIndex = prev.findIndex(item =>
          item.cart_item_key ? item.cart_item_key === itemKey : (item.id === product.id && (item.selectedSize || '') === size && (item.selectedColor || '') === color)
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: (updated[existingIndex].quantity || 1) + quantity,
          };
          return updated;
        }
        return [
          ...prev,
          {
            ...product,
            cart_item_key: itemKey,
            selectedSize: size,
            selectedColor: color,
            quantity,
          },
        ];
      });

      if (isAuthenticated && product.id) {
        try {
          await cartAPI.addToCart(product.id, quantity, size, color);
        } catch (apiErr) {
          console.warn('Backend cart sync skipped:', apiErr?.response?.status || apiErr.message);
        }
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Reorder all items from a past order directly into the cart (or return checkout items)
  const reorderOrder = async (order) => {
    const orderItems = Array.isArray(order?.items) ? order.items : [];
    const normalizedItems = [];

    for (const item of orderItems) {
      const productObj = {
        id: item.product_id || `reorder-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: item.product_name,
        name: item.product_name,
        price: parseFloat(item.price || 0),
        offerPrice: parseFloat(item.price || 0),
        image_url: item.product_image || item.image_url || item.image || '',
        image: item.product_image || item.image_url || item.image || '',
        selectedSize: item.selected_size || '',
        selectedColor: item.selected_color || '',
      };
      const qty = Math.max(1, parseInt(item.quantity || 1, 10));
      await addToCart(productObj, qty, {
        selectedSize: productObj.selectedSize,
        selectedColor: productObj.selectedColor,
      });
      normalizedItems.push({ ...productObj, quantity: qty });
    }

    return { addedCount: normalizedItems.length, items: normalizedItems };
  };

  // Remove item from cart (supports cart_item_key or productId)
  const removeFromCart = async (keyOrId) => {
    try {
      setLoading(true);
      setError(null);

      const itemToRemove = cart.find(
        item => (item.cart_item_key && item.cart_item_key === keyOrId) || item.id === keyOrId
      );
      setCart(prev =>
        prev.filter(item => (item.cart_item_key ? item.cart_item_key !== keyOrId : item.id !== keyOrId))
      );

      if (isAuthenticated && itemToRemove?.id) {
        try {
          await cartAPI.removeFromCart(
            itemToRemove.id,
            itemToRemove.selectedSize || '',
            itemToRemove.selectedColor || ''
          );
        } catch (apiErr) {
          console.warn('Backend cart removal skipped:', apiErr?.response?.status || apiErr.message);
        }
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
  const updateQuantity = async (keyOrId, quantity) => {
    try {
      setLoading(true);
      setError(null);

      if (quantity <= 0) {
        return removeFromCart(keyOrId);
      }

      const targetItem = cart.find(
        item => (item.cart_item_key && item.cart_item_key === keyOrId) || item.id === keyOrId
      );

      setCart(prev =>
        prev.map(item =>
          ((item.cart_item_key && item.cart_item_key === keyOrId) || item.id === keyOrId)
            ? { ...item, quantity }
            : item
        )
      );

      if (isAuthenticated && targetItem?.id) {
        try {
          await cartAPI.updateCartItem(
            targetItem.id,
            quantity,
            targetItem.selectedSize || '',
            targetItem.selectedColor || ''
          );
        } catch (apiErr) {
          console.warn('Backend cart quantity sync skipped:', apiErr?.response?.status || apiErr.message);
        }
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

      if (isAuthenticated) {
        try {
          await cartAPI.clearCart();
        } catch (apiErr) {
          console.warn('Backend cart clear skipped:', apiErr?.response?.status || apiErr.message);
        }
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.offerPrice || item.price || 0);
      return total + (price * (item.quantity || 1));
    }, 0);
  };

  const getCartSavings = () => {
    return cart.reduce((savings, item) => {
      const price = parseFloat(item.offerPrice || item.price || 0);
      const oldP = parseFloat(item.oldPrice || item.old_price || item.product_details?.oldPrice || item.product_details?.old_price || 0);
      if (oldP > price) {
        return savings + ((oldP - price) * (item.quantity || 1));
      }
      return savings;
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + (item.quantity || 1), 0);
  };

  const value = {
    cart,
    likes,
    recentOrders,
    loading,
    error,
    isDrawerOpen,
    openCartDrawer,
    closeCartDrawer,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartSavings,
    getCartItemCount,
    toggleLike,
    isLiked,
    recordLocalOrder,
    reorderOrder,
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
