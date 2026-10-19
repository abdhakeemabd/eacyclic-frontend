import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Save, Copy, RefreshCw, Upload, Sparkles, Palette,
  Package, Tag, Layers, DollarSign, Database, Image as ImageIcon,
  X, Check, Trash2, CheckCircle2, AlertCircle, Eye, Truck,
  HelpCircle, ChevronRight, Sliders, ShieldCheck, ArrowUpRight,
  Plus, CheckCheck, Percent, Box, ExternalLink
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { showSuccess, showError, showConfirm } from '../../utils/swalUtils';
import { 
  getColorHex, getProductVariants, 
  DEFAULT_CLOTHING_SIZES, DEFAULT_CLOTHING_COLORS,
  BED_SIZES, BED_FINISHES, CHAIR_SIZES, CHAIR_FINISHES
} from '../../utils/variantUtils';

// Standard known store categories with icons
const STORE_CATEGORIES = [
  'Furniture',
  'Fashion',
  'Perfumes',
  'Grocery',
  'Traditional Jewellery',
  'Home Decor',
  'Home Utilities',
  'Health & Wellness',
  'Kids & Toys',
  'Stationery & Art Supplies',
  'Home Appliances',
  'Hardware',
  'Soap'
];

const CATEGORY_ICONS = {
  'Furniture': '🛋️',
  'Fashion': '👗',
  'Perfumes': '✨',
  'Grocery': '🛒',
  'Traditional Jewellery': '💍',
  'Home Decor': '🏺',
  'Home Utilities': '🧰',
  'Health & Wellness': '🌿',
  'Kids & Toys': '🧸',
  'Stationery & Art Supplies': '🎨',
  'Home Appliances': '⚡',
  'Hardware': '🔩',
  'Soap': '🧼'
};

const DRAFT_STORAGE_KEY = 'eacyclic_admin_product_add_draft';

