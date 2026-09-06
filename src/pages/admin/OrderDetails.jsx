import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../component/AdminLayout';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBox, FaCalendar } from 'react-icons/fa';
import { getOrders, updateOrderStatus } from '../../utils/adminData';

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
          <p className="text-gray-600 mt-2">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/orders')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Orders
          </button>
        </div>
      </AdminLayout>
    );
  }

  const handleStatusChange = (newStatus) => {
    updateOrderStatus(orderId, newStatus);
    window.location.reload(); // Refresh to show updated data
  };

  const getStatusColor = (status) => {
    const colors = {
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'shipped': 'bg-blue-100 text-blue-800 border-blue-200',
      'processing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pending': 'bg-orange-100 text-orange-800 border-orange-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/orders')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order #{order.id}</h2>
              <p className="text-gray-600 mt-1">Placed on {order.date}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Order Items</h3>
              </div>
              <div className="p-6 space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FaBox className="text-gray-400 text-2xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{item.price.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">₹{item.price.toLocaleString()} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (GST 18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Update Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Update Order Status</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`px-4 py-2 rounded-lg border-2 font-semibold transition ${
                        order.status === status
                          ? getStatusColor(status)
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Customer Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <FaUser className="text-indigo-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{order.customer}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FaEnvelope className="text-indigo-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{order.email}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FaPhone className="text-indigo-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">{order.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Shipping Address</h3>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="text-indigo-600 mt-1" />
                  <div>
                    <p className="text-gray-700 leading-relaxed">{order.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Order Timeline</h3>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <FaCalendar className="text-indigo-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold text-gray-900">{order.date}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default OrderDetails;
