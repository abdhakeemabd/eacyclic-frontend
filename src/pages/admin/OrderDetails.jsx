import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, User, Phone, MapPin, Mail,
  CreditCard, Package, Truck, ArrowLeft,
  Clock, CheckCircle, XCircle, Printer, CheckCircle2,
  Calendar, ShieldCheck, ArrowUpRight
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
        'Yes, Update',
        'bg-primary text-primary-foreground'
      );
      
      if (result.isConfirmed) {
        try {
          await ordersAPI.updateStatus(orderId, newStatus);
          fetchOrderDetails();
          showSuccess('Status Updated', `Order marked as ${newStatus}`);
        } catch (error) {
          showError('Update Failed', 'Failed to update order status');
        }
      }
    }, 10);
  };

  // Order Stepper Status
  const getStepStatus = () => {
    const s = (order?.status || '').toLowerCase();
    if (s === 'cancelled') return { current: -1, text: 'Cancelled' };
    if (s === 'delivered') return { current: 3, text: 'Delivered' };
    if (s === 'shipped') return { current: 2, text: 'Shipped' };
    if (s === 'processing') return { current: 1, text: 'Processing' };
    return { current: 0, text: 'Pending' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-muted-foreground">Loading order details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 bg-card border border-border rounded-2xl max-w-xl mx-auto my-8 p-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <XCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-foreground">Order #{orderId} Not Found</h2>
        <p className="text-xs text-muted-foreground">The order details could not be retrieved from the database.</p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition shadow-xs cursor-pointer"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const stepInfo = getStepStatus();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 animate-fadeIn">
      
      {/* Top Header Card */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs hover:scale-105"
            title="Back to Orders List"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Order Management</span>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                #{order.id}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-0.5">
              Order #{order.id} Summary
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Calendar size={13} /> Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Print Order Invoice"
          >
            <Printer size={14} /> Print Invoice
          </button>

          <BaseDropdown 
            label={`Status: ${order.status?.toUpperCase()}`}
            items={[
              { 
                label: 'Mark Pending', 
                onClick: () => handleStatusUpdate('pending'),
                icon: <Clock size={14} className="mr-2 text-amber-500" />
              },
              { 
                label: 'Mark Processing', 
                onClick: () => handleStatusUpdate('processing'),
                icon: <Package size={14} className="mr-2 text-blue-500" />
              },
              { 
                label: 'Mark Shipped', 
                onClick: () => handleStatusUpdate('shipped'),
                icon: <Truck size={14} className="mr-2 text-purple-500" />
              },
              { 
                label: 'Mark Delivered', 
                onClick: () => handleStatusUpdate('delivered'),
                icon: <CheckCircle size={14} className="mr-2 text-emerald-500" />
              },
              { type: 'separator' },
              { 
                label: 'Cancel Order', 
                onClick: () => handleStatusUpdate('cancelled'),
                icon: <XCircle size={14} className="mr-2 text-rose-500" />
              }
            ]}
          />
        </div>
      </div>

      {/* Fulfillment Stepper (Visual Timeline) */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Fulfillment Timeline</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {[
            { step: 0, label: 'Order Received', desc: 'Pending confirmation', icon: Clock },
            { step: 1, label: 'Processing', desc: 'Packing in warehouse', icon: Package },
            { step: 2, label: 'Dispatched', desc: 'Out with courier', icon: Truck },
            { step: 3, label: 'Delivered', desc: 'Completed successfully', icon: CheckCircle2 }
          ].map((st, i) => {
            const isCompleted = stepInfo.current >= st.step && stepInfo.current !== -1;
            const isCurrent = stepInfo.current === st.step;
            const Icon = st.icon;

            return (
              <div 
                key={i}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent 
                    ? 'bg-primary/10 border-primary ring-1 ring-primary/20 shadow-xs'
                    : isCompleted
                      ? 'bg-muted/40 border-border/80'
                      : 'bg-muted/10 border-border/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? <Check size={14} /> : (i + 1)}
                  </div>
                  <Icon size={16} className={isCurrent ? 'text-primary' : 'text-muted-foreground'} />
                </div>
                <span className={`text-xs font-bold block ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                  {st.label}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">{st.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Items in Order) - Col 8 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 tracking-tight">
                <Package size={16} className="text-primary" />
                Purchased Line Items ({order.items?.length || 0})
              </h3>
              <span className="text-xs font-semibold text-muted-foreground">
                Total Units: {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
              </span>
            </div>

            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/20 border border-border/60 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Package size={22} className="text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm leading-snug">{item.product_name}</p>
                      
                      {/* Variant Tags */}
                      {(item.selected_size || item.selected_color) && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {item.selected_size && (
                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md">
                              Size: {item.selected_size}
                            </span>
                          )}
                          {item.selected_color && (
                            <span className="text-[10px] bg-muted border border-border text-foreground font-medium px-2 py-0.5 rounded-md">
                              Finish: {item.selected_color}
                            </span>
                          )}
                        </div>
                      )}
                      <span className="text-[11px] text-muted-foreground block mt-1">
                        Price per unit: ₹{Number(item.price || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-0 border-border/50 pt-2 sm:pt-0">
                    <span className="text-xs font-bold text-muted-foreground sm:mb-1">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-base font-black text-foreground">
                      ₹{Number(item.price * item.quantity || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}

              {(!order.items || order.items.length === 0) && (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No line items found for this order.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Customer, Shipping & Pricing) - Col 4 */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Customer Profile Card */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <User size={14} className="text-primary" /> Customer Profile
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-base shadow-xs">
                {(order.customer_name || 'G')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-foreground text-sm leading-tight">{order.customer_name || 'Guest User'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Verified Shopper</p>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 space-y-2.5 text-xs">
              {order.customer_phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-muted-foreground shrink-0" />
                  <a href={`tel:${order.customer_phone}`} className="text-primary hover:underline font-semibold">
                    {order.customer_phone}
                  </a>
                </div>
              )}
              {order.customer_email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-muted-foreground shrink-0" />
                  <a href={`mailto:${order.customer_email}`} className="text-muted-foreground hover:underline truncate">
                    {order.customer_email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" /> Delivery Address
            </h3>
            <p className="text-xs text-foreground leading-relaxed font-medium bg-muted/20 p-3 rounded-xl border border-border/60">
              {order.shipping_address || 'No physical delivery address specified for this order.'}
            </p>
          </div>

          {/* Payment Breakdown Card */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-3.5">
            <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <CreditCard size={14} className="text-primary" /> Billing Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal</span>
                <span className="font-semibold text-foreground">₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Charges</span>
                <span className="font-semibold text-foreground">
                  {Number(order.shipping_cost || 0) === 0 ? 'FREE' : `₹${Number(order.shipping_cost).toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Tax (GST)</span>
                <span className="font-semibold text-foreground">₹{Number(order.tax || 0).toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-3 border-t border-border/80 flex justify-between items-center">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Grand Total</span>
                <span className="text-xl font-black text-foreground">
                  ₹{Number(order.total || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default OrderDetails;
