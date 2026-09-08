import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, User, Phone, MapPin, 
  CreditCard, Package, Truck, ArrowLeft,
  Clock, CheckCircle, XCircle
} from 'lucide-react';
import { ordersAPI } from '../../utils/api';
import { BaseDropdown } from '../../components/shadcn-custom/BaseDropdown';
import { showConfirm, showSuccess, showError } from '../../utils/swalUtils';

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getById(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (newStatus) => {
    setTimeout(async () => {
      const result = await showConfirm(
        'Update Order Status', 
        `Are you sure you want to mark this order as ${newStatus}?`, 
        'Yes, Update'
      );
      
      if (result.isConfirmed) {
        try {
          await ordersAPI.updateStatus(orderId, newStatus);
          fetchOrderDetails(); // Refresh to show new status
          showSuccess('Status Updated', `Order marked as ${newStatus}`);
        } catch (error) {
          showError('Update Failed', 'Failed to update order status');
        }
      }
    }, 10);
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground">Order Not Found</h2>
          <p className="text-muted-foreground mt-2">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/orders')}
            className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            Back to Orders
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6 px-4 md:px-8 py-6 w-full max-w-[1200px] mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/orders')}
              className="p-3 rounded-2xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-3xl font-black text-foreground flex items-center">
                <ShoppingBag className="mr-3 text-primary" />
                Order Details
                <span className="ml-3 text-primary">#{order.id}</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border
              ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                order.status === 'cancelled' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                order.status === 'shipped' ? 'bg-purple-500/10 text-purple-600 border-purple-500/30' :
                order.status === 'processing' ? 'bg-blue-500/10 text-blue-600 border-blue-500/30' :
                'bg-amber-500/10 text-amber-600 border-amber-500/30'}`}
            >
              {order.status}
            </span>

            <BaseDropdown 
              label="Update Status"
              items={[
                { 
                  label: 'Mark Pending', 
                  onClick: () => handleStatusUpdate('pending'),
                  icon: <Clock size={14} className="mr-2" />
                },
                { 
                  label: 'Mark Processing', 
                  onClick: () => handleStatusUpdate('processing'),
                  icon: <Package size={14} className="mr-2" />
                },
                { 
                  label: 'Mark Shipped', 
                  onClick: () => handleStatusUpdate('shipped'),
                  icon: <Truck size={14} className="mr-2" />
                },
                { 
                  label: 'Mark Delivered', 
                  onClick: () => handleStatusUpdate('delivered'),
                  icon: <CheckCircle size={14} className="mr-2" />
                },
                { type: 'separator' },
                { 
                  label: 'Cancel Order', 
                  onClick: () => handleStatusUpdate('cancelled'),
                  icon: <XCircle size={14} className="mr-2 text-red-500" />,
                  className: 'text-red-600 hover:bg-red-50'
                }
              ]}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Customer & Payment) */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Customer Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl p-6 border border-border shadow-sm"
            >
              <h3 className="text-xs uppercase font-black text-muted-foreground tracking-widest flex items-center mb-6">
                <User size={14} className="mr-2" /> Customer Information
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm font-bold text-lg">
                    {order.customer_name?.[0] || 'G'}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">{order.customer_name || 'Guest User'}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_email || 'No email provided'}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border space-y-4">
                  <div className="flex items-start space-x-3">
                    <Phone size={16} className="mt-0.5 text-muted-foreground" />
                    <span className="text-sm text-foreground font-medium">{order.customer_phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin size={16} className="mt-0.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground font-medium leading-relaxed">{order.shipping_address || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Summary */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card rounded-3xl p-6 border border-border shadow-sm"
            >
              <h3 className="text-xs uppercase font-black text-muted-foreground tracking-widest flex items-center mb-6">
                <CreditCard size={14} className="mr-2" /> Payment Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-foreground">₹{Number(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-bold text-foreground">₹{Number(order.shipping_cost || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-bold text-foreground">₹{Number(order.tax || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-4 mt-2 flex justify-between items-center">
                  <span className="font-black text-primary uppercase tracking-widest text-xs">Total</span>
                  <span className="font-black text-2xl text-foreground">₹{Number(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Right Column (Items & Status) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Order Items */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card rounded-3xl p-6 border border-border shadow-sm"
            >
              <h3 className="text-xs uppercase font-black text-muted-foreground tracking-widest flex items-center mb-6">
                <Package size={14} className="mr-2" /> Order Items ({order.items?.length || 0})
              </h3>
              
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-muted/30 border border-border rounded-2xl hover:bg-muted/50 transition-colors">
                    <div className="hidden sm:flex w-16 h-16 shrink-0 rounded-xl bg-background items-center justify-center text-primary shadow-sm border border-border/50 overflow-hidden mt-1">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className=" w-full h-full object-cover" />
                      ) : (
                        <Package size={24} />
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="font-bold text-foreground text-base leading-snug break-words">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1.5">
                        Qty: {item.quantity} × ₹{item.price}
                      </p>
                      <p className="font-black text-foreground text-lg mt-1">
                        Total: ₹{Number(item.price * item.quantity || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {(!order.items || order.items.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No items found for this order.
                  </div>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}

export default OrderDetails;
