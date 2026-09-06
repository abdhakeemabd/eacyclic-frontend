import React, { useState } from 'react';
import AdminLayout from '../../component/AdminLayout';
import { FaSearch, FaEnvelope, FaEnvelopeOpen, FaTrash, FaTimes, FaUser, FaPhone, FaClock } from 'react-icons/fa';

function NewAdminContacts() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      subject: 'Product Inquiry',
      message: 'Hi, I would like to know more about the Wireless Headphones. Are they compatible with iPhone 15? Also, what is the battery life? Thank you!',
      isRead: false,
      createdAt: '2026-01-31 10:30 AM',
      date: '2026-01-31'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567891',
      subject: 'Order Status',
      message: 'Hello, I placed an order yesterday (Order #1002) and I haven\'t received any tracking information yet. Can you please help me with this?',
      isRead: false,
      createdAt: '2026-01-31 09:15 AM',
      date: '2026-01-31'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+1234567892',
      subject: 'Return Request',
      message: 'I received my order but the product is not as described. I would like to return it and get a refund. Please let me know the return process.',
      isRead: true,
      createdAt: '2026-01-30 03:45 PM',
      date: '2026-01-30'
    },
    {
      id: 4,
      name: 'Alice Brown',
      email: 'alice@example.com',
      phone: '+1234567893',
      subject: 'Bulk Order Inquiry',
      message: 'We are interested in placing a bulk order for your Bluetooth Speakers. Can you provide wholesale pricing for 100+ units? Please contact me at your earliest convenience.',
      isRead: true,
      createdAt: '2026-01-30 11:20 AM',
      date: '2026-01-30'
    },
    {
      id: 5,
      name: 'Charlie Wilson',
      email: 'charlie@example.com',
      phone: '+1234567894',
      subject: 'Technical Support',
      message: 'I\'m having trouble connecting my Smart Watch to my phone. I\'ve tried following the manual but it\'s not working. Can someone help me troubleshoot this issue?',
      isRead: false,
      createdAt: '2026-01-29 02:10 PM',
      date: '2026-01-29'
    },
  ]);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const markAsRead = (id) => {
    setMessages(messages.map(msg =>
      msg.id === id ? { ...msg, isRead: true } : msg
    ));
  };

  const deleteMessage = (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      setMessages(messages.filter(msg => msg.id !== id));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  const openMessage = (message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'unread' && !message.isRead) ||
      (statusFilter === 'read' && message.isRead);

    return matchesSearch && matchesStatus;
  });

  const unreadCount = messages.filter(msg => !msg.isRead).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
            <p className="text-gray-600 mt-1">Manage customer inquiries and messages</p>
          </div>
          <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-semibold">
            {unreadCount} Unread
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{messages.length}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <FaEnvelope className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Messages</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{unreadCount}</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-full">
                <FaEnvelope className="text-orange-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Read Messages</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{messages.length - unreadCount}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <FaEnvelopeOpen className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 space-y-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, subject, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Messages
            </button>
            <button
              onClick={() => setStatusFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'unread'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setStatusFilter('read')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'read'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read ({messages.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message Preview
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
                {filteredMessages.map((message) => (
                  <tr
                    key={message.id}
                    className={`hover:bg-gray-50 transition cursor-pointer ${!message.isRead ? 'bg-blue-50' : ''}`}
                    onClick={() => openMessage(message)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {message.isRead ? (
                        <FaEnvelopeOpen className="text-gray-400 text-lg" />
                      ) : (
                        <FaEnvelope className="text-indigo-600 text-lg" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${!message.isRead ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                            {message.name}
                          </div>
                          <div className="text-xs text-gray-500">{message.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${!message.isRead ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                        {message.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-md truncate">
                        {message.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FaClock className="text-xs" />
                        <span>{message.createdAt}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(message.id);
                        }}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMessages.length === 0 && (
            <div className="text-center py-12">
              <FaEnvelope className="mx-auto text-5xl text-gray-300 mb-3" />
              <p className="text-gray-500">No messages found</p>
            </div>
          )}
        </div>
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-[#03030373] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Message Details</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Sender Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <FaUser className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{selectedMessage.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaEnvelope className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedMessage.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FaPhone className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{selectedMessage.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <FaClock className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Received</p>
                      <p className="font-medium text-gray-900">{selectedMessage.createdAt}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Subject</h4>
                <p className="text-lg font-semibold text-gray-900">{selectedMessage.subject}</p>
              </div>

              {/* Message */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Message</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  deleteMessage(selectedMessage.id);
                  setSelectedMessage(null);
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
              >
                <FaTrash />
                <span>Delete Message</span>
              </button>
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default NewAdminContacts;
