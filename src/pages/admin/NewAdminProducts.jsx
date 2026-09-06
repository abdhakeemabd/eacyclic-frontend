import React, { useState, useEffect } from 'react';
import AdminLayout from '../../component/AdminLayout';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaEllipsisV } from 'react-icons/fa';
import { useProducts } from '../../context/ProductContext';

function NewAdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [imageViewer, setImageViewer] = useState({ isOpen: false, image: '', name: '' });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    oldPrice: '',
    offerPrice: '',
    offer: '',
    count: '',
    description: '',
    gallery: [],
    image: '',
    imageFile: null,
    galleryFiles: []
  });
  const [imagePreviews, setImagePreviews] = useState({
    main: '',
    gallery: []
  });


  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle main image file selection
  const handleMainImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setFormData({...formData, imageFile: file, image: base64});
      setImagePreviews({...imagePreviews, main: base64});
    }
  };

  // Handle gallery images file selection
  const handleGalleryImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const base64Promises = files.map(file => fileToBase64(file));
      const base64Images = await Promise.all(base64Promises);
      setFormData({
        ...formData, 
        galleryFiles: files,
        gallery: base64Images
      });
      setImagePreviews({...imagePreviews, gallery: base64Images});
    }
  };

  // Remove gallery image
  const removeGalleryImage = (index) => {
    const newGalleryFiles = formData.galleryFiles.filter((_, i) => i !== index);
    const newGallery = formData.gallery.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.gallery.filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      galleryFiles: newGalleryFiles,
      gallery: newGallery
    });
    setImagePreviews({...imagePreviews, gallery: newPreviews});
  };

  // Helper function to extract category from product title
  const getCategoryFromTitle = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('chair') || lowerTitle.includes('table') || lowerTitle.includes('wardrobe') || lowerTitle.includes('shelf')) {
      return 'Furniture';
    } else if (lowerTitle.includes('fan') || lowerTitle.includes('cooler') || lowerTitle.includes('mixer')) {
      return 'Appliances';
    } else if (lowerTitle.includes('tv') || lowerTitle.includes('speaker') || lowerTitle.includes('soundbar')) {
      return 'Electronics';
    } else if (lowerTitle.includes('mattress')) {
      return 'Bedding';
    } else if (lowerTitle.includes('cobra')) {
      return 'Health & Wellness';
    }
    return 'Other';
  };

  // Transform products for admin display
  const adminProducts = products.map(product => {
    // Helper to safely parse price
    const parsePrice = (value) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const cleaned = value.replace(/,/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100; // Round to 2 decimals
      }
      return 0;
    };

    return {
      id: product.id,
      name: product.title || product.name,
      category: product.category || getCategoryFromTitle(product.title || product.name || ''),
      price: parsePrice(product.offerPrice || product.price),
      oldPrice: parsePrice(product.oldPrice),
      stock: product.count || product.stock || 0,
      image: product.gallery && product.gallery[0] ? product.gallery[0] : product.image || '',
      description: product.description || product.content,
      offer: product.offer,
      content: product.content,
      gallery: product.gallery || [],
      // Keep original values for editing
      offerPrice: product.offerPrice,
      count: product.count
    };
  });

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        ...product,
        imageFile: null,
        galleryFiles: []
      });
      // Set previews for existing images
      setImagePreviews({
        main: product.image || '',
        gallery: product.gallery || []
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        price: '',
        stock: '',
        description: '',
        image: '',
        imageFile: null,
        galleryFiles: [],
        gallery: []
      });
      setImagePreviews({
        main: '',
        gallery: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      description: '',
      image: '',
      imageFile: null,
      galleryFiles: [],
      gallery: []
    });
    setImagePreviews({
      main: '',
      gallery: []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Helper to ensure integer price (store in paise/cents to avoid decimals)
    const toInteger = (value) => {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : Math.round(num);
    };

    // Transform form data to product format
    const productData = {
      title: formData.name,
      name: formData.name,
      content: formData.description,
      description: formData.description,
      offerPrice: toInteger(formData.price),
      oldPrice: formData.oldPrice ? toInteger(formData.oldPrice) : toInteger(formData.price) + 500,
      price: toInteger(formData.price),
      offer: formData.offer || '10%',
      count: parseInt(formData.stock) || 0,
      stock: parseInt(formData.stock) || 0,
      category: formData.category,
      image: formData.image,
      gallery: formData.gallery && formData.gallery.length > 0 ? formData.gallery : [formData.image],
      subDescription: formData.description,
      subContent: formData.description
    };

    if (editingProduct) {
      // Update existing product
      await updateProduct(editingProduct.id, productData);
    } else {
      // Add new product
      await addProduct(productData);
    }
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const filteredProducts = adminProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition shadow-md"
          >
            <FaPlus />
            <span>Add Product</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          onClick={() => setImageViewer({ isOpen: true, image: product.image, name: product.name })}
                          className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-80 transition"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock > 50 ? 'bg-green-100 text-green-800' :
                        product.stock > 20 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === product.id ? null : product.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition"
                        >
                          <FaEllipsisV className="text-gray-600" />
                        </button>
                        
                        {openDropdown === product.id && (
                          <>
                            {/* Backdrop to close dropdown */}
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenDropdown(null)}
                            ></div>
                            
                            {/* Dropdown Menu */}
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                              <button
                                onClick={() => {
                                  openModal(product);
                                  setOpenDropdown(null);
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition"
                              >
                                <FaEdit className="text-indigo-600" />
                                <span className="text-gray-700">Edit Product</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleDelete(product.id);
                                  setOpenDropdown(null);
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition border-t border-gray-100"
                              >
                                <FaTrash className="text-red-600" />
                                <span className="text-gray-700">Delete Product</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#03030373] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter product description"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Product Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {imagePreviews.main && (
                  <div className="mt-3">
                    <img 
                      src={imagePreviews.main} 
                      alt="Main preview" 
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gallery Images (Multiple)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImagesChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {imagePreviews.gallery.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-3">
                    {imagePreviews.gallery.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Gallery ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>


              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fancybox Image Viewer */}
      {imageViewer.isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setImageViewer({ isOpen: false, image: '', name: '' })}
        >
          {/* Close Button */}
          <button
            onClick={() => setImageViewer({ isOpen: false, image: '', name: '' })}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-all transform hover:scale-110 z-10"
          >
            <FaTimes className="text-4xl" />
          </button>
          
          {/* Product Name Overlay */}
          <div className="absolute top-4 left-4 text-white z-10">
            <h3 className="text-2xl font-bold drop-shadow-lg">{imageViewer.name}</h3>
          </div>
          
          {/* Image Container */}
          <div 
            className="relative max-w-6xl w-full h-full flex items-center justify-center animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageViewer.image}
              alt={imageViewer.name}
              className="max-w-full max-h-full object-contain shadow-2xl cursor-zoom-out"
              onClick={() => setImageViewer({ isOpen: false, image: '', name: '' })}
            />
          </div>
          
          {/* Helper Text */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-75">
            Click anywhere to close
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default NewAdminProducts;
