import React, { useState, useEffect } from 'react';
import AdminLayout from '../../component/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Truck, CheckCircle, Clock, 
  MapPin, User, Package, Navigation, 
  AlertCircle, ChevronRight, ChevronLeft, Layers, Image as ImageIcon
} from 'lucide-react';
import { deliveryAPI, ordersAPI } from '../../utils/api';
import { BaseTable } from '../../components/shadcn-custom/BaseTable';
import { BaseDropdown } from '../../components/shadcn-custom/BaseDropdown';
import { useSearchParams } from 'react-router-dom';

function AdminShipped() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage] = useState(25);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    setSearchParams(prev => {
      if (currentPage === 1) prev.delete('page');
      else prev.set('page', currentPage);
      return prev;
    }, { replace: true });
  }, [currentPage, setSearchParams]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      
      let allOrders = [];
      try {
        const response = await ordersAPI.getAll();
        allOrders = response.data || [];
      } catch (e) {
        console.warn('API fetch failed');
      }
      
      let localOrders = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      } catch (e) {
        console.warn('Local fetch failed');
      }

      // Merge
      const mergedMap = new Map();
      allOrders.forEach(o => { if (o.id) mergedMap.set(o.id.toString(), o); });
      localOrders.forEach(o => { if (o.id) mergedMap.set(o.id.toString(), o); });
      const combinedOrders = Array.from(mergedMap.values());

      // Filter to only shipped items (not delivered)
      const deliveryOrders = combinedOrders
        .filter(order => ['shipped', 'in_transit', 'out_for_delivery'].includes(order.status))
        .map(order => ({
          id: order.id,
          order_id: order.id,
          customer_name: order.customer_name,
          shipping_address: order.shipping_address,
          status: order.status === 'delivered' ? 'delivered' : 'in_transit',
          tracking_number: order.tracking_number || `TRK${order.id}`,
          estimated_delivery: order.estimated_delivery,
          created_at: order.created_at,
          items: order.items || []
        }));
      
      // Sort newest first
      deliveryOrders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setDeliveries(deliveryOrders);
      
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      await deliveryAPI.updateStatus(deliveryId, newStatus);
      fetchDeliveries();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      // Fallback
      const localOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      const updated = localOrders.map(o => o.id === deliveryId ? { ...o, status: newStatus === 'in_transit' ? 'shipped' : newStatus } : o);
      localStorage.setItem('adminOrders', JSON.stringify(updated));
      fetchDeliveries();
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      (delivery.tracking_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (delivery.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (delivery.order_id?.toString() || "").includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || delivery.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedDeliveries = filteredDeliveries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      in_transit: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      out_for_delivery: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      failed: 'bg-destructive/10 text-destructive dark:text-red-400 border-destructive/30'
    };
    return styles[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/30';
  };

  const tableHeaders = [
    { label: '#' },
    { label: 'Tracking & Order' },
    { label: 'Customer Destination' },
    { label: 'Shipped Items' },
    { label: 'Status' },
    { label: 'Update', className: 'text-center' }
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
                  <Truck className="mr-3 text-primary" />
                  Shipped Orders
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Track dispatched orders and update their transit progress</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center z-10 relative bg-muted/30 p-3 rounded-xl border border-border/50">
              <div className="relative group w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search tracking #, customer or order ID..."
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
                    <option value="all">All Shipped</option>
                    <option value="shipped">Shipped</option>
                    <option value="in_transit">In Transit</option>
                    <option value="out_for_delivery">Out for Delivery</option>
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
              data={paginatedDeliveries}
              emptyMessage="No shipments found."
              emptySubMessage="Adjust your search or wait for orders to be shipped."
              renderRow={(delivery, i) => (
                <tr key={delivery.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-6 align-middle text-sm text-muted-foreground font-medium">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </td>
                  
                  {/* Tracking & Order */}
                  <td className="px-2 py-6 align-middle">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Navigation size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{delivery.tracking_number}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5 flex items-center">
                          <Package size={10} className="mr-1" /> Order #{delivery.order_id}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Customer Destination */}
                  <td className="px-2 py-6 align-middle max-w-[200px]">
                    <p className="font-semibold text-foreground text-sm flex items-center">
                      <User size={12} className="mr-1 text-muted-foreground" /> {delivery.customer_name || 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex items-start">
                      <MapPin size={12} className="mr-1 mt-0.5 shrink-0" /> {delivery.shipping_address || 'No address provided'}
                    </p>
                  </td>
                  
                  {/* Shipped Items (Products) */}
                  <td className="px-2 py-6 align-middle">
                    {delivery.items && delivery.items.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {delivery.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center shrink-0">
                              {item.product_image ? (
                                <img src={item.product_image} alt={item.product_name} className="w-full h-full object-contain p-0.5" />
                              ) : (
                                <ImageIcon size={12} className="text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground line-clamp-1">{item.product_name}</p>
                              <p className="text-[10px] text-muted-foreground font-medium">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No item details</p>
                    )}
                  </td>
                  
                  {/* Status */}
                  <td className="px-2 py-6 align-middle">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(delivery.status)}`}>
                      {delivery.status?.replace('_', ' ')}
                    </span>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-4 py-6 align-middle text-center flex justify-center">
                    <BaseDropdown 
                      label="Update"
                      items={[
                        { 
                          label: 'In Transit', 
                          onClick: () => handleStatusUpdate(delivery.id, 'in_transit'),
                          icon: <Truck size={14} className="mr-2" />
                        },
                        { 
                          label: 'Out for Delivery', 
                          onClick: () => handleStatusUpdate(delivery.id, 'out_for_delivery'),
                          icon: <Navigation size={14} className="mr-2" />
                        },
                        { type: 'separator' },
                        { 
                          label: 'Mark Delivered', 
                          onClick: () => handleStatusUpdate(delivery.id, 'delivered'),
                          icon: <CheckCircle size={14} className="mr-2 text-emerald-500" />
                        },
                        { 
                          label: 'Mark Failed', 
                          onClick: () => handleStatusUpdate(delivery.id, 'failed'),
                          icon: <AlertCircle size={14} className="mr-2 text-destructive" />
                        }
                      ]}
                    />
                  </td>
                </tr>
              )}
            />
          </div>

          {!loading && filteredDeliveries.length > 0 && (
            <div className="p-4 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground font-medium">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDeliveries.length)} of {filteredDeliveries.length} shipments
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
    </AdminLayout>
  );
}

export default AdminShipped;
