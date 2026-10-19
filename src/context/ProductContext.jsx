import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { productsAPI } from '../utils/api';
import { products as initialProducts } from '../data/products';

const ProductContext = createContext();

// Clean strings for fuzzy matching
const cleanStr = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Normalize initial products so every property is directly accessible
const normalizedInitialProducts = initialProducts.map((p, idx) => {
  const img = (p.gallery && p.gallery[0]) || p.image_url || p.image || '';
  const gal = (p.gallery && p.gallery.length > 0) ? p.gallery : (img ? [img] : []);
  return {
    ...p,
    id: p.id || (idx + 1),
    name: p.name || p.title || 'Product',
    title: p.title || p.name || 'Product',
    price: p.offerPrice || p.price || 0,
    offerPrice: p.offerPrice || p.price || 0,
    oldPrice: p.oldPrice || null,
    image: img,
    image_url: img,
    gallery: gal,
    category: p.category || 'Store Pick',
    freeShipping: p.freeShipping === true
  };
});

// Sort initial local products descending by ID (matching DB LIFO order)
const initialSortedProducts = [...normalizedInitialProducts].sort(
  (a, b) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0)
);

export const ProductProvider = ({ children }) => {
  // 1. Instant loading: Initialize with normalized local products so UI renders in 0ms with all images working
  const [products, setProducts] = useState(() => initialSortedProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isSeedingRef = useRef(false);

  // Helper for LIFO sorting (Newest ID First)
  const getSortedProducts = (productList) => {
    return [...productList].sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      if (dateB - dateA !== 0) return dateB - dateA;
      return (parseInt(b.id) || 0) - (parseInt(a.id) || 0);
    });
  };

  // Helper to merge database products with rich local asset imports
  const mergeProductsWithLocalAssets = (fetchedProducts) => {
    return fetchedProducts.map((fp) => {
      const fpClean = cleanStr(fp.name || fp.title);
      
      // Match by title/name ONLY.
      // (Do NOT match by numeric ID because DB sequence 1..57 does not match local data IDs 29..85)
      const matched = normalizedInitialProducts.find(
        (ip) => cleanStr(ip.title || ip.name) === fpClean
      );

      // Local imported asset from products.js is ALWAYS valid and never 404s
      const localImage = matched?.gallery?.[0] || matched?.image || matched?.image_url;
      const localGallery = (matched?.gallery && matched.gallery.length > 0) ? matched.gallery : (localImage ? [localImage] : []);

      // If backend has an uploaded URL (http/https/data:), use it. Otherwise, use the reliable local imported asset!
      const isExternalUpload = typeof fp.image_url === 'string' && (fp.image_url.startsWith('http://') || fp.image_url.startsWith('https://') || fp.image_url.startsWith('data:'));
      
      const resolvedImage = isExternalUpload ? fp.image_url : (localImage || fp.image_url || '');
      const resolvedGallery = localGallery.length > 0 ? localGallery : (fp.gallery && fp.gallery.length > 0 ? fp.gallery : (resolvedImage ? [resolvedImage] : []));

      return {
        ...matched,
        ...fp,
        title: fp.name || fp.title || matched?.title,
        name: fp.name || fp.title || matched?.name,
        price: fp.price || matched?.offerPrice || matched?.price,
        offerPrice: fp.price || matched?.offerPrice || matched?.price,
        oldPrice: fp.oldPrice || matched?.oldPrice,
        image_url: resolvedImage,
        image: resolvedImage,
        gallery: resolvedGallery,
        category: fp.category || matched?.category || 'Store Pick',
        freeShipping: fp.freeShipping !== undefined ? fp.freeShipping : (matched?.freeShipping === true),
        sizes: fp.sizes && fp.sizes.length > 0 ? fp.sizes : (matched?.sizes || []),
        colors: fp.colors && fp.colors.length > 0 ? fp.colors : (matched?.colors || []),
        variants: fp.variants && fp.variants.length > 0 ? fp.variants : (matched?.variants || [])
      };
    });
  };

  const fetchProducts = async () => {
    try {
      setError(null);
      const response = await productsAPI.getAll();
      let fetchedProducts = response.data || [];

      if (fetchedProducts.length > 0) {
        const enriched = mergeProductsWithLocalAssets(fetchedProducts);
        
        // Include any local products not yet in DB so nothing is ever missing
        const existingCleanNames = new Set(enriched.map(p => cleanStr(p.name || p.title)));
        const missingInitial = normalizedInitialProducts.filter(
          ip => !existingCleanNames.has(cleanStr(ip.title || ip.name))
        );

        const allCombined = [...enriched, ...missingInitial];
        setProducts(getSortedProducts(allCombined));
      } else {
        // If DB returned empty, use normalized local products
        setProducts(initialSortedProducts);
      }

      return { success: true };
    } catch (err) {
      console.warn('API fetch fallback to local products:', err);
      // Fallback: keep normalized local products
      setProducts(initialSortedProducts);
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
        gallery: productData.gallery || [],
        sizes: productData.sizes || [],
        colors: productData.colors || [],
        variants: productData.variants || []
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
      if (productData.sizes !== undefined) payload.sizes = productData.sizes;
      if (productData.colors !== undefined) payload.colors = productData.colors;
      if (productData.variants !== undefined) payload.variants = productData.variants;
      
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
    return products.find(p => p.id?.toString() === productId?.toString());
  };

  const getProductsByCategory = (category) => {
    return products.filter(p => 
      p.category?.toLowerCase() === category.toLowerCase()
    );
  };

  const searchProducts = (query) => {
    const lowerQuery = query.toLowerCase();
    return products.filter(p =>
      (p.name || p.title || '')?.toLowerCase().includes(lowerQuery) ||
      (p.description || p.content || '')?.toLowerCase().includes(lowerQuery)
    );
  };

  const resetProducts = async () => {
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
