import React, { useState, useMemo } from 'react';
import AdminLayout from '../../component/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Search, Image as ImageIcon, 
  X, Package, Tag, Layers, DollarSign, Database,
  Calendar, ChevronLeft, ChevronRight, Power, ChevronDown
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { BaseTable } from '../../components/shadcn-custom/BaseTable';
import { BaseDropdown } from '../../components/shadcn-custom/BaseDropdown';
import { ReadMoreText } from '../../components/common/ReadMoreText';
import Swal from 'sweetalert2';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import { useSearchParams } from 'react-router-dom';

function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct: removeProduct } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  
  // Pagination State
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  React.useEffect(() => {
    setSearchParams(prev => {
      if (currentPage === 1) prev.delete('page');
      else prev.set('page', currentPage);
      return prev;
    }, { replace: true });
  }, [currentPage, setSearchParams]);

  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [expandedRow, setExpandedRow] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image_url: '',
    discount: 0,
    imageFile: null,
    isActive: true
  });
  const [imagePreview, setImagePreview] = useState('');

  React.useEffect(() => {
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
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
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
    const file = e.target.files[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setFormData({...formData, imageFile: file, image_url: base64});
      setImagePreview(base64);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        name: formData.title,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image: formData.image_url, // Maps the Base64 image to the 'image' key expected by the frontend UI
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        Swal.fire({
          icon: 'success',
          title: 'Updated Successfully',
          text: 'The product details have been saved.',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-2xl' }
        });
      } else {
        await addProduct(payload);
        Swal.fire({
          icon: 'success',
          title: 'Product Created',
          text: 'New product has been successfully added to your catalog.',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-2xl' }
        });
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong while saving the product!',
        customClass: { popup: 'rounded-2xl' }
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you absolutely sure?',
      text: "This will permanently delete the product from the catalog.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      customClass: { popup: 'rounded-2xl' }
    });

    if (result.isConfirmed) {
      try {
        await removeProduct(id);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The product has been removed.',
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-2xl' }
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire('Error', 'Failed to delete the product.', 'error');
      }
    }
  };

  const handleToggleActive = async (product) => {
    try {
      const updatedStatus = product.isActive === false ? true : false;
      await updateProduct(product.id, { isActive: updatedStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || product.name,
      description: product.description || product.content,
      price: product.price || 0,
      category: product.category || '',
      stock: product.count || product.stock || 0,
      image_url: product.image_url || product.image || (product.gallery && product.gallery[0]) || '',
      discount: product.offer ? parseInt(product.offer) : 0,
      imageFile: null,
      isActive: product.isActive !== false
    });
    setImagePreview(product.image_url || product.image || (product.gallery && product.gallery[0]) || '');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image_url: '',
      discount: 0,
      imageFile: null,
      isActive: true
    });
    setImagePreview('');
    setEditingProduct(null);
  };

  const getProductImage = (product) => {
    return product.image_url || (product.gallery && product.gallery[0]) || product.image || null;
  };

  const tableHeaders = [
    { label: '', className: 'w-10 px-0 text-center' },
    { label: '#' },
    { label: 'Image' },
    { label: 'ID' },
    { label: 'Name' },
    { label: 'Category' },
    { label: 'Price' },
    { label: 'Offer Price' },
    { label: 'Quantity' },
    { label: 'Status' },
    { label: 'Added Date' },
    { label: 'Action', className: 'text-center' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 px-4 md:px-8 py-6 w-full max-w-[1600px] mx-auto">
        {/* Main Card Container */}
        <div className="bg-card text-card-foreground rounded-3xl shadow-md border border-border overflow-hidden">
          
          {/* Card Header & Filters */}
          <div className="p-6 border-b border-border space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center">
                  <Package className="mr-3 text-primary" />
                  Products Catalog
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Manage your store inventory, items, and pricing.</p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md font-bold cursor-pointer text-sm"
              >
                <Plus size={18} />
                <span>Add New Product</span>
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center z-10 relative bg-muted/30 p-3 rounded-xl border border-border/50">
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
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-background">{cat}</option>
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
          <div className="p-0">
        <BaseTable 
          headers={tableHeaders}
          data={paginatedProducts}
          emptyMessage="No Products Found"
          emptySubMessage="Try adjusting your search or category filters."
          renderRow={(product, index) => {
            const stock = product.count || product.stock || 0;
            const isActive = product.isActive !== false; // Default to true if undefined
            const isExpanded = expandedRow === product.id;
            
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
                    <span className="text-sm text-muted-foreground">
                      #{product.id}
                    </span>
                  </td>
                  <td className="px-2 py-4 align-middle min-w-[100px] max-w-[200px] whitespace-normal">
                    <div className="text-foreground text-sm font-medium line-clamp-3 leading-tight">{product.title || product.name}</div>
                  </td>
                  <td className="px-2 py-4 align-middle">
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {product.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-2 py-4 align-middle">
                    <p className="font-medium text-sm text-muted-foreground">
                      ₹{product.price || product.oldPrice || 0}
                    </p>
                  </td>
                  <td className="px-2 py-4 align-middle">
                    <p className="font-medium text-sm text-primary">
                      ₹{product.offerPrice || product.price || 0}
                    </p>
                  </td>
                  <td className="px-2 py-4 align-middle">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm text-foreground">{stock}</span>
                      <span className={`text-[10px] font-medium ${
                        stock > 20 ? 'text-green-600 dark:text-green-400' :
                        stock > 0 ? 'text-amber-600 dark:text-amber-400' :
                        'text-destructive'
                      }`}>
                        {stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-4 align-middle">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isActive ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30' : 'bg-destructive/10 text-destructive dark:text-red-400 border-destructive/30'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-2 py-4 align-middle">
                    <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {new Date(product.id > 1000000000 ? parseInt(product.id) : '2024-01-01').toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-2 py-4 align-middle text-center flex justify-center">
                    <BaseDropdown 
                      label="Actions"
                      items={[
                        {
                          label: "Update",
                          icon: <Edit size={16} />,
                          onClick: () => handleEdit(product)
                        },
                        {
                          label: isActive ? "Deactivate" : "Activate",
                          icon: <Power size={16} />,
                          onClick: () => handleToggleActive(product)
                        },
                        { separator: true },
                        {
                          label: "Delete",
                          icon: <Trash2 size={16} />,
                          danger: true,
                          onClick: () => handleDelete(product.id)
                        }
                      ]}
                    />
                  </td>
                </tr>
                <AnimatePresence>
                  {isExpanded && (
                    <tr className="border-b border-border/40 bg-muted/30">
                      <td colSpan={12} className="p-0">
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6">
                            <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                              <Package size={16} className="text-primary" />
                              Product Description
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {product.description || product.content || 'No description available for this product.'}
                            </p>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            );
          }}
        />
        </div>

          {/* Card Footer (Pagination) */}
          <div className="p-4 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center text-sm text-muted-foreground">
              Show
              <select 
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="mx-2 bg-background border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={75}>75</option>
                <option value={100}>100</option>
              </select>
              entries
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNumber = idx + 1;
                if (
                  pageNumber === 1 || 
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                        currentPage === pageNumber
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber} className="text-muted-foreground">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none"
              >
                <div className="bg-card text-card-foreground rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col border border-border">
                  <div className="p-6 flex items-center justify-between border-b border-border">
                    <div>
                      <h2 className="text-2xl font-black text-foreground flex items-center">
                        <Package className="mr-3 text-primary" />
                        {editingProduct ? 'Update Product' : 'Add New Product'}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">Fill in the details below to save the product</p>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 rounded-full bg-muted text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Product Name</label>
                        <div className="relative group">
                          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                          <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground transition-all outline-none"
                            placeholder="e.g. Premium Cotton T-Shirt"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Description</label>
                        <textarea
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground transition-all outline-none min-h-[100px]"
                          placeholder="Tell us about this product..."
                        />
                      </div>

                      <div>
                        <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Price (₹)</label>
                        <div className="relative group">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground transition-all outline-none"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Initial Stock</label>
                        <div className="relative group">
                          <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                          <input
                            type="number"
                            required
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground transition-all outline-none"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Category</label>
                        <div className="relative group">
                          <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                          <input
                            type="text"
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground transition-all outline-none"
                            placeholder="Electronics, Apparel..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Discount (%)</label>
                        <div className="relative group">
                          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" size={18} />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground transition-all outline-none"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Product Media</label>
                        <div className="flex items-center space-x-6">
                          <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
                            {imagePreview ? (
                              <img src={imagePreview} alt="Preview" className="w-full h-full object-contain bg-white p-1" />
                            ) : (
                              <ImageIcon className="text-muted-foreground" size={24} />
                            )}
                          </div>
                          <div className="flex-1">
                            <label className="inline-flex items-center px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-bold cursor-pointer hover:bg-secondary/80 transition-colors">
                              <Plus size={18} className="mr-2" />
                              Upload Image
                              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                            <p className="text-[10px] text-muted-foreground mt-2">Max size: 5MB. Formats: JPG, PNG, WEBP</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-6 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md cursor-pointer"
                      >
                        {editingProduct ? 'Save Changes' : 'Create Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}

export default AdminProducts;
