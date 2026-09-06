import React, { useState } from 'react';
import AdminLayout from '../../component/AdminLayout';
import { FaSearch, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaBox } from 'react-icons/fa';

function NewAdminDelivery() {
  const [deliveries, setDeliveries] = useState([
    {
      id: 1,
      trackingNumber: 'TRK123456789',
      orderId: '1001',
      customer: 'John Doe',
      address: '123 Main St, New York, NY 10001',
      phone: '+1234567890',
      status: 'in_transit',
      estimatedDelivery: '2026-02-02',
      createdAt: '2026-01-30',
      carrier: 'FedEx',
      items: 3
    },
    {
      id: 2,
      trackingNumber: 'TRK987654321',
      orderId: '1002',
      customer: 'Jane Smith',
      address: '456 Oak Ave, Los Angeles, CA 90001',
      phone: '+1234567891',
      status: 'delivered',
      estimatedDelivery: '2026-01-31',
      createdAt: '2026-01-29',
      carrier: 'UPS',
      items: 2
    },
    {
      id: 3,
      trackingNumber: 'TRK456789123',
      orderId: '1003',
      customer: 'Bob Johnson',
      address: '789 Pine Rd, Chicago, IL 60601',
      phone: '+1234567892',
      status: 'out_for_delivery',
      estimatedDelivery: '2026-01-31',
      createdAt: '2026-01-28',
      carrier: 'DHL',
      items: 1
    },
    {
      id: 4,
      trackingNumber: 'TRK789123456',
      orderId: '1004',
      customer: 'Alice Brown',
      address: '321 Elm St, Houston, TX 77001',
      phone: '+1234567893',
      status: 'pending',
      estimatedDelivery: '2026-02-05',
      createdAt: '2026-01-30',
      carrier: 'USPS',
      items: 4
    },
    {
      id: 5,
      trackingNumber: 'TRK321654987',
      orderId: '1005',
      customer: 'Charlie Wilson',
      address: '654 Maple Dr, Phoenix, AZ 85001',
      phone: '+1234567894',
      status: 'failed',
      estimatedDelivery: '2026-01-30',
      createdAt: '2026-01-27',
      carrier: 'FedEx',
      items: 2
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All Deliveries', icon: FaBox, color: 'bg-gray-100 text-gray-800' },
    { value: 'pending', label: 'Pending', icon: FaClock, color: 'bg-orange-100 text-orange-800' },
    { value: 'in_transit', label: 'In Transit', icon: FaTruck, color: 'bg-blue-100 text-blue-800' },
    { value: 'out_for_delivery', label: 'Out for Delivery', icon: FaTruck, color: 'bg-purple-100 text-purple-800' },
    { value: 'delivered', label: 'Delivered', icon: FaCheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'Failed', icon: FaTimesCircle, color: 'bg-red-100 text-red-800' },
  ];

  const getStatusConfig = (status) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const updateDeliveryStatus = (id, newStatus) => {
    setDeliveries(deliveries.map(delivery =>
      delivery.id === id ? { ...delivery, status: newStatus } : delivery
    ));
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch =
      delivery.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Delivery Management</h2>
          <p className="text-gray-600 mt-1">Track and manage all deliveries</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statusOptions.filter(opt => opt.value !== 'all').map((status) => {
            const count = deliveries.filter(d => d.status === status.value).length;
            return (
              <div key={status.value} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{status.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                  </div>
                  <div className={`p-3 rounded-full ${status.color}`}>
                    <status.icon className="text-xl" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 space-y-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tracking number, customer, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                  statusFilter === option.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <option.icon />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carrier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeliveries.map((delivery) => {
                  const statusConfig = getStatusConfig(delivery.status);
                  return (
                    <tr key={delivery.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{delivery.trackingNumber}</div>
                        <div className="text-xs text-gray-500">{delivery.items} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{delivery.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{delivery.customer}</div>
                        <div className="text-xs text-gray-500">{delivery.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{delivery.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {delivery.carrier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center space-x-1 ${statusConfig.color}`}>
                          <statusConfig.icon />
                          <span>{statusConfig.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {delivery.estimatedDelivery}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={delivery.status}
                          onChange={(e) => updateDeliveryStatus(delivery.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredDeliveries.length === 0 && (
            <div className="text-center py-12">
              <FaTruck className="mx-auto text-5xl text-gray-300 mb-3" />
              <p className="text-gray-500">No deliveries found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default NewAdminDelivery;
