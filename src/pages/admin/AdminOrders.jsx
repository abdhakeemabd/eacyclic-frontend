import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Eye, Truck, 
  Calendar, User, Mail, Phone, MapPin, 
  ShoppingBag, CreditCard, X, Package, Layers,
  ChevronLeft, ChevronRight, ChevronDown, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { ordersAPI } from '../../utils/api';
import { BaseTable } from '../../components/shadcn-custom/BaseTable';
import { BaseDropdown } from '../../components/shadcn-custom/BaseDropdown';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AdminStatCard from '../../component/AdminStatCard';
import { showConfirm, showSuccess, showError } from '../../utils/swalUtils';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage] = useState(25);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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
      
      // Sort by newest first
      apiOrders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      
      setOrders(apiOrders);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    setTimeout(async () => {
      const result = await showConfirm(
        'Update Order Status', 
        `Are you sure you want to mark this order as ${newStatus}?`, 
        'Yes, Update'
      );
      
      if (result.isConfirmed) {
        try {
          await ordersAPI.updateStatus(orderId, newStatus);
          showSuccess('Status Updated', `Order marked as ${newStatus}`);
          fetchOrders();
        } catch (error) {
          showError('Update Failed', 'Failed to update order status');
        }
      }
    }, 10);
  };

  const viewOrderDetails = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const filteredOrders = orders.filter(order => {
    const isExcludedStatus = ['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(order.status);
    const matchesSearch = 
      (order.id?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ? !isExcludedStatus : order.status === filterStatus;
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
    <>
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

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminStatCard 
                icon={ShoppingBag} 
                title="Total Orders" 
                value={orders.length} 
                color="text-primary" 
                delay={0.1}
              />
              <AdminStatCard 
                icon={Clock} 
                title="Pending Orders" 
                value={orders.filter(o => o.status === 'pending').length} 
                color="text-amber-500" 
                delay={0.2}
              />
              <AdminStatCard 
                icon={Layers} 
                title="Processing" 
                value={orders.filter(o => o.status === 'processing').length} 
                color="text-blue-500" 
                delay={0.3}
              />
              <AdminStatCard 
                icon={CreditCard} 
                title="Total Revenue" 
                value={orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)} 
                color="text-emerald-500" 
                delay={0.4}
              />
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
                      <p className="font-black text-foreground text-sm">₹{Number(order.total || 0).toFixed(2)}</p>
                    </td>
                    <td className="px-2 py-4 align-middle">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-2 py-4 align-middle">
                      <div className="flex items-center text-xs font-medium text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
                            label: 'Mark Pending', 
                            onClick: () => handleStatusUpdate(order.id, 'pending'),
                            icon: <Clock size={14} className="mr-2" />
                          },
                          { 
                            label: 'Mark Processing', 
                            onClick: () => handleStatusUpdate(order.id, 'processing'),
                            icon: <Package size={14} className="mr-2" />
                          },
                          { 
                            label: 'Mark Shipped', 
                            onClick: () => handleStatusUpdate(order.id, 'shipped'),
                            icon: <Truck size={14} className="mr-2" />
                          },
                          { 
                            label: 'Mark Delivered', 
                            onClick: () => handleStatusUpdate(order.id, 'delivered'),
                            icon: <CheckCircle size={14} className="mr-2" />
                          },
                          { type: 'separator' },
                          { 
                            label: 'Cancel Order', 
                            onClick: () => handleStatusUpdate(order.id, 'cancelled'),
                            icon: <XCircle size={14} className="mr-2 text-red-500" />,
                            className: 'text-red-600 hover:bg-red-50'
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
                                        <span className="font-bold text-foreground">₹{Number(item.price * item.quantity || 0).toFixed(2)}</span>
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
      </div>
    </>
  );
}

export default AdminOrders;
