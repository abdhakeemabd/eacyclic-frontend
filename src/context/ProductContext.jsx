import React, { createContext, useContext, useState, useEffect } from 'react';
import { productsAPI } from '../utils/api';
import { products as initialProducts } from '../data/products';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper for LIFO sorting (Newest ID First)
  const getSortedProducts = (productList) => {
    return [...productList].sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA; // Sort by newest created_at first
    });
  };

  const seedDatabaseIfNeeded = async (existingProducts) => {
    if (existingProducts.length === 0) {
      console.log('Seeding database with initial products...');
      const seededProducts = [];
      for (const p of initialProducts) {
        try {
          const payload = {
            name: p.title || p.name || 'Unnamed Product',
            description: p.description || p.content || '',
            price: p.price || p.oldPrice || p.offerPrice ? parseFloat(p.offerPrice || p.price || p.oldPrice) : 0,
            category: p.category || 'Uncategorized',
            stock: p.count || p.stock || 10,
            image_url: p.image_url || (p.gallery && p.gallery[0]) || p.image || '',
            discount: p.offer ? parseFloat(p.offer.replace('%', '')) : 0
          };
          const res = await productsAPI.create(payload);
          seededProducts.push(res.data);
        } catch (e) {
          console.error('Failed to seed product:', p.title, e);
        }
      }
      return seededProducts;
    }
    return existingProducts;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getAll();
      
      let fetchedProducts = response.data;
      
      // MIGRATION: Ensure all initialProducts are in the database
      let newlySeeded = [];
      for (const p of initialProducts) {
         try {
             const nameToMatch = p.title || p.name || 'Unnamed Product';
             if (!fetchedProducts.find(fp => fp.name === nameToMatch)) {
                 const payload = {
                    name: nameToMatch,
                    description: p.description || p.content || '',
                    price: p.price || p.oldPrice || p.offerPrice ? parseFloat(p.offerPrice || p.price || p.oldPrice) : 0,
                    category: p.category || 'Uncategorized',
                    stock: p.count || p.stock || 10,
                    image_url: p.image_url || (p.gallery && p.gallery[0]) || p.image || '',
                    discount: p.offer ? parseFloat(typeof p.offer === 'string' ? p.offer.replace('%', '') : p.offer) : 0
                 };
                 // Fix: Ensure NaN doesn't break the API
                 if (isNaN(payload.price)) payload.price = 0;
                 if (isNaN(payload.discount)) payload.discount = 0;
                 if (isNaN(payload.stock)) payload.stock = 0;
                 
                 const res = await productsAPI.create(payload);
                 newlySeeded.push(res.data);
             }
         } catch (e) {
             console.error("Seed error for product:", p.title || p.name, e);
         }
      }
      if (newlySeeded.length > 0) {
          fetchedProducts = [...fetchedProducts, ...newlySeeded];
      }
      
      // MIGRATION: Recover products from localStorage
      try {
        const localData = localStorage.getItem('adminProducts');
        if (localData) {
          const localProducts = JSON.parse(localData);
          const initialIds = new Set(initialProducts.map(p => p.id?.toString()));
          // Find user-added products (long timestamps or not in initialProducts)
          const userAddedLocalProducts = localProducts.filter(p => !initialIds.has(p.id?.toString()));
          
          let newlyMigrated = [];
          for (const lp of userAddedLocalProducts) {
             // Check if we already migrated it (by name match)
             if (!fetchedProducts.find(fp => fp.name === (lp.title || lp.name))) {
                 const payload = {
                    name: lp.title || lp.name || 'Unnamed Product',
                    description: lp.description || lp.content || '',
                    price: lp.price || lp.oldPrice || lp.offerPrice ? parseFloat(lp.offerPrice || lp.price || lp.oldPrice) : 0,
                    category: lp.category || 'Uncategorized',
                    stock: lp.count || lp.stock || 10,
                    image_url: lp.image_url || (lp.gallery && lp.gallery[0]) || lp.image || '',
                    discount: lp.offer ? parseFloat(typeof lp.offer === 'string' ? lp.offer.replace('%', '') : lp.offer) : 0
                 };
                 const res = await productsAPI.create(payload);
                 newlyMigrated.push(res.data);
             }
          }
          if (newlyMigrated.length > 0) {
             fetchedProducts = [...newlyMigrated, ...fetchedProducts];
          }
          // Optional: clear local storage so it doesn't run again, but leaving it is safe since we check by name
        }
      } catch (err) {
        console.error("Migration error:", err);
      }
      
      setProducts(getSortedProducts(fetchedProducts));
      return { success: true, data: fetchedProducts };
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (productData) => {
    try {
      setLoading(true);
      const payload = {
        name: productData.name || productData.title,
        description: productData.description || '',
        price: parseFloat(productData.price) || 0,
        category: productData.category || 'Uncategorized',
        stock: parseInt(productData.stock) || 0,
        image_url: productData.image || productData.image_url || '',
        discount: parseFloat(productData.discount) || 0,
        freeShipping: productData.freeShipping !== undefined ? productData.freeShipping : true,
        gallery: productData.gallery || []
      };
      
      const response = await productsAPI.create(payload);
      setProducts(prev => getSortedProducts([response.data, ...prev]));
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      setLoading(true);
      
      const payload = {};
      if (productData.name !== undefined || productData.title !== undefined) payload.name = productData.name || productData.title;
      if (productData.description !== undefined) payload.description = productData.description;
      if (productData.price !== undefined) payload.price = parseFloat(productData.price) || 0;
      if (productData.category !== undefined) payload.category = productData.category;
      if (productData.stock !== undefined) payload.stock = parseInt(productData.stock) || 0;
      if (productData.image !== undefined || productData.image_url !== undefined) payload.image_url = productData.image || productData.image_url;
      if (productData.discount !== undefined) payload.discount = parseFloat(productData.discount) || 0;
      if (productData.isActive !== undefined) payload.isActive = productData.isActive;
      if (productData.freeShipping !== undefined) payload.freeShipping = productData.freeShipping;
      if (productData.gallery !== undefined) payload.gallery = productData.gallery;
      
      const response = await productsAPI.update(productId, payload);
      setProducts(prev => 
        getSortedProducts(prev.map(p => p.id === productId ? response.data : p))
      );
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      setLoading(true);
      await productsAPI.delete(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getProductById = (productId) => {
    return products.find(p => p.id.toString() === productId.toString());
  };

  const getProductsByCategory = (category) => {
    return products.filter(p => 
      p.category?.toLowerCase() === category.toLowerCase()
    );
  };

  const searchProducts = (query) => {
    const lowerQuery = query.toLowerCase();
    return products.filter(p =>
      p.name?.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery)
    );
  };

  const resetProducts = async () => {
     // Optionally implement a clear and re-seed logic
     // But for now, just fetch products.
     await fetchProducts();
  };

  const value = {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductsByCategory,
    searchProducts,
    resetProducts
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};

export default ProductContext;
