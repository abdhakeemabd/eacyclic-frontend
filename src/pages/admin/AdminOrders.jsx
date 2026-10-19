import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Eye, Truck, 
  Calendar, User, Mail, Phone, MapPin, 
  ShoppingBag, CreditCard, X, Package, Layers,
  ChevronLeft, ChevronRight, ChevronDown, Clock, CheckCircle, XCircle, Trash2,
  RefreshCw, Filter, ArrowUpRight, CheckCircle2, AlertCircle
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
        'Yes, Update',
        'bg-primary text-primary-foreground'
      );
      
      if (result.isConfirmed) {
        try {
          await ordersAPI.updateStatus(orderId, newStatus);
          showSuccess('Status Updated', `Order #${orderId} marked as ${newStatus}`);
          fetchOrders();
        } catch (error) {
          showError('Update Failed', 'Failed to update order status');
        }
      }
    }, 10);
  };

  const handleDeleteOrder = (orderId) => {
    setTimeout(async () => {
      const result = await showConfirm(
        'Delete Order', 
        'Are you sure you want to permanently delete this order record?', 
        'Yes, Delete',
        'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
      );
      
      if (result.isConfirmed) {
        try {
          await ordersAPI.delete(orderId);
          showSuccess('Order Deleted', 'Order has been permanently removed.');
          fetchOrders();
        } catch (error) {
          showError('Delete Failed', 'Failed to delete order record');
        }
      }
    }, 10);
  };

  const viewOrderDetails = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Status Filter Counts
  const statusCounts = useMemo(() => {
    const counts = { all: orders.length, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach(o => {
      const s = (o.status || '').toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [orders]);

  // Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const isExcludedStatus = ['shipped', 'delivered'].includes(order.status?.toLowerCase());
      const matchesSearch = 
        (order.id || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_email || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' ? !isExcludedStatus : (order.status?.toLowerCase() === filterStatus.toLowerCase());
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Truck size={12} /> Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
            <XCircle size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-muted text-muted-foreground border border-border">
            {status}
          </span>
        );
    }
  };

  const tableHeaders = [
    { label: '', className: 'w-10 px-0 text-center' },
    { label: '#' },
    { label: 'Order ID' },
    { label: 'Customer' },
    { label: 'Ordered Items' },
    { label: 'Total Amount' },
    { label: 'Status' },
    { label: 'Order Date' },
    { label: 'Actions', className: 'text-right' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-xs border border-border space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center">
              <ShoppingBag className="mr-3 text-primary" />
              Order Management
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Review incoming purchases, customer shipping details, and fulfillment statuses.</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-all cursor-pointer self-start md:self-auto border border-border"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* Stats Grid */}
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
            icon={Package} 
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

        {/* Filter Tabs & Search Controls */}
        <div className="space-y-3 pt-2">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
            {[
              { id: 'all', label: 'Active Pipeline', count: filteredOrders.length },
              { id: 'pending', label: 'Pending', count: statusCounts.pending },
              { id: 'processing', label: 'Processing', count: statusCounts.processing },
              { id: 'shipped', label: 'Shipped', count: statusCounts.shipped },
              { id: 'delivered', label: 'Delivered', count: statusCounts.delivered },
              { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled }
            ].map(tab => {
              const isActive = filterStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setFilterStatus(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                    isActive 
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs' 
                      : 'bg-background hover:bg-muted text-muted-foreground border-border'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative group w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search by ID, name, email or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-8 py-2 bg-background border border-border rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <span className="text-xs text-muted-foreground self-end sm:self-auto font-medium">
              Showing {paginatedOrders.length} of {filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'}
            </span>
          </div>

        </div>

      </div>

      {/* Orders Table Card */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <BaseTable 
          headers={tableHeaders} 
          isLoading={loading} 
          skeletonCount={5}
          data={paginatedOrders}
          emptyMessage="No orders found."
          emptySubMessage="Try adjusting your status filter or search query."
          renderRow={(order, i) => {
            const isExpanded = expandedRow === order.id;
            const initials = (order.customer_name || 'U').substring(0, 2).toUpperCase();

            return (
              <React.Fragment key={order.id}>
                <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-2 py-4 align-middle text-center cursor-pointer w-10" onClick={() => toggleRow(order.id)}>
                    <div className="w-6 h-6 mx-auto flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </td>

                  <td className="px-3 py-4 align-middle text-xs text-muted-foreground font-medium">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </td>

                  <td className="px-3 py-4 align-middle">
                    <span 
                      onClick={() => viewOrderDetails(order.id)}
                      className="font-bold text-foreground hover:text-primary font-mono text-xs cursor-pointer hover:underline"
                    >
                      #{order.id}
                    </span>
                  </td>

                  <td className="px-3 py-4 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-xs leading-tight">{order.customer_name || 'Guest Customer'}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{order.customer_phone || order.customer_email || 'No contact info'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-4 align-middle">
                    <div className="max-w-[240px]">
                      <p className="text-xs text-foreground font-medium truncate" title={order.items?.map(item => item.product_name).join(', ')}>
                        {order.items && order.items.length > 0 
                          ? order.items.map(item => `${item.product_name} (x${item.quantity})`).join(', ') 
                          : 'No items'}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} Total Quantity
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-4 align-middle">
                    <span className="font-black text-foreground text-sm">
                      ₹{Number(order.total || 0).toLocaleString('en-IN')}
                    </span>
                  </td>

                  <td className="px-3 py-4 align-middle">
                    {getStatusBadge(order.status)}
                  </td>

                  <td className="px-3 py-4 align-middle text-xs text-muted-foreground">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                  </td>

                  <td className="px-4 py-4 align-middle text-right">
                    <BaseDropdown 
                      label="Actions"
                      items={[
                        { 
                          label: 'View Order Details', 
                          onClick: () => viewOrderDetails(order.id),
                          icon: <Eye size={14} className="mr-2 text-primary" />
                        },
                        { type: 'separator' },
                        { 
                          label: 'Mark Pending', 
                          onClick: () => handleStatusUpdate(order.id, 'pending'),
                          icon: <Clock size={14} className="mr-2 text-amber-500" />
                        },
                        { 
                          label: 'Mark Processing', 
                          onClick: () => handleStatusUpdate(order.id, 'processing'),
                          icon: <Package size={14} className="mr-2 text-blue-500" />
                        },
                        { 
                          label: 'Mark Shipped', 
                          onClick: () => handleStatusUpdate(order.id, 'shipped'),
                          icon: <Truck size={14} className="mr-2 text-purple-500" />
                        },
                        { 
                          label: 'Mark Delivered', 
                          onClick: () => handleStatusUpdate(order.id, 'delivered'),
                          icon: <CheckCircle size={14} className="mr-2 text-emerald-500" />
                        },
                        { type: 'separator' },
                        { 
                          label: 'Cancel Order', 
                          onClick: () => handleStatusUpdate(order.id, 'cancelled'),
                          icon: <XCircle size={14} className="mr-2 text-rose-500" />
                        },
                        { 
                          label: 'Delete Order Record', 
                          onClick: () => handleDeleteOrder(order.id),
                          icon: <Trash2 size={14} className="mr-2 text-destructive" />,
                          danger: true
                        }
                      ]}
                    />
                  </td>
                </tr>

                {/* Expanded Row Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <tr className="border-b border-border/40 bg-muted/20">
                      <td colSpan={9} className="p-0">
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden p-6 space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border/70 rounded-2xl p-5 shadow-xs">
                            
                            {/* Shipping Details */}
                            <div>
                              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <MapPin size={13} className="text-primary" /> Delivery Destination
                              </h4>
                              <p className="font-bold text-foreground text-sm">{order.customer_name}</p>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {order.shipping_address || 'No physical delivery address specified.'}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                                {order.customer_phone && (
                                  <a href={`tel:${order.customer_phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                                    <Phone size={12} /> {order.customer_phone}
                                  </a>
                                )}
                                {order.customer_email && (
                                  <a href={`mailto:${order.customer_email}`} className="inline-flex items-center gap-1 text-muted-foreground hover:underline">
                                    <Mail size={12} /> {order.customer_email}
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Line Items Breakdown */}
                            <div>
                              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Package size={13} className="text-primary" /> Items in this Order ({order.items?.length || 0})
                              </h4>
                              <ul className="space-y-2.5">
                                {order.items?.map((item, idx) => (
                                  <li key={idx} className="flex justify-between items-start border-b border-border/40 pb-2 last:border-0 text-xs">
                                    <div>
                                      <span className="font-semibold text-foreground">{item.product_name}</span>
                                      <span className="text-muted-foreground ml-1.5 font-bold">× {item.quantity}</span>
                                      {(item.selected_size || item.selected_color) && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                          {item.selected_size && (
                                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                                              Size: {item.selected_size}
                                            </span>
                                          )}
                                          {item.selected_color && (
                                            <span className="text-[10px] bg-muted border border-border text-foreground font-medium px-2 py-0.5 rounded">
                                              Color: {item.selected_color}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <span className="font-bold text-foreground">
                                      ₹{Number(item.price * item.quantity || 0).toLocaleString('en-IN')}
                                    </span>
                                  </li>
                                ))}
                              </ul>
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

        {/* Pagination Footer */}
        {!loading && filteredOrders.length > 0 && (
          <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground font-medium">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={15} />
              </button>
              
              <span className="text-xs font-bold px-3 py-1 bg-primary text-primary-foreground rounded-lg">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default AdminOrders;