function AdminProductEditor() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const location = useLocation();
  const { products, addProduct, updateProduct, loading: productsLoading } = useProducts();

  const isEditMode = Boolean(routeId);

  // Available categories (Known + Dynamic from Products)
  const availableCategories = useMemo(() => {
    const fromProducts = products.map(p => p.category?.trim()).filter(Boolean);
    return Array.from(new Set([...STORE_CATEGORIES, ...fromProducts]));
  }, [products]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    oldPrice: '',
    category: '',
    stock: '25',
    image_url: '',
    discount: 0,
    isActive: true,
    freeShipping: true,
    gallery: [],
    sizes: [],
    colors: [],
    variants: []
  });

  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customColorInput, setCustomColorInput] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#134e35');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // 1. Load Data: Edit Mode or Create Mode (with Draft Recovery on Refresh)
  useEffect(() => {
    if (isEditMode) {
      if (products && products.length > 0) {
        const found = products.find(p => String(p.id) === String(routeId));
        if (found) {
          const v = getProductVariants(found);
          const existingSizes = found.sizes && found.sizes.length > 0 ? found.sizes : v.sizes;
          const existingColors = found.colors && found.colors.length > 0 ? found.colors : v.colors;
          const existingVariants = Array.isArray(found.variants) && found.variants.length > 0
            ? found.variants
            : buildVariantMatrix(existingSizes, existingColors, [], found.price, found.oldPrice);

          const initialGallery = found.gallery && found.gallery.length 
            ? found.gallery 
            : (found.image_url || found.image ? [found.image_url || found.image] : []);

          setFormData({
            title: found.title || found.name || '',
            description: found.description || found.content || '',
            price: found.price || found.offerPrice || '',
            oldPrice: found.oldPrice || (found.price ? Math.round(found.price * 1.2) : ''),
            category: found.category || '',
            stock: found.count || found.stock || '25',
            image_url: found.image_url || found.image || initialGallery[0] || '',
            discount: found.offer ? parseInt(found.offer) : 0,
            isActive: found.isActive !== false,
            freeShipping: found.freeShipping !== false,
            gallery: initialGallery,
            sizes: existingSizes,
            colors: existingColors,
            variants: existingVariants
          });

          setImagePreviews(initialGallery);
          setIsDataLoaded(true);
        } else if (!productsLoading) {
          showError('Product Not Found', `Product #${routeId} could not be found.`);
          navigate('/admin/products');
        }
      }
    } else {
      // Create Mode: Check if there's an in-progress draft from session (handles browser refresh gracefully)
      try {
        const savedDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          setFormData(parsed);
          setImagePreviews(parsed.gallery || []);
        }
      } catch (err) {
        console.warn('Error restoring draft:', err);
      }
      setIsDataLoaded(true);
    }
  }, [isEditMode, routeId, products, productsLoading, navigate]);

  // Save draft to sessionStorage in Create Mode so page refresh never loses inputs
  useEffect(() => {
    if (!isEditMode && isDataLoaded) {
      try {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      } catch (e) {
        // Ignore quota limits for huge base64 images
      }
    }
  }, [formData, isEditMode, isDataLoaded]);

  // Variant Matrix Builder
  function buildVariantMatrix(sizes, colors, currentVariants = [], basePriceVal = null, baseOldPriceVal = null) {
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
        const existing = (currentVariants || []).find(
          v => (v.size || 'Standard') === s && (v.color || 'Default') === c
        );

        if (existing) {
          rows.push(existing);
        } else {
          let vPrice = basePrice;
          let vOldPrice = baseOldPrice;

          const sLower = s.toLowerCase();
          const cLower = c.toLowerCase();

          // Exact 4 catalog prices for bed products from eacyclic.com/product
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
  }

  // File Handlers
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
      setFormData({ ...formData, gallery: newGallery, image_url: newGallery[0] || '' });
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
    setFormData({ ...formData, gallery: newGallery, image_url: newGallery[0] || '' });
    setImagePreviews(newGallery);
  };

  // Category Selection
  const handleSelectCategory = (cat) => {
    setFormData({ ...formData, category: cat });
    setShowCustomCategory(false);
  };

  const handleAddCustomCategory = (e) => {
    if (e) e.preventDefault();
    const val = customCategoryInput.trim();
    if (!val) return;
    setFormData({ ...formData, category: val });
    setCustomCategoryInput('');
    setShowCustomCategory(false);
  };

  // Size Actions
  const handleToggleSize = (size) => {
    const current = formData.sizes || [];
    const updatedSizes = current.includes(size)
      ? current.filter(s => s !== size)
      : [...current, size];
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

  // Color Actions
  const handleToggleColor = (color) => {
    const current = formData.colors || [];
    const exists = current.some(c => c.toLowerCase() === color.toLowerCase());
    const updatedColors = exists
      ? current.filter(c => c.toLowerCase() !== color.toLowerCase())
      : [...current, color];
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

  // Presets
  const handleApplyBedPreset = () => {
    const mergedSizes = [...new Set([...(formData.sizes || []), ...BED_SIZES])];
    const mergedColors = [...new Set([...(formData.colors || []), ...BED_FINISHES])];
    const updatedVariants = buildVariantMatrix(mergedSizes, mergedColors, formData.variants || []);
    setFormData({ ...formData, sizes: mergedSizes, colors: mergedColors, variants: updatedVariants });
  };

  const handleApplyApparelPreset = () => {
    const mergedSizes = [...new Set([...(formData.sizes || []), ...DEFAULT_CLOTHING_SIZES])];
    const mergedColors = [...new Set([...(formData.colors || []), ...DEFAULT_CLOTHING_COLORS])];
    const updatedVariants = buildVariantMatrix(mergedSizes, mergedColors, formData.variants || []);
    setFormData({ ...formData, sizes: mergedSizes, colors: mergedColors, variants: updatedVariants });
  };

  const handleApplyChairPreset = () => {
    const mergedSizes = [...new Set([...(formData.sizes || []), ...CHAIR_SIZES])];
    const mergedColors = [...new Set([...(formData.colors || []), ...CHAIR_FINISHES])];
    const updatedVariants = buildVariantMatrix(mergedSizes, mergedColors, formData.variants || []);
    setFormData({ ...formData, sizes: mergedSizes, colors: mergedColors, variants: updatedVariants });
  };

  // Matrix Row Actions
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

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.title?.trim()) {
      showError('Validation Error', 'Please enter a product title.');
      return;
    }

    if (!formData.category?.trim()) {
      showError('Validation Error', 'Please select or enter a product category.');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      showError('Validation Error', 'Please enter a valid base selling price.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.title.trim(),
        title: formData.title.trim(),
        description: formData.description || '',
        price: parseFloat(formData.price) || 0,
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : Math.round((parseFloat(formData.price) || 0) * 1.2),
        category: formData.category.trim(),
        stock: parseInt(formData.stock) || 0,
        image_url: formData.image_url || '',
        image: formData.image_url || '',
        discount: parseFloat(formData.discount) || 0,
        isActive: formData.isActive !== false,
        freeShipping: formData.freeShipping !== false,
        gallery: formData.gallery || [],
        sizes: formData.sizes || [],
        colors: formData.colors || [],
        variants: formData.variants || []
      };

      if (isEditMode) {
        await updateProduct(routeId, payload);
        showSuccess('Product Updated', 'Product details, variants, and prices have been saved successfully.');
      } else {
        await addProduct(payload);
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        showSuccess('Product Created', 'New product with individual variant prices has been saved successfully.');
      }

      navigate('/admin/products');
    } catch (err) {
      console.error('Error saving product:', err);
      showError('Save Error', 'Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Margin / Discount Calculations
  const calculatedDiscount = useMemo(() => {
    const p = parseFloat(formData.price) || 0;
    const oldP = parseFloat(formData.oldPrice) || 0;
    if (oldP > p && oldP > 0) {
      const diff = oldP - p;
      const pct = Math.round((diff / oldP) * 100);
      return { diff, pct };
    }
    return { diff: 0, pct: 0 };
  }, [formData.price, formData.oldPrice]);

  // Filtered categories for search
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return availableCategories;
    return availableCategories.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [availableCategories, categorySearch]);

  // Loading indicator for edit mode
  if (isEditMode && (!isDataLoaded || productsLoading)) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
          <RefreshCw className="w-7 h-7 text-primary animate-spin" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-bold text-foreground">Loading Product Details</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Fetching variants, categories, and prices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto pb-28 animate-fadeIn">
      
      {/* ============================================================== */}
      {/* TOP COMMAND BAR (FLOATING GLASSMORPHISM WITH STATUS & ACTIONS) */}
      {/* ============================================================== */}
      <div className="sticky top-0 z-30 bg-background/80 dark:bg-[#151823]/80 backdrop-blur-xl border-b border-border/70 py-3.5 px-4 -mx-2 sm:-mx-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all flex items-center justify-center cursor-pointer shadow-xs hover:scale-105 active:scale-95"
            title="Back to Product Catalog"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Catalog / Products</span>
              <span className="text-[11px] text-muted-foreground">/</span>
              <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                {isEditMode ? `ID #${routeId}` : 'New Product'}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                formData.isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-muted text-muted-foreground border border-border'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${formData.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                {formData.isActive ? 'Active in Store' : 'Draft / Inactive'}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-foreground tracking-tight line-clamp-1 mt-0.5">
              {formData.title ? formData.title : (isEditMode ? 'Edit Product' : 'Create New Product')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-bold transition-all cursor-pointer hover:shadow-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold transition-all shadow-md hover:shadow-emerald-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
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

      {/* ============================================================== */}
      {/* 2-COLUMN MODERN E-COMMERCE LAYOUT (SHOPIFY / STRIPE STYLE)     */}
      {/* ============================================================== */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================== */}
        {/* LEFT MAIN WORKSPACE (COL 8)                                    */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 space-y-6">

          {/* Card 1: Product Title & Overview */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-5 hover:border-border transition-colors">
            <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Package size={17} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">Product Overview</h2>
                  <p className="text-[11px] text-muted-foreground">General details that identify your item across the catalog</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase font-bold text-muted-foreground mb-1.5 flex items-center justify-between">
                  <span>Product Title / Name <span className="text-destructive">*</span></span>
                  <span className="text-[11px] font-normal text-muted-foreground">{formData.title.length}/120</span>
                </label>
                <div className="relative group">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={17} />
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm font-medium transition-all outline-none"
                    placeholder="e.g. Aakeshya Upholstered Wooden Bed (6.25 x 5 ft - Akeshya)"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-muted-foreground mb-1.5 block">
                  Product Description & Specifications
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm transition-all outline-none leading-relaxed"
                  placeholder="Describe dimensions, wood quality, warranty, fabric grade, and highlights..."
                />
              </div>
            </div>
          </div>

          {/* Card 2: Media & Gallery */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-5 hover:border-border transition-colors">
            <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <ImageIcon size={17} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">Product Media & Gallery</h2>
                  <p className="text-[11px] text-muted-foreground">Add high resolution photos to showcase variants and details</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                {imagePreviews.length} Image{imagePreviews.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Drag & Drop Style Upload Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                  <Upload size={20} />
                </div>
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Upload Images From Device
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Web URL Input Box */}
              <div className="border border-border/80 bg-background/50 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground block mb-1">Add Image by Web Link</span>
                  <p className="text-[11px] text-muted-foreground mb-3">Paste an external CDN or cloud hosted image URL</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrlInput}
                    onChange={(e) => setCustomImageUrlInput(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3.5 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* Image Preview Strip */}
            {imagePreviews && imagePreviews.length > 0 && (
              <div className="pt-2">
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`relative w-24 h-24 rounded-2xl border overflow-hidden bg-white dark:bg-gray-900 p-1 group shadow-xs transition-all hover:shadow-md ${
                        idx === 0 ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                      }`}
                    >
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-contain rounded-xl" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-destructive/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs hover:bg-destructive"
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[9px] font-black text-center bg-primary text-primary-foreground rounded-md py-0.5 shadow-xs">
                          ★ Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Variant Configuration (Flipkart & Amazon Seller Central Style) */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-6 hover:border-border transition-colors">
            
            {/* Header with Quick Presets */}
            <div className="border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Sparkles size={17} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">Step 1: Variant Attributes (Sizes & Finishes)</h2>
                  <p className="text-[11px] text-muted-foreground">Select or type custom sizes and color options to generate combinations</p>
                </div>
              </div>

              {/* Fast Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleApplyBedPreset}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={12} /> Bed Preset
                </button>
                <button
                  type="button"
                  onClick={handleApplyApparelPreset}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={12} /> Clothing S–XXL
                </button>
                <button
                  type="button"
                  onClick={handleApplyChairPreset}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={12} /> Chairs Preset
                </button>
              </div>
            </div>

            {/* Size Configuration */}
            <div className="space-y-3">
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center justify-between">
                <span>1. Dimensions / Sizes ({formData.sizes?.length || 0})</span>
                <span className="text-[11px] font-normal text-muted-foreground">Click to toggle on/off</span>
              </label>

              {/* Quick Size Chips */}
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
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs scale-[1.02]'
                          : 'bg-background hover:bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{sz}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Size Input */}
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

            {/* Color & Finish Configuration (WITH COLOR PICKER) */}
            <div className="space-y-3 pt-4 border-t border-border/60">
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center justify-between">
                <span>2. Colors & Wood Finishes ({formData.colors?.length || 0})</span>
                <span className="text-[11px] font-normal text-muted-foreground">Select or create custom shade</span>
              </label>

              {/* Quick Color Swatches */}
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

              {/* Interactive Color Adder Box */}
              <div className="p-3 bg-muted/30 border border-border rounded-xl max-w-lg space-y-2">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <Palette size={13} className="text-primary" />
                  Custom Color / Wood Finish Adder:
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
                    placeholder="Color Name (e.g. Royal Emerald, Honey Walnut)..."
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

              {/* Active Color Tags */}
              {formData.colors && formData.colors.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.colors.map((c) => {
                    const hex = getColorHex(c);
                    return (
                      <span
                        key={c}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-background border border-border rounded-lg text-xs font-bold text-foreground shadow-xs"
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
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-5 hover:border-border transition-colors">
            <div className="border-b border-border/60 pb-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2 tracking-tight">
                  <DollarSign className="text-primary" size={17} />
                  Step 2: Variant Pricing Matrix (Individual Variant Prices)
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Flipkart & Amazon style: Set individual selling price, list price (MRP), and inventory stock for each combination
                </p>
              </div>

              {/* Bulk Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyBasePriceToAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Copy size={13} /> Apply Base Price to All
                </button>
                <button
                  type="button"
                  onClick={handleApplyBedExactPrices}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles size={13} /> Bed Catalog Prices (₹14k, ₹19k, ₹17k, ₹24k)
                </button>
              </div>
            </div>

            {formData.variants && formData.variants.length > 0 ? (
              <div className="overflow-x-auto border border-border/80 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-bold tracking-wider text-[10px]">
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
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
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
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
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
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
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
                              className="w-20 px-2 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground outline-none focus:ring-1 focus:ring-primary font-medium"
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
              <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-2xl">
                <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
                <p className="text-xs font-bold text-foreground">No variant combinations generated yet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add at least one Size or Color in Step 1 above to automatically generate individual variant price rows.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* ============================================================== */}
        {/* RIGHT SIDEBAR COLUMN (COL 4): STATUS, PRICING, CATEGORY       */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 space-y-6">

          {/* Card 1: Status & Catalog Visibility */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-4 hover:border-border transition-colors">
            <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Product Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
                <div>
                  <span className="text-xs font-bold text-foreground block">Active in Store</span>
                  <span className="text-[11px] text-muted-foreground">Visible to customers in catalog</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
                <div>
                  <span className="text-xs font-bold text-foreground block flex items-center gap-1.5">
                    <Truck size={13} className="text-primary" /> Free Delivery
                  </span>
                  <span className="text-[11px] text-muted-foreground">Show free shipping tag</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.freeShipping}
                    onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Card 2: Organization & Category Selector */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-4 hover:border-border transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-primary" /> Product Category <span className="text-destructive">*</span>
              </h3>
              {formData.category && (
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Selected
                </span>
              )}
            </div>

            {/* Currently Active Category Banner */}
            {formData.category ? (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CATEGORY_ICONS[formData.category] || '📦'}</span>
                  <div>
                    <span className="text-xs font-bold text-primary block leading-none">{formData.category}</span>
                    <span className="text-[10px] text-muted-foreground">Assigned Catalog Category</span>
                  </div>
                </div>
                <CheckCircle2 size={16} className="text-primary" />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={15} /> Select a category below
              </div>
            )}

            {/* Category Search Filter */}
            <div className="relative">
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Category Pills List */}
            <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredCategories.map(cat => {
                const isSelected = formData.category.toLowerCase() === cat.toLowerCase();
                const icon = CATEGORY_ICONS[cat] || '📦';
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer border ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                        : 'bg-background hover:bg-muted text-foreground border-border/60'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{icon}</span>
                      <span>{cat}</span>
                    </span>
                    {isSelected && <Check size={13} />}
                  </button>
                );
              })}
            </div>

            {/* Custom Category Button & Input */}
            <div className="pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setShowCustomCategory(!showCustomCategory)}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold border border-dashed border-border hover:border-primary/50 text-foreground hover:bg-muted/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Custom / New Category</span>
              </button>

              {showCustomCategory && (
                <div className="flex items-center gap-2 pt-2 animate-fadeIn">
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomCategory(e); }}
                    placeholder="Enter category name..."
                    className="flex-1 px-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCategory}
                    className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Set
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Base Pricing & Profit Calculator */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-4 hover:border-border transition-colors">
            <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <DollarSign size={14} className="text-primary" /> Base Pricing & Margins
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">
                  Base Selling Price (₹) <span className="text-destructive">*</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm font-bold outline-none"
                    placeholder="14000"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">
                  Original List Price / MRP (₹)
                </label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm text-muted-foreground outline-none"
                    placeholder="16500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">
                  Base Stock Units
                </label>
                <div className="relative group">
                  <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm outline-none"
                    placeholder="25"
                  />
                </div>
              </div>

              {/* Dynamic Savings Card */}
              {calculatedDiscount.pct > 0 && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 space-y-1">
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>Customer Discount:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px]">
                      {calculatedDiscount.pct}% OFF
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex justify-between">
                    <span>Savings:</span>
                    <span className="font-semibold text-foreground">₹{calculatedDiscount.diff.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </form>

      {/* ============================================================== */}
      {/* BOTTOM ACTION BAR (STICKY DOCK ON SCROLL)                       */}
      {/* ============================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/90 dark:bg-[#151823]/90 backdrop-blur-xl border-t border-border/80 py-3 px-6 flex items-center justify-between shadow-2xl">
        <div className="text-xs text-muted-foreground hidden sm:block">
          {isEditMode ? `Editing product #${routeId}` : 'Creating new catalog product'} • All changes are checked for validity
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Cancel & Exit
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold transition-all shadow-md hover:shadow-emerald-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={15} className="animate-spin" /> Saving Product...
              </>
            ) : (
              <>
                <Save size={15} /> Save & Publish Product
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}

export default AdminProductEditor;
