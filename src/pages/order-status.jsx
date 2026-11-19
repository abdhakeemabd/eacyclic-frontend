import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, Clock, Package, Truck, Home, ArrowLeft, 
  MapPin, Phone, Mail, CreditCard, Banknote, QrCode, 
  Printer, XCircle, ChevronRight, Copy, Check, ShoppingBag, 
  HelpCircle, ShieldCheck, RefreshCw, ExternalLink 
} from 'lucide-react';
import { ordersAPI } from '../utils/api';
import ImageLoader from '../component/image-loader';
import { showConfirm, showSuccess, showError } from '../utils/swalUtils';

export default function OrderStatus() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Pick up order from router state if arrived directly from checkout
  const [order, setOrder] = useState(location.state?.order || null);
  const [isNewOrder, setIsNewOrder] = useState(Boolean(location.state?.isNewOrder));
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(!order);
  const [copiedId, setCopiedId] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const [orderRes, trackRes] = await Promise.allSettled([
        ordersAPI.getById(orderId),
        ordersAPI.trackOrder(orderId)
      ]);

      if (orderRes.status === 'fulfilled' && orderRes.value?.data) {
        setOrder(orderRes.value.data);
      }
      if (trackRes.status === 'fulfilled' && trackRes.value?.data) {
        setTrackingData(trackRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load order status:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = () => {
    if (order?.id) {
      navigator.clipboard.writeText(String(order.id));
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const handleCancelOrder = async () => {
    const result = await showConfirm(
      'Cancel this Order?',
      'Are you sure you want to cancel this order? This action cannot be reversed.',
      'Yes, Cancel Order',
      'bg-rose-600 text-white'
    );

    if (result.isConfirmed) {
      try {
        setIsCancelling(true);
        const res = await ordersAPI.cancelOrder(orderId, 'Customer requested cancellation');
        if (res.data?.order) {
          setOrder(res.data.order);
        } else {
          setOrder(prev => ({ ...prev, status: 'cancelled' }));
        }
        showSuccess('Order Cancelled', 'Your order has been cancelled successfully.');
        fetchOrderDetails();
      } catch (err) {
        console.error('Cancellation failed:', err);
        showError('Cancellation Failed', err.response?.data?.error || 'Unable to cancel order at this time.');
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Determine current step index for the tracker
  // 0: Confirmed, 1: Shipped, 2: Out for delivery, 3: Delivered
  const getStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 3;
    if (s === 'out_for_delivery') return 2;
    if (s === 'shipped') return 1;
    if (s === 'processing') return 1;
    if (s === 'pending') return 0;
    return 0;
  };

  const isCancelled = (order?.status || '').toLowerCase() === 'cancelled';
  const currentStep = getStepIndex(order?.status);

  // Format estimated delivery date
  const getEstimatedDateString = () => {
    if (order?.delivery?.estimated_delivery) {
      const d = new Date(order.delivery.estimated_delivery);
      return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
    const created = order?.created_at ? new Date(order.created_at) : new Date();
    const est = new Date(created.getTime() + 4 * 24 * 60 * 60 * 1000);
    return est.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formattedDate = order?.created_at 
    ? new Date(order.created_at).toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : 'Recent';

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 bg-[#fcfcfc]">
        <div className="w-12 h-12 border-4 border-[#134e35] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-gray-600">Retrieving order & tracking status...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#fcfcfc]">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-sm text-gray-500 max-w-md mb-6">
          We could not locate an order matching ID <span className="font-semibold text-gray-800">#{orderId}</span>. Please verify your order number or check your order history.
        </p>
        <Link
          to="/product"
          className="px-6 py-3 bg-[#134e35] text-white rounded-full text-xs font-bold hover:bg-[#0e3a27] transition-all"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  const steps = [
    { title: 'Order Confirmed', desc: 'Placed & verified', icon: CheckCircle2 },
    { title: 'Shipped', desc: 'Dispatched in transit', icon: Package },
    { title: 'Out for Delivery', desc: 'Nearby courier', icon: Truck },
    { title: 'Delivered', desc: 'Arrived at address', icon: Home },
  ];

  return (
    <div className="bg-[#f8f9f8] min-h-screen py-8 sm:py-12 print:bg-white print:py-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-5xl">
        
        {/* Navigation & Header Actions (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
          <Link
            to="/product"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue shopping</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download Invoice</span>
            </button>
            <button
              onClick={fetchOrderDetails}
              className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-black hover:bg-gray-50 transition-colors shadow-2xs"
              title="Refresh status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Success Banner if arriving straight from checkout */}
        {isNewOrder && !isCancelled && (
          <div className="mb-6 bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-xs print:hidden animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-[#10b981] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Order Placed, thank you!
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Confirmation has been registered for <span className="font-semibold text-gray-800">{order.customer_email || order.customer_name}</span>. We will notify you once your package is dispatched.
              </p>
            </div>
          </div>
        )}

        {/* Main Order Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden mb-6">
          
          {/* Order Meta Bar */}
          <div className="bg-[#f9faf9] border-b border-gray-200/80 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Order
                </span>
                <span className="text-base sm:text-lg font-extrabold text-gray-900">
                  #{order.id}
                </span>
                <button
                  onClick={copyOrderId}
                  className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                  title="Copy Order ID"
                >
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Placed on <span className="font-medium text-gray-700">{formattedDate}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                isCancelled
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : order.status === 'delivered'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {order.status || 'Pending'}
              </span>

              {/* Cancel Button if eligible */}
              {!isCancelled && ['pending', 'processing'].includes((order.status || '').toLowerCase()) && (
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="px-3 py-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 print:hidden"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>

          {/* Stepper Tracking Visualizer (Amazon / Flipkart Style) */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            {isCancelled ? (
              <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-5 flex items-center gap-3.5">
                <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-rose-900">
                    This order has been cancelled
                  </h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    No further shipments will take place. If payment was deducted, refund will be credited in 3-5 business days.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {/* Expected Delivery Banner */}
                <div className="mb-8">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    DELIVERY STATUS
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {order.status === 'delivered' ? (
                      <span className="text-emerald-700">Delivered</span>
                    ) : (
                      <span>Arriving by <span className="text-[#134e35]">{getEstimatedDateString()}</span></span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      Carrier: <span className="font-semibold text-gray-700">{order.delivery?.carrier || 'BlueDart / Delhivery Express'}</span>
                      {order.delivery?.tracking_number && (
                        <span> • Tracking ID: <span className="font-mono font-semibold text-gray-700">{order.delivery.tracking_number}</span></span>
                      )}
                    </span>
                  </p>
                </div>

                {/* Progress Bar / Stepper */}
                <div className="relative">
                  <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0">
                    <div 
                      className="h-full bg-[#134e35] transition-all duration-500"
                      style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                    {steps.map((step, idx) => {
                      const Icon = step.icon;
                      const isCompleted = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={idx} className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isCompleted
                              ? 'bg-[#134e35] text-white ring-4 ring-[#134e35]/15'
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className={`text-xs font-bold ${isCurrent ? 'text-[#134e35]' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                              {step.title}
                            </div>
                            <div className="text-[11px] text-gray-500 hidden sm:block">
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3-Column Info Cards: Delivery Address, Payment, Assistance */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 border-b border-gray-100 text-xs">
            
            {/* Delivery Address */}
            <div className="p-6 space-y-2">
              <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#134e35]" />
                <span>Shipping Address</span>
              </h4>
              <p className="font-bold text-gray-900">{order.customer_name}</p>
              <p className="text-gray-600 leading-relaxed">{order.shipping_address}</p>
              <div className="pt-1 space-y-0.5 text-gray-500">
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span>{order.customer_phone}</span>
                </p>
                {order.customer_email && (
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span>{order.customer_email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="p-6 space-y-2">
              <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#134e35]" />
                <span>Payment Method</span>
              </h4>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">
                  {order.payment_method || 'Cash on Delivery'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  (order.payment_status || '').toLowerCase() === 'paid'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {order.payment_status || 'Pending'}
                </span>
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                {(order.payment_method || '').toLowerCase().includes('cash')
                  ? 'Pay with cash or UPI scan when parcel is delivered.'
                  : 'Prepaid transaction verified via encrypted gateway.'}
              </p>
              <div className="pt-2 flex items-center gap-1 text-[11px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Buyer Protection Guaranteed</span>
              </div>
            </div>

            {/* Order Summary Breakdown */}
            <div className="p-6 space-y-2 bg-[#fafbfa] md:bg-white">
              <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-[#134e35]" />
                <span>Order Summary</span>
              </h4>
              <div className="space-y-1.5 pt-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold text-gray-900">₹{Number(order.subtotal || order.total).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Delivery:</span>
                  <span className="font-semibold text-emerald-700">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax:</span>
                  <span className="font-semibold text-gray-900">₹0</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Grand Total:</span>
                  <span className="text-[#134e35]">₹{Number(order.total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Ordered Items List */}
          <div className="p-6 sm:p-8">
            <h4 className="font-bold text-gray-900 text-sm mb-4">
              Items in this shipment ({order.items?.length || 0})
            </h4>

            <div className="divide-y divide-gray-100">
              {(order.items || []).map((item, idx) => {
                const itemTotal = Number(item.price) * Number(item.quantity || 1);
                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#f0f2f0] rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1 border border-gray-100">
                        <ImageLoader
                          src={item.product_image || item.image || item.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="space-y-1">
                        <h5 className="font-bold text-gray-900 text-sm hover:text-[#134e35] transition-colors">
                          {item.product_id ? (
                            <Link to={`/product-view/${item.product_id}`}>
                              {item.product_name}
                            </Link>
                          ) : (
                            item.product_name
                          )}
                        </h5>

                        {/* Variants */}
                        {(item.selected_size || item.selected_color) && (
                          <div className="flex flex-wrap items-center gap-2">
                            {item.selected_size && (
                              <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                                Size: {item.selected_size}
                              </span>
                            )}
                            {item.selected_color && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                                <span 
                                  className="w-2 h-2 rounded-full border border-gray-300"
                                  style={{ backgroundColor: item.selected_color.toLowerCase() }}
                                />
                                Color: {item.selected_color}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-gray-500">
                          Qty: <span className="font-semibold text-gray-800">{item.quantity}</span> × ₹{Number(item.price).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-gray-900">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </span>
                      {item.product_id && (
                        <Link
                          to={`/product-view/${item.product_id}`}
                          className="text-xs font-semibold text-[#134e35] hover:underline flex items-center gap-0.5 print:hidden"
                        >
                          <span>Buy it again</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Quick Help Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#134e35] flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-gray-900">
                Need help with this order?
              </h5>
              <p className="text-xs text-gray-500">
                Contact our customer support team for returns, address changes or courier inquiries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/contact"
              className="w-full sm:w-auto text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-xs font-semibold transition-colors"
            >
              Contact Support
            </Link>
            <Link
              to="/product"
              className="w-full sm:w-auto text-center px-5 py-2 bg-[#134e35] hover:bg-[#0e3a27] text-white rounded-full text-xs font-semibold transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

