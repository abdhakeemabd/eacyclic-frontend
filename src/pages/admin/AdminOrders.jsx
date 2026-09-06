import React, { useState, useEffect } from 'react';
import AdminLayout from '../../component/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Eye, Truck, 
  Calendar, User, Mail, Phone, MapPin, 
  ShoppingBag, CreditCard, X, Package, Layers,
  ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';
import { ordersAPI } from '../../utils/api';
import { BaseTable } from '../../components/shadcn-custom/BaseTable';
import { BaseDropdown } from '../../components/shadcn-custom/BaseDropdown';
import { useSearchParams } from 'react-router-dom';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage] = useState(25);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setSearchParams(prev => {
      if (currentPage === 1) prev.delete('page');
      else prev.set('page', currentPage);
      return prev;
    }, { replace: true });
  }, [currentPage, setSearchParams]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      let apiOrders = [];
      try {
        const response = await ordersAPI.getAll();
        apiOrders = response.data || [];
      } catch (e) {
        console.warn('Error fetching API orders:', e);
      }
      
      let localOrders = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      } catch (e) {
        console.warn('Error fetching local orders:', e);
      }
      
      // Merge logic: Combine localOrders and apiOrders, preferring localOrders for duplicates
      const mergedMap = new Map();
      apiOrders.forEach(o => { if (o.id) mergedMap.set(o.id.toString(), o); });
      localOrders.forEach(o => { if (o.id) mergedMap.set(o.id.toString(), o); });
      
      const allOrders = Array.from(mergedMap.values());
      // Sort by newest first
      allOrders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      
      setOrders(allOrders);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      // Fallback for demo
      const localOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      const updated = localOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      localStorage.setItem('adminOrders', JSON.stringify(updated));
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setShowModal(false);
      }
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await ordersAPI.getById(orderId);
      setSelectedOrder(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      const order = orders.find(o => o.id === orderId);
      setSelectedOrder(order);
      setShowModal(true);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.id?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      shipped: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      cancelled: 'bg-destructive/10 text-destructive dark:text-red-400 border-destructive/30'
    };
    return styles[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/30';
  };

  const tableHeaders = [
    { label: '', className: 'w-10 px-0 text-center' },
    { label: '#' },
    { label: 'Order ID' },
    { label: 'Product Name' },
    { label: 'Customer' },
    { label: 'Contact' },
    { label: 'Qty' },
    { label: 'Total' },
    { label: 'Status' },
    { label: 'Date' },
    { label: 'Action', className: 'text-center' }
  ];

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    return Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 px-4 md:px-8 py-6 w-full max-w-[1600px] mx-auto">
        <div className="bg-card text-card-foreground rounded-3xl shadow-md border border-border overflow-hidden">
          
          <div className="p-6 border-b border-border space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center">
                  <ShoppingBag className="mr-3 text-primary" />
                  Order Management
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Track and process your customer orders</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center z-10 relative bg-muted/30 p-3 rounded-xl border border-border/50">
              <div className="relative group w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search by ID, name or email..."
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
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent border-none text-sm text-foreground outline-none cursor-pointer pr-4 uppercase tracking-wider font-semibold"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-0">
            <BaseTable 
              headers={tableHeaders} 
              isLoading={loading} 
              skeletonCount={5}
              data={paginatedOrders}
              emptyMessage="No orders found."
              emptySubMessage="Adjust your search or filters."
              renderRow={(order, i) => {
                const isExpanded = expandedRow === order.id;
                return (
                <React.Fragment key={order.id}>
                  <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-2 py-4 align-middle text-center cursor-pointer w-10" onClick={() => toggleRow(order.id)}>
                      <div className="w-6 h-6 mx-auto flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                    </td>
                    <td className="px-2 py-4 align-middle text-sm text-muted-foreground font-medium">
                      {(currentPage - 1) * itemsPerPage + i + 1}
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <p className="font-bold text-foreground text-sm whitespace-nowrap">
                        {order.id?.toString().startsWith('ORD') ? `#${order.id}` : `#${String(order.id).padStart(5, '0')}`}
                      </p>
                    </td>
                    <td className="px-2 py-4 align-middle">
                      <p className="text-xs text-foreground font-medium line-clamp-2 max-w-[200px]" title={order.items?.map(i => i.product_name).join(', ')}>
                        {order.items && order.items.length > 0 
                          ? order.items.map(i => i.product_name).join(', ') 
                          : 'No items'}
                      </p>
                    </td>
                    <td className="px-2 py-4 align-middle">
                      <p className="font-semibold text-foreground text-sm">{order.customer_name || 'Guest User'}</p>
                      <p className="text-[10px] text-muted-foreground">{order.customer_email || 'No email'}</p>
                    </td>
                    <td className="px-2 py-4 align-middle">
                      <p className="text-xs text-foreground font-medium">{order.customer_phone || 'N/A'}</p>
                    </td>
                    <td className="px-2 py-4 align-middle">
                      <p className="font-bold text-foreground text-sm">
                        {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                      </p>
                    </td>
                    <td className="px-2 py-4 align-middle">
                      <p className="font-black text-foreground text-sm">₹{order.total?.toFixed(2) || 0}</p>
                    </td>
                    <td className="px-2 py-4 align-middle">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-2 py-4 align-middle">
                      <div className="flex items-center text-xs font-medium text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle text-center flex justify-center">
                      <BaseDropdown 
                        label="Actions"
                        items={[
                          { 
                            label: 'View Details', 
                            onClick: () => viewOrderDetails(order.id),
                            icon: <Eye size={14} className="mr-2" />
                          },
                          { type: 'separator' },
                          { 
                            label: 'Mark Shipped', 
                            onClick: () => handleStatusUpdate(order.id, 'shipped'),
                            icon: <Truck size={14} className="mr-2" />
                          }
                        ]}
                      />
                    </td>
                  </tr>
                  <AnimatePresence>
                    {isExpanded && (
                      <tr className="border-b border-border/40 bg-muted/30">
                        <td colSpan={11} className="p-0">
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 bg-muted/10">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                  <h4 className="font-bold text-xs mb-3 text-muted-foreground uppercase tracking-widest flex items-center">
                                    <MapPin size={14} className="mr-2" /> Delivery Address
                                  </h4>
                                  <p className="font-bold text-foreground text-sm mb-1">{order.customer_name}</p>
                                  <p className="text-sm text-muted-foreground">{order.shipping_address || 'No address provided'}</p>
                                  <p className="text-sm text-foreground font-medium mt-2 flex items-center">
                                    <Phone size={14} className="mr-2 text-muted-foreground" /> {order.customer_phone || 'N/A'}
                                  </p>
                                </div>
                                
                                <div>
                                  <h4 className="font-bold text-xs mb-3 text-muted-foreground uppercase tracking-widest flex items-center">
                                    <Package size={14} className="mr-2" /> Items Breakdown
                                  </h4>
                                  <ul className="space-y-2">
                                    {order.items?.map((item, idx) => (
                                      <li key={idx} className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0 text-sm">
                                        <span className="text-foreground">{item.product_name} <span className="text-muted-foreground">x {item.quantity}</span></span>
                                        <span className="font-bold text-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
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

          {!loading && filteredOrders.length > 0 && (
            <div className="p-4 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground font-medium">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex gap-1">
                  {getPageNumbers().map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        currentPage === number 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-foreground hover:bg-muted border border-transparent'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showModal && selectedOrder && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="fixed inset-0 bg-black/60 z-[100]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none"
              >
                <div className="bg-card rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col border border-border">
                  <div className="p-8 flex items-center justify-between bg-muted/30 border-b border-border">
                    <div>
                      <h2 className="text-2xl font-black text-foreground flex items-center">
                        <ShoppingBag className="mr-3 text-primary" />
                        Order Details
                        <span className="ml-3 text-primary">#{selectedOrder.id}</span>
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-3 rounded-2xl bg-background border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors shadow-sm"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-background">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Customer Info */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] uppercase font-black text-muted-foreground tracking-widest flex items-center">
                          <User size={14} className="mr-2" /> Customer Information
                        </h3>
                        <div className="bg-muted/30 rounded-3xl p-6 space-y-4 border border-border">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm font-bold">
                              {selectedOrder.customer_name?.[0] || 'G'}
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{selectedOrder.customer_name || 'Guest User'}</p>
                              <p className="text-xs text-muted-foreground">{selectedOrder.customer_email || 'No email provided'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="flex items-start space-x-2">
                              <Phone size={14} className="mt-1 text-muted-foreground" />
                              <span className="text-xs text-foreground font-medium">{selectedOrder.customer_phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <MapPin size={14} className="mt-1 text-muted-foreground" />
                              <span className="text-xs text-foreground font-medium line-clamp-2">{selectedOrder.shipping_address || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] uppercase font-black text-muted-foreground tracking-widest flex items-center">
                          <CreditCard size={14} className="mr-2" /> Payment Summary
                        </h3>
                        <div className="bg-muted/30 rounded-3xl p-6 space-y-3 border border-border">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-bold text-foreground">₹{selectedOrder.subtotal?.toFixed(2) || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span className="font-bold text-foreground">₹{selectedOrder.shipping_cost?.toFixed(2) || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span className="font-bold text-foreground">₹{selectedOrder.tax?.toFixed(2) || 0}</span>
                          </div>
                          <div className="border-t border-border pt-3 flex justify-between">
                            <span className="font-black text-primary">Total</span>
                            <span className="font-black text-xl text-foreground">₹{selectedOrder.total?.toFixed(2) || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] uppercase font-black text-muted-foreground tracking-widest flex items-center">
                        <ShoppingBag size={14} className="mr-2" /> Order Items ({selectedOrder.items?.length || 0})
                      </h3>
                      <div className="space-y-3">
                        {selectedOrder.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-2xl hover:bg-muted/50 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm border border-border/50">
                                <Package size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-foreground text-sm">{item.product_name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Qty: {item.quantity} × ₹{item.price}</p>
                              </div>
                            </div>
                            <span className="font-black text-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Management */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] uppercase font-black text-muted-foreground tracking-widest flex items-center">
                        <Truck size={14} className="mr-2" /> Update Order Status
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
                          const isActive = selectedOrder.status === status;
                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                              className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border
                                ${isActive 
                                  ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                                  : 'bg-muted/50 text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30'}`}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}

export default AdminOrders;
