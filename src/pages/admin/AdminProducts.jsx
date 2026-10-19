import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Search, Image as ImageIcon, 
  X, Package, Tag, Layers, DollarSign, Database,
  Calendar, ChevronLeft, ChevronRight, Power, ChevronDown, Check, Sparkles, Palette,
  ArrowLeft, Save, Copy, RefreshCw, Upload, Eye, CheckCircle2, ShieldCheck, Truck, ListFilter
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { BaseTable } from '../../components/shadcn-custom/BaseTable';
import { BaseDropdown } from '../../components/shadcn-custom/BaseDropdown';
import { ReadMoreText } from '../../components/common/ReadMoreText';
import { showSuccess, showError, showConfirm } from '../../utils/swalUtils';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AdminStatCard from '../../component/AdminStatCard';
import { Activity, AlertCircle, Layers as LayersIcon } from 'lucide-react';
import { 
  getColorHex, getProductVariants, 
  DEFAULT_CLOTHING_SIZES, DEFAULT_CLOTHING_COLORS, SIZE_LABELS,
  BED_SIZES, BED_FINISHES, DINING_TABLE_SIZES, DINING_TABLE_FINISHES, CHAIR_SIZES, CHAIR_FINISHES
} from '../../utils/variantUtils';

function AdminProducts() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct: removeProduct } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  
  // View mode: 'list' (catalog table) or 'editor' (dedicated Flipkart-style product page)
  const [viewMode, setViewMode] = useState('list');

  // Pagination State
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  useEffect(() => {
    setSearchParams(prev => {
      if (currentPage === 1) prev.delete('page');
      else prev.set('page', currentPage);
      return prev;
    }, { replace: true });
  }, [currentPage, setSearchParams]);

  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [expandedRow, setExpandedRow] = useState(null);
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    oldPrice: '',
    category: '',
    stock: '',
    image_url: '',
    discount: 0,
    imageFile: null,
    isActive: true,
    freeShipping: true,
    gallery: [],
    sizes: [],
    colors: [],
    variants: [] // Flipkart/Amazon individual variant combinations with specific prices
  });

  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customColorInput, setCustomColorInput] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#134e35');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Fancybox.bind("[data-fancybox]", {
      Toolbar: {
        display: {
          left: ["infobar"],
          middle: ["zoomIn", "zoomOut", "toggle1to1", "rotateCCW", "rotateCW"],
          right: ["slideshow", "fullscreen", "download", "thumbs", "close"],
        },
      },
      Carousel: { transition: "slide" }
    });
    return () => {
      Fancybox.destroy();
    };
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = (product.title || product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.id.toString().includes(searchTerm);
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'All Time') {
        const productDate = !isNaN(product.id) && product.id.length > 10 
            ? new Date(parseInt(product.id)) 
            : new Date('2024-01-01');
        
        const now = new Date();
        const diffTime = Math.abs(now - productDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (dateFilter === 'Today') matchesDate = diffDays <= 1;
        if (dateFilter === 'Last 7 Days') matchesDate = diffDays <= 7;
        if (dateFilter === 'Last 30 Days') matchesDate = diffDays <= 30;
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [products, searchTerm, categoryFilter, dateFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const toggleRow = (id) => {
    setExpandedRow(prev => prev === id ? null : id);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const base64Images = await Promise.all(files.map(file => fileToBase64(file)));
      const newGallery = [...formData.gallery, ...base64Images];
      setFormData({...formData, gallery: newGallery, image_url: newGallery[0] || ''});
      setImagePreviews(newGallery);
    }
  };

  const handleAddImageUrl = (e) => {
    if (e) e.preventDefault();
    const url = customImageUrlInput.trim();
    if (!url) return;
    const newGallery = [...formData.gallery, url];
    setFormData({ ...formData, gallery: newGallery, image_url: formData.image_url || url });
    setImagePreviews(newGallery);
    setCustomImageUrlInput('');
  };

  const removeImage = (index) => {
    const newGallery = formData.gallery.filter((_, i) => i !== index);
    setFormData({...formData, gallery: newGallery, image_url: newGallery[0] || ''});
    setImagePreviews(newGallery);
  };

  // Sync / Build Variant Matrix combinations (Flipkart & Amazon seller central style)
  const buildVariantMatrix = (sizes, colors, currentVariants = [], basePriceVal = null, baseOldPriceVal = null) => {
    if ((!sizes || sizes.length === 0) && (!colors || colors.length === 0)) {
      return [];
    }

    const sList = sizes && sizes.length > 0 ? sizes : ['Standard'];
    const cList = colors && colors.length > 0 ? colors : ['Default'];

    const basePrice = basePriceVal !== null ? parseFloat(basePriceVal) || 0 : (parseFloat(formData.price) || 0);
    const baseOldPrice = baseOldPriceVal !== null ? parseFloat(baseOldPriceVal) || 0 : (parseFloat(formData.oldPrice) || (basePrice > 0 ? Math.round(basePrice * 1.2) : 0));

    const rows = [];
    for (const s of sList) {
      for (const c of cList) {
        // Match existing entry to preserve user-entered prices
        const existing = currentVariants.find(
          v => (v.size || 'Standard') === s && (v.color || 'Default') === c
        );

        if (existing) {
          rows.push(existing);
        } else {
          // Smart catalog default pricing (like the 4 bed products on website)
          let vPrice = basePrice;
          let vOldPrice = baseOldPrice;

          const sLower = s.toLowerCase();
          const cLower = c.toLowerCase();

          if (sLower.includes('6.25 x 5') && cLower.includes('akesh')) {
            vPrice = 14000; vOldPrice = 16500;
          } else if (sLower.includes('6.25 x 6') && cLower.includes('akesh')) {
            vPrice = 19000; vOldPrice = 22500;
          } else if (sLower.includes('6.25 x 5') && cLower.includes('teak')) {
            vPrice = 17000; vOldPrice = 20000;
          } else if (sLower.includes('6.25 x 6') && cLower.includes('teak')) {
            vPrice = 24000; vOldPrice = 28500;
          }

          rows.push({
            id: `${s}_${c}`.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
            size: s,
            color: c,
            price: vPrice,
            oldPrice: vOldPrice,
            stock: parseInt(formData.stock) || 25,
            sku: `${(formData.title || 'PROD').substring(0, 4).toUpperCase()}-${s.substring(0, 3).toUpperCase()}-${c.substring(0, 3).toUpperCase()}`,
            isActive: true
          });
        }
      }
    }
    return rows;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        name: formData.title,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        image: formData.image_url,
        sizes: formData.sizes || [],
        colors: formData.colors || [],
        variants: formData.variants || []
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        showSuccess('Updated Successfully', 'Product details, variants, and individual pricing have been saved.');
      } else {
        await addProduct(payload);
        showSuccess('Product Created', 'New product with individual variant prices has been saved.');
      }
      setViewMode('list');
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      showError('Oops...', 'Something went wrong while saving the product!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSize = (size) => {
    const current = formData.sizes || [];
    let updatedSizes;
    if (current.includes(size)) {
      updatedSizes = current.filter(s => s !== size);
    } else {
      updatedSizes = [...current, size];
    }
    const updatedVariants = buildVariantMatrix(updatedSizes, formData.colors || [], formData.variants || []);
    setFormData({ ...formData, sizes: updatedSizes, variants: updatedVariants });
  };

  const handleAddCustomSize = (e) => {
    if (e) e.preventDefault();
    const val = customSizeInput.trim();
    if (!val) return;
    const current = formData.sizes || [];
    if (!current.includes(val)) {
      const updatedSizes = [...current, val];
      const updatedVariants = buildVariantMatrix(updatedSizes, formData.colors || [], formData.variants || []);
      setFormData({ ...formData, sizes: updatedSizes, variants: updatedVariants });
    }
    setCustomSizeInput('');
  };

  const handleRemoveSize = (size) => {
    const updatedSizes = (formData.sizes || []).filter(s => s !== size);
    const updatedVariants = buildVariantMatrix(updatedSizes, formData.colors || [], formData.variants || []);
    setFormData({ ...formData, sizes: updatedSizes, variants: updatedVariants });
  };

  const handleToggleColor = (color) => {
    const current = formData.colors || [];
    const exists = current.some(c => c.toLowerCase() === color.toLowerCase());
    let updatedColors;
    if (exists) {
      updatedColors = current.filter(c => c.toLowerCase() !== color.toLowerCase());
    } else {
      updatedColors = [...current, color];
    }
    const updatedVariants = buildVariantMatrix(formData.sizes || [], updatedColors, formData.variants || []);
    setFormData({ ...formData, colors: updatedColors, variants: updatedVariants });
  };

  const handleAddCustomColor = (e) => {
    if (e) e.preventDefault();
    const val = customColorInput.trim();
    if (!val) return;
    const current = formData.colors || [];
    if (!current.some(c => c.toLowerCase() === val.toLowerCase())) {
      const updatedColors = [...current, val];
      const updatedVariants = buildVariantMatrix(formData.sizes || [], updatedColors, formData.variants || []);
      setFormData({ ...formData, colors: updatedColors, variants: updatedVariants });
    }
    setCustomColorInput('');
  };

  const handleRemoveColor = (color) => {
    const updatedColors = (formData.colors || []).filter(c => c.toLowerCase() !== color.toLowerCase());
    const updatedVariants = buildVariantMatrix(formData.sizes || [], updatedColors, formData.variants || []);
    setFormData({ ...formData, colors: updatedColors, variants: updatedVariants });
  };

  // Quick Preset Handlers
  const handleApplyApparelPreset = () => {
    const mergedSizes = [...new Set([...(formData.sizes || []), ...DEFAULT_CLOTHING_SIZES])];
    const mergedColors = [...new Set([...(formData.colors || []), ...DEFAULT_CLOTHING_COLORS])];
    const updatedVariants = buildVariantMatrix(mergedSizes, mergedColors, formData.variants || []);
    setFormData({ ...formData, sizes: mergedSizes, colors: mergedColors, variants: updatedVariants });
  };

  const handleApplyFurnitureBedPreset = () => {
    const mergedSizes = [...new Set([...(formData.sizes || []), ...BED_SIZES])];
    const mergedColors = [...new Set([...(formData.colors || []), ...BED_FINISHES])];
    const updatedVariants = buildVariantMatrix(mergedSizes, mergedColors, formData.variants || []);
    setFormData({ ...formData, sizes: mergedSizes, colors: mergedColors, variants: updatedVariants });
  };

  const handleApplyDiningChairPreset = () => {
    const mergedSizes = [...new Set([...(formData.sizes || []), ...CHAIR_SIZES])];
    const mergedColors = [...new Set([...(formData.colors || []), ...CHAIR_FINISHES])];
    const updatedVariants = buildVariantMatrix(mergedSizes, mergedColors, formData.variants || []);
    setFormData({ ...formData, sizes: mergedSizes, colors: mergedColors, variants: updatedVariants });
  };

  // Update a single field on a specific variant row in the matrix
  const handleUpdateVariantRow = (index, field, value) => {
    const updated = [...(formData.variants || [])];
    updated[index] = {
      ...updated[index],
      [field]: field === 'price' || field === 'oldPrice' || field === 'stock'
        ? (value === '' ? '' : parseFloat(value) || 0)
        : value
    };
    setFormData({ ...formData, variants: updated });
  };

  const handleDeleteVariantRow = (index) => {
    const updated = (formData.variants || []).filter((_, i) => i !== index);
    setFormData({ ...formData, variants: updated });
  };

  const handleCopyBasePriceToAll = () => {
    const bPrice = parseFloat(formData.price) || 0;
    const bOld = parseFloat(formData.oldPrice) || Math.round(bPrice * 1.2);
    const bStock = parseInt(formData.stock) || 20;

    const updated = (formData.variants || []).map(v => ({
      ...v,
      price: bPrice,
      oldPrice: bOld,
      stock: bStock
    }));
    setFormData({ ...formData, variants: updated });
  };

  const handleApplyBedExactPrices = () => {
    const updated = (formData.variants || []).map(v => {
      const s = (v.size || '').toLowerCase();
      const c = (v.color || '').toLowerCase();
      let p = 14000;
      let old = 16500;
      if (s.includes('6.25 x 6') && c.includes('akesh')) {
        p = 19000; old = 22500;
      } else if (s.includes('6.25 x 5') && c.includes('teak')) {
        p = 17000; old = 20000;
      } else if (s.includes('6.25 x 6') && c.includes('teak')) {
        p = 24000; old = 28500;
      }
      return { ...v, price: p, oldPrice: old };
    });
    setFormData({ ...formData, variants: updated });
  };

  const handleDelete = async (id) => {
    const result = await showConfirm(
      'Are you absolutely sure?',
      'This will permanently delete the product from the catalog.',
      'Yes, delete it!',
      'bg-[#ef4444] hover:bg-[#dc2626] focus:ring-[#ef4444]'
    );

    if (result.isConfirmed) {
      try {
        await removeProduct(id);
        showSuccess('Deleted!', 'The product has been removed.');
      } catch (error) {
        console.error('Error deleting product:', error);
        showError('Error', 'Failed to delete the product.');
      }
    }
  };

  const handleToggleActive = async (product) => {
    const isActivating = product.isActive === false;
    const actionText = isActivating ? 'Activate' : 'Deactivate';
    
    const result = await showConfirm(
      `${actionText} Product?`,
      `Are you sure you want to ${actionText.toLowerCase()} ${product.name || product.title}?`,
      actionText,
      'bg-[#134e35] hover:bg-[#0e3a27] focus:ring-[#134e35]'
    );

    if (result.isConfirmed) {
      try {
        await updateProduct(product.id, { isActive: isActivating });
        showSuccess(
          `Product ${actionText}d`, 
          `${product.name || product.title} has been successfully ${actionText.toLowerCase()}d.`
        );
      } catch (error) {
        console.error('Error updating status:', error);
        showError('Error', `Failed to ${actionText.toLowerCase()} the product.`);
      }
    }
  };

  const handleOpenEdit = (product) => {
    navigate(`/admin/products/edit/${product.id}`);
  };

  const handleOpenCreate = () => {
    navigate('/admin/products/add');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      oldPrice: '',
      category: '',
      stock: '',
      image_url: '',
      discount: 0,
      imageFile: null,
      isActive: true,
      freeShipping: true,
      gallery: [],
      sizes: [],
      colors: [],
      variants: []
    });
    setCustomSizeInput('');
    setCustomColorInput('');
    setCustomColorHex('#134e35');
    setImagePreviews([]);
    setEditingProduct(null);
  };

  const getProductImage = (product) => {
    if (product.image_url) return product.image_url;
    if (product.gallery && product.gallery.length > 0) return product.gallery[0];
    if (product.image) return product.image;
    return null;
  };

  const tableHeaders = [
    { label: '', className: 'w-10' },
    { label: 'S.No', className: 'w-14' },
    { label: 'Image', className: 'w-16' },
    { label: 'Product ID' },
    { label: 'Product Name' },
    { label: 'Category' },
    { label: 'Price' },
    { label: 'Variants' },
    { label: 'Stock' },
    { label: 'Status' },
    { label: 'Shipping' },
    { label: 'Actions', className: 'text-right' }
  ];

  // ==========================================
  // DEDICATED FULL-PAGE PRODUCT EDITOR (NOT A MODAL)
  // ==========================================
  if (viewMode === 'editor') {
    return (
      <div className="space-y-6 mx-auto pb-24 animate-fadeIn">
        
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border py-4 px-2 -mx-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setViewMode('list');
                resetForm();
              }}
              className="p-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Back to Product Catalog"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Catalog / Products</span>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-xs font-bold text-primary">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {editingProduct ? `Edit: ${formData.title || 'Product'}` : 'Create New Product'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setViewMode('list');
                resetForm();
              }}
              className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={15} /> Save & Publish
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Basic Information */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="border-b border-border pb-3 flex items-center gap-2">
              <Package className="text-primary" size={20} />
              <div>
                <h2 className="text-base font-bold text-foreground">Basic Information</h2>
                <p className="text-xs text-muted-foreground">Core product title, category, description, and base pricing</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="text-xs uppercase font-bold text-muted-foreground mb-1.5 block">
                  Product Name / Title <span className="text-destructive">*</span>
                </label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground text-sm transition-all outline-none"
                    placeholder="e.g. Aakeshya Upholstered Wooden Bed (6.25 x 5 ft - Akeshya)"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-muted-foreground mb-1.5 block">
                  Category <span className="text-destructive">*</span>
                </label>
                <div className="relative group">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                  <input
                    type="text"
                    required
                    list="category-suggestions"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground text-sm transition-all outline-none"
                    placeholder="e.g. Furniture, Fashion, Perfumes..."
                  />
                  <datalist id="category-suggestions">
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-muted-foreground mb-1.5 block">
                  Base Inventory Stock
                </label>
                <div className="relative group">
                  <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground text-sm transition-all outline-none"
                    placeholder="25"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-muted-foreground mb-1.5 block">
                  Base Selling Price (₹) <span className="text-destructive">*</span>
                </label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground text-sm transition-all outline-none"
                    placeholder="14000"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-muted-foreground mb-1.5 block">
                  Original List Price / MRP (₹)
                </label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground text-sm transition-all outline-none"
                    placeholder="16500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs uppercase font-bold text-muted-foreground mb-1.5 block">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground text-sm transition-all outline-none"
                  placeholder="Detail the craftsmanship, dimensions, wood quality, warranty, and special features..."
                />
              </div>
            </div>
          </div>

          {/* Card 2: Media & Gallery */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="text-primary" size={20} />
                <div>
                  <h2 className="text-base font-bold text-foreground">Media & Gallery</h2>
                  <p className="text-xs text-muted-foreground">Upload images or specify image links</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs uppercase font-bold text-muted-foreground mb-1.5 block">Upload Images From Device</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer text-xs text-muted-foreground bg-background border border-border rounded-xl p-2"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-muted-foreground mb-1.5 block">Add Image by Web Link</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrlInput}
                    onChange={(e) => setCustomImageUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {imagePreviews && imagePreviews.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-muted-foreground block mb-2">
                  Uploaded Gallery ({imagePreviews.length} images)
                </span>
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-xl border border-border overflow-hidden bg-white p-1 group shadow-xs">
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                      >
                        <X size={12} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-center bg-primary text-primary-foreground rounded py-0.5">
                          Main Image
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Variant Attributes (Sizes & Colors with Custom Color Adder) */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary" size={20} />
                <div>
                  <h2 className="text-base font-bold text-foreground">Step 1: Choose Variant Attributes</h2>
                  <p className="text-xs text-muted-foreground">Select or add dimensions and colors/finishes to generate your pricing matrix</p>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyFurnitureBedPreset}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={13} />
                  Bed Preset (6.25x5, 6.25x6 & Finishes)
                </button>
                <button
                  type="button"
                  onClick={handleApplyApparelPreset}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={13} />
                  Apparel Preset (S–XXL)
                </button>
                <button
                  type="button"
                  onClick={handleApplyDiningChairPreset}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={13} />
                  Chairs Preset
                </button>
              </div>
            </div>

            {/* Sizes Section */}
            <div className="space-y-3">
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center justify-between">
                <span>1. Sizes / Dimensions ({formData.sizes?.length || 0})</span>
                <span className="text-[11px] font-normal text-muted-foreground">Click a pill to toggle</span>
              </label>

              {/* Quick size chips */}
              <div className="flex flex-wrap gap-2">
                {['6.25 x 5 ft', '6.25 x 6 ft', 'S', 'M', 'L', 'XL', 'XXL', 'Single Chair', 'Set of 2', 'Set of 4', '4-Seater (4.5 x 3 ft)', '6-Seater (6 x 3.5 ft)'].map((sz) => {
                  const isSelected = (formData.sizes || []).includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleToggleSize(sz)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-background hover:bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{sz}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom size input */}
              <div className="flex items-center gap-2 pt-1 max-w-md">
                <input
                  type="text"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomSize(e); }}
                  placeholder="Add custom size (e.g. 6.25 x 6 ft, 3-Door, 500g)..."
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="px-3.5 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  + Add Size
                </button>
              </div>

              {/* Active size tags */}
              {formData.sizes && formData.sizes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.sizes.map((sz) => (
                    <span
                      key={sz}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold"
                    >
                      {sz}
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(sz)}
                        className="hover:text-destructive text-primary/70 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Colors / Wood Finishes Section (WITH COLOR ADDING OPTION) */}
            <div className="space-y-3 pt-4 border-t border-border">
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center justify-between">
                <span>2. Colors & Wood Finishes ({formData.colors?.length || 0})</span>
                <span className="text-[11px] font-normal text-muted-foreground">Click a swatch to toggle</span>
              </label>

              {/* Quick color preset chips */}
              <div className="flex flex-wrap items-center gap-2">
                {['Akeshya Wood', 'Teak Wood', 'Red', 'Green', 'Blue', 'Violet', 'Orange', 'Black', 'White', 'Yellow', 'Pink', 'Navy'].map((col) => {
                  const hex = getColorHex(col);
                  const isSelected = (formData.colors || []).some(c => c.toLowerCase() === col.toLowerCase());
                  const isWhite = col.toLowerCase() === 'white' || hex === '#ffffff';

                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => handleToggleColor(col)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-primary/10 border-primary text-foreground font-bold shadow-xs'
                          : 'bg-background hover:bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full border shrink-0 ${isWhite ? 'border-gray-400' : 'border-black/20'}`}
                        style={{ backgroundColor: hex }}
                      />
                      <span>{col}</span>
                      {isSelected && <span className="text-primary font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* DEDICATED COLOR ADDING OPTION (Color Picker + Name Input) */}
              <div className="p-3 bg-muted/30 border border-border/80 rounded-xl max-w-lg space-y-2">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <Palette size={13} className="text-primary" />
                  Custom Color / Finish Adder:
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-2 py-1">
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="w-7 h-7 rounded border-0 p-0 cursor-pointer bg-transparent"
                      title="Choose custom shade"
                    />
                    <span className="text-[10px] font-mono text-muted-foreground">{customColorHex}</span>
                  </div>

                  <input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomColor(e); }}
                    placeholder="Color Name (e.g. Honey Walnut, Crimson)..."
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />

                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="px-3.5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    + Add Color
                  </button>
                </div>
              </div>

              {/* Active color tags */}
              {formData.colors && formData.colors.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.colors.map((c) => {
                    const hex = getColorHex(c);
                    return (
                      <span
                        key={c}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-background border border-border rounded-lg text-xs font-bold text-foreground"
                      >
                        <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: hex }} />
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(c)}
                          className="hover:text-destructive text-muted-foreground ml-1 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Card 4: FLIPKART & AMAZON VARIANT PRICING MATRIX TABLE */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-border pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <DollarSign className="text-primary" size={18} />
                  Step 2: Variant Pricing Matrix (Individual Variant Prices)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Flipkart & Amazon style: Configure exact selling price, list price (MRP), and stock for each combination
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyBasePriceToAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy size={13} />
                  Apply Base Price to All
                </button>
                <button
                  type="button"
                  onClick={handleApplyBedExactPrices}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={13} />
                  Set Exact Bed Catalog Prices (₹14k, ₹19k, ₹17k, ₹24k)
                </button>
              </div>
            </div>

            {formData.variants && formData.variants.length > 0 ? (
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-bold">
                    <tr>
                      <th className="py-3 px-4">Variant (Size / Color)</th>
                      <th className="py-3 px-4">Selling Price (₹)</th>
                      <th className="py-3 px-4">MRP / Old Price (₹)</th>
                      <th className="py-3 px-4">Discount</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">SKU Code</th>
                      <th className="py-3 px-4 text-center">Active</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {formData.variants.map((v, idx) => {
                      const vPrice = parseFloat(v.price) || 0;
                      const vOldPrice = parseFloat(v.oldPrice) || 0;
                      const discountAmount = Math.max(0, vOldPrice - vPrice);
                      const discountPercent = vOldPrice > 0 ? Math.round((discountAmount / vOldPrice) * 100) : 0;
                      const hex = getColorHex(v.color);

                      return (
                        <tr key={idx} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 font-semibold text-foreground">
                            <div className="flex items-center gap-2">
                              <span className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: hex }} />
                              <span>{v.size || 'Standard'}</span>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-primary font-bold">{v.color || 'Default'}</span>
                            </div>
                          </td>

                          <td className="py-2 px-4">
                            <div className="relative max-w-[120px]">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                              <input
                                type="number"
                                step="1"
                                value={v.price}
                                onChange={(e) => handleUpdateVariantRow(idx, 'price', e.target.value)}
                                className="w-full pl-6 pr-2 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-foreground outline-none focus:ring-1 focus:ring-primary"
                                placeholder="14000"
                              />
                            </div>
                          </td>

                          <td className="py-2 px-4">
                            <div className="relative max-w-[120px]">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                              <input
                                type="number"
                                step="1"
                                value={v.oldPrice}
                                onChange={(e) => handleUpdateVariantRow(idx, 'oldPrice', e.target.value)}
                                className="w-full pl-6 pr-2 py-1.5 bg-background border border-border rounded-lg text-xs text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                                placeholder="16500"
                              />
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {discountPercent > 0 ? (
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {discountPercent}% OFF
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-[11px]">—</span>
                            )}
                          </td>

                          <td className="py-2 px-4">
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => handleUpdateVariantRow(idx, 'stock', e.target.value)}
                              className="w-20 px-2 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                              placeholder="25"
                            />
                          </td>

                          <td className="py-2 px-4">
                            <input
                              type="text"
                              value={v.sku || ''}
                              onChange={(e) => handleUpdateVariantRow(idx, 'sku', e.target.value)}
                              className="w-28 px-2 py-1.5 bg-background border border-border rounded-lg text-xs font-mono text-muted-foreground outline-none focus:ring-1 focus:ring-primary uppercase"
                              placeholder="SKU-001"
                            />
                          </td>

                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={v.isActive !== false}
                              onChange={(e) => handleUpdateVariantRow(idx, 'isActive', e.target.checked)}
                              className="rounded border-border text-primary focus:ring-primary cursor-pointer w-4 h-4"
                            />
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteVariantRow(idx)}
                              className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition-colors cursor-pointer"
                              title="Remove variant"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-xl">
                <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
                <p className="text-xs font-bold text-foreground">No variant combinations generated yet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add at least one Size or Color in Step 1 above to automatically generate individual variant price rows.
                </p>
              </div>
            )}
          </div>

          {/* Card 5: Shipping & Status Options */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.freeShipping}
                  onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <div>
                <span className="text-xs font-bold text-foreground block">Free Delivery</span>
                <span className="text-[11px] text-muted-foreground">Highlight free shipping badge on product view</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <div>
                <span className="text-xs font-bold text-foreground block">Active In Catalog</span>
                <span className="text-[11px] text-muted-foreground">Visible to customers in the store catalog</span>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setViewMode('list');
                resetForm();
              }}
              className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={15} /> Save & Publish Product
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    );
  }

  // ==========================================
  // CATALOG TABLE VIEW MODE
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-xs border border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center">
              <Package className="mr-3 text-primary" />
              Products Catalog
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your store inventory, variants, and pricing.</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md font-bold cursor-pointer text-sm"
          >
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <AdminStatCard 
            icon={Package} 
            title="Total Products" 
            value={products.length} 
            color="text-primary" 
            delay={0.1}
          />
          <AdminStatCard 
            icon={Activity} 
            title="Active Products" 
            value={products.filter(p => p.isActive !== false).length} 
            color="text-emerald-500" 
            delay={0.2}
          />
          <AdminStatCard 
            icon={AlertCircle} 
            title="Out of Stock" 
            value={products.filter(p => (p.count || p.stock || 0) <= 0).length} 
            color="text-rose-500" 
            delay={0.3}
          />
          <AdminStatCard 
            icon={LayersIcon} 
            title="Categories" 
            value={Math.max(0, categories.length - 1)} 
            color="text-blue-500" 
            delay={0.4}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center z-10 relative bg-muted/30 p-3 rounded-xl border border-border/50 mt-6">
          <div className="relative group w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search products by name or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground text-sm transition-all outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex items-center bg-background border border-border rounded-lg px-3 py-2">
              <Layers size={14} className="text-muted-foreground mr-2" />
              <select 
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-none text-sm text-foreground outline-none cursor-pointer pr-4"
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat} className="bg-background">{cat}</option>
                ))}
              </select>
            </div>

            <div className="relative flex items-center bg-background border border-border rounded-lg px-3 py-2">
              <Calendar size={14} className="text-muted-foreground mr-2" />
              <select 
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-none text-sm text-foreground outline-none cursor-pointer pr-4"
              >
                <option value="All Time" className="bg-background">All Time</option>
                <option value="Today" className="bg-background">Today</option>
                <option value="Last 7 Days" className="bg-background">Last 7 Days</option>
                <option value="Last 30 Days" className="bg-background">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body (Table) */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <BaseTable 
          headers={tableHeaders}
          data={paginatedProducts}
          emptyMessage="No Products Found"
          emptySubMessage="Try adjusting your search or category filters."
          renderRow={(product, index) => {
            const stock = product.count || product.stock || 0;
            const isActive = product.isActive !== false;
            const isExpanded = expandedRow === product.id;
            const v = getProductVariants(product);
            const variantCount = (product.variants && product.variants.length > 0)
              ? product.variants.length
              : (v.sizes.length * Math.max(1, v.colors.length));
            
            return (
              <React.Fragment key={product.id}>
                <tr className="border-b border-border/40 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="px-2 py-4 align-middle text-center cursor-pointer w-10" onClick={() => toggleRow(product.id)}>
                    <div className="w-6 h-6 mx-auto flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </td>
                  <td className="px-2 py-4 align-middle text-sm text-muted-foreground font-medium">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-2 py-4 align-middle">
                    <div className="w-12 h-12 rounded-lg bg-muted border border-border overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                      {getProductImage(product) ? (
                        <a data-fancybox="gallery" href={getProductImage(product)} data-caption={product.title || product.name} className="w-full h-full outline-none block bg-white">
                          <img src={getProductImage(product)} alt={product.title} className="w-full h-full object-contain p-1" />
                        </a>
                      ) : (
                        <ImageIcon size={20} className="text-muted-foreground" />
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-4 align-middle">
                    <span className="text-sm text-muted-foreground font-mono">
                      #{product.id}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="font-semibold text-foreground text-sm max-w-[220px] truncate" title={product.title || product.name}>
                      {product.title || product.name}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      {product.category || 'General'}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <span className="font-bold text-foreground text-sm">
                      ₹{(parseFloat(product.price || product.offerPrice || 0)).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      <Sparkles size={11} className="text-primary" />
                      {variantCount > 0 ? `${variantCount} Options` : 'Standard'}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                      stock <= 0 ? 'bg-rose-100 text-rose-800' :
                      stock <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {stock <= 0 ? 'Out of stock' : `${stock} in stock`}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      {isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <span className={`text-xs font-semibold ${product.freeShipping !== false ? 'text-primary' : 'text-muted-foreground'}`}>
                      {product.freeShipping !== false ? 'Free Delivery' : 'Standard'}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle text-right">
                    <BaseDropdown 
                      items={[
                        {
                          label: 'Edit Product & Variants',
                          icon: <Edit size={16} />,
                          onClick: () => handleOpenEdit(product)
                        },
                        {
                          label: isActive ? 'Deactivate' : 'Activate',
                          icon: <Power size={16} />,
                          onClick: () => handleToggleActive(product)
                        },
                        {
                          label: 'Delete',
                          icon: <Trash2 size={16} />,
                          danger: true,
                          onClick: () => handleDelete(product.id)
                        }
                      ]}
                    />
                  </td>
                </tr>

                {/* Expanded Row */}
                <AnimatePresence>
                  {isExpanded && (
                    <tr className="border-b border-border/40 bg-muted/30">
                      <td colSpan={12} className="p-0">
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden p-6 space-y-4"
                        >
                          <div>
                            <h4 className="text-xs uppercase font-bold text-muted-foreground mb-1">Description</h4>
                            <p className="text-xs text-foreground leading-relaxed">
                              {product.description || product.content || 'No description provided.'}
                            </p>
                          </div>

                          {/* Individual Variant Prices (if configured) */}
                          {product.variants && product.variants.length > 0 ? (
                            <div>
                              <h5 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                                <DollarSign size={13} className="text-primary" /> Configured Variant Pricing Matrix
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                {product.variants.map((vr, vIdx) => (
                                  <div key={vIdx} className="p-2.5 bg-background border border-border rounded-xl text-xs space-y-1">
                                    <div className="font-bold text-foreground flex items-center justify-between">
                                      <span>{vr.size} • {vr.color}</span>
                                      <span className="text-emerald-700 font-extrabold">₹{parseFloat(vr.price || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground flex justify-between">
                                      <span>MRP: ₹{parseFloat(vr.oldPrice || 0).toLocaleString('en-IN')}</span>
                                      <span>Stock: {vr.stock}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-6 pt-2">
                              {v.sizes.length > 0 && (
                                <div>
                                  <span className="text-[11px] font-bold text-muted-foreground block mb-1">Sizes:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {v.sizes.map(s => (
                                      <span key={s} className="px-2 py-0.5 bg-background border border-border rounded text-[11px] font-bold">
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {v.colors.length > 0 && (
                                <div>
                                  <span className="text-[11px] font-bold text-muted-foreground block mb-1">Colors / Finishes:</span>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {v.colors.map(c => (
                                      <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 bg-background border border-border rounded text-[11px] font-medium">
                                        <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: getColorHex(c) }} />
                                        {c}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            );
          }}
        />

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold px-3 py-1 bg-primary text-primary-foreground rounded-md">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default AdminProducts;
