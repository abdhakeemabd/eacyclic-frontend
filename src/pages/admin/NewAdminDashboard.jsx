import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../component/AdminLayout';
import { 
  FaBox, FaShoppingCart, FaTruck, FaEnvelope, FaDollarSign,
  FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { getDashboardStats } from '../../utils/adminData';

function NewAdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load dashboard data
    const data = getDashboardStats();
    setDashboardData(data);
    setLoading(false);
  }, []);

  if (loading || !dashboardData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    { 
      title: 'Total Products', 
      value: dashboardData.totalProducts.toString(), 
      change: '+12%', 
      isPositive: true,
      icon: FaBox,
      color: 'bg-blue-500'
    },
    { 
      title: 'Total Orders', 
      value: dashboardData.totalOrders.toString(), 
      change: '+8%', 
      isPositive: true,
      icon: FaShoppingCart,
      color: 'bg-green-500'
    },
    { 
      title: 'Pending Deliveries', 
      value: dashboardData.pendingDeliveries.toString(), 
      change: '-5%', 
      isPositive: false,
      icon: FaTruck,
      color: 'bg-orange-500'
    },
    { 
      title: 'New Messages', 
      value: dashboardData.unreadMessages.toString(), 
      change: '+15%', 
      isPositive: true,
      icon: FaEnvelope,
      color: 'bg-purple-500'
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'delivered': 'bg-green-100 text-green-800',
      'shipped': 'bg-blue-100 text-blue-800',
      'processing': 'bg-yellow-100 text-yellow-800',
      'pending': 'bg-orange-100 text-orange-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.isPositive ? (
                      <FaArrowUp className="text-green-500 text-sm mr-1" />
                    ) : (
                      <FaArrowDown className="text-red-500 text-sm mr-1" />
                    )}
                    <span className={`text-sm ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`${stat.color} p-4 rounded-full`}>
                  <stat.icon className="text-white text-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Today's Revenue</p>
                <p className="text-3xl font-bold mt-2">₹{dashboardData.todayRevenue.toLocaleString()}</p>
                <p className="text-sm mt-1 opacity-75">+18% from yesterday</p>
              </div>
              <FaDollarSign className="text-5xl opacity-30" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">This Month</p>
                <p className="text-3xl font-bold mt-2">₹{dashboardData.thisMonthRevenue.toLocaleString()}</p>
                <p className="text-sm mt-1 opacity-75">+12% from last month</p>
              </div>
              <FaDollarSign className="text-5xl opacity-30" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">This Year</p>
                <p className="text-3xl font-bold mt-2">₹{dashboardData.thisYearRevenue.toLocaleString()}</p>
                <p className="text-sm mt-1 opacity-75">+24% from last year</p>
              </div>
              <FaDollarSign className="text-5xl opacity-30" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Sales</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Orders</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Bar dataKey="sales" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{order.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default NewAdminDashboard;
