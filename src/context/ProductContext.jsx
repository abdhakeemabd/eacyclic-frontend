import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { products as initialProducts, PRODUCT_DATA_VERSION } from '../data/products';
import axios from 'axios';

const ProductContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ADMIN_PRODUCTS_KEY = 'adminProducts';
const VERSION_KEY = 'productDataVersion';

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const initialLoadDone = useRef(false);

  // Helper for LIFO sorting (Newest ID First)
  const getSortedProducts = (productList) => {
    return [...productList].sort((a, b) => {
      // Prioritize manually added products (long IDs) then sequential IDs
      const valA = a.id.toString();
      const valB = b.id.toString();
      
      // If one is manual and other is sequence, manual comes first (longer ID)
      if (valA.length !== valB.length) {
        return valB.length - valA.length;
      }
      
      // If same length, sort numerically/alphabetically descending
      return valB.localeCompare(valA, undefined, { numeric: true });
    });
  };

  // Sync Logic: Best method for keeping products.js as source of truth
  const syncProducts = (savedProductsJson) => {
    try {
      const storedVersion = localStorage.getItem(VERSION_KEY);
      const initialReversed = getSortedProducts(initialProducts);

      // 1. If version mismatch, FORCE CLEAR everything and use only file data
      if (storedVersion !== PRODUCT_DATA_VERSION) {
        console.warn(`FORCE RESET: Version mismatch (${storedVersion} vs ${PRODUCT_DATA_VERSION}). Purging all old cache.`);
        localStorage.removeItem(ADMIN_PRODUCTS_KEY);
        localStorage.setItem(VERSION_KEY, PRODUCT_DATA_VERSION);
        localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(initialReversed));
        return initialReversed;
      }

      // 2. If no saved data, use file data
      if (!savedProductsJson) {
        localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(initialReversed));
        return initialReversed;
      }

      // 3. Merging logic: Update existing, add new from file, keep user-added
      const parsedProducts = JSON.parse(savedProductsJson);
      const initialIds = new Set(initialProducts.map(p => p.id.toString()));
      
      // Start with latest data from products.js
      let merged = [...initialProducts];
      
      // Keep only user-added products from storage (not in file)
      // We identify these by their ID not being in the initialIds set
      parsedProducts.forEach(savedP => {
        if (!initialIds.has(savedP.id.toString())) {
          merged.push(savedP);
        }
      });

      const finalProducts = getSortedProducts(merged);
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(finalProducts));
      return finalProducts;

    } catch (e) {
      console.error('Failed to sync products:', e);
      return getSortedProducts(initialProducts);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_PRODUCTS_KEY);
    const finalized = syncProducts(saved);
    setProducts(finalized);
    initialLoadDone.current = true;
  }, [PRODUCT_DATA_VERSION, initialProducts]); // Re-run if version or content changes


  // Save products to localStorage whenever they change
  useEffect(() => {
    if (initialLoadDone.current && products.length > 0) {
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(products));
      localStorage.setItem(VERSION_KEY, PRODUCT_DATA_VERSION);
    }
  }, [products]);

  // Sync state between tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === ADMIN_PRODUCTS_KEY && e.newValue) {
        try {
          setProducts(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Storage sync error:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/v1/products`);
      setProducts(response.data);
      localStorage.setItem('adminProducts', JSON.stringify(response.data));
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData) => {
    try {
      setLoading(true);
      const newProduct = { ...productData, id: Date.now().toString() };
      setProducts([newProduct, ...products]);
      return { success: true, data: newProduct };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      setLoading(true);
      const updatedProducts = products.map(p =>
        p.id.toString() === productId.toString() ? { ...p, ...productData } : p
      );
      setProducts(updatedProducts);
      return { success: true, data: productData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      setLoading(true);
      const filteredProducts = products.filter(p => p.id.toString() !== productId.toString());
      setProducts(filteredProducts);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };


  const sortedProducts = getSortedProducts(products);

  const getProductById = (productId) => {
    return products.find(p => p.id.toString() === productId.toString());
  };

  const getProductsByCategory = (category) => {
    return sortedProducts.filter(p => 
      p.category?.toLowerCase() === category.toLowerCase()
    );
  };

  const searchProducts = (query) => {
    const lowerQuery = query.toLowerCase();
    return sortedProducts.filter(p =>
      p.title?.toLowerCase().includes(lowerQuery) ||
      p.name?.toLowerCase().includes(lowerQuery) ||
      p.content?.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery)
    );
  };

  const resetProducts = () => {
    const initialized = getSortedProducts(initialProducts);
    setProducts(initialized);
    localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(initialized));
    localStorage.setItem(VERSION_KEY, PRODUCT_DATA_VERSION);
  };

  const value = {
    products: sortedProducts,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductsByCategory,
    searchProducts,
    resetProducts,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};

export default ProductContext;
