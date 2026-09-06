// ============================================
// CENTRALIZED DATA STORE FOR ADMIN PANEL
// ============================================

// Initialize data from localStorage or use defaults
const getStoredData = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return defaultValue;
  }
};

const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
};

// PRODUCTS DATA
// ============================================
export const getProducts = () => {
  // Get products from localStorage (synced with ProductContext)
  const storedProducts = getStoredData('adminProducts', []);
  
  // If no products in localStorage, return empty array
  if (!storedProducts || storedProducts.length === 0) {
    return [];
  }
  
  // Helper to safely parse price as integer
  const parsePrice = (value) => {
    if (typeof value === 'number') return Math.round(value);
    if (typeof value === 'string') {
      const cleaned = value.replace(/,/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : Math.round(parsed);
    }
    return 0;
  };
  
  // Transform products to admin format and sort by ID descending (LIFO)
  return storedProducts
    .map(product => ({
      id: product.id,
      name: product.title || product.name,
      category: product.category || getCategoryFromTitle(product.title || product.name || ''),
      price: parsePrice(product.offerPrice || product.price),
      oldPrice: parsePrice(product.oldPrice),
      stock: product.count || product.stock || 0,
      image: product.gallery && product.gallery[0] ? product.gallery[0] : product.image || '',
      description: product.description || product.content,
      offer: product.offer,
      content: product.content,
      gallery: product.gallery || []
    }))
    .sort((a, b) => {
      const idA = typeof a.id === 'string' ? parseInt(a.id) : a.id;
      const idB = typeof b.id === 'string' ? parseInt(b.id) : b.id;
      return idB - idA;
    });
};


const getCategoryFromTitle = (title) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('chair') || lowerTitle.includes('table') || lowerTitle.includes('wardrobe') || lowerTitle.includes('shelf')) {
    return 'Furniture';
  } else if (lowerTitle.includes('fan') || lowerTitle.includes('cooler') || lowerTitle.includes('mixer')) {
    return 'Appliances';
  } else if (lowerTitle.includes('tv') || lowerTitle.includes('speaker') || lowerTitle.includes('soundbar')) {
    return 'Electronics';
  } else if (lowerTitle.includes('mattress')) {
    return 'Bedding';
  } else if (lowerTitle.includes('cobra')) {
    return 'Health & Wellness';
  } else if (lowerTitle.includes('podi') || lowerTitle.includes('homemade')) {
    return 'Grocery';
  }
  return 'Other';

};

// ============================================
// ORDERS DATA
// ============================================
const defaultOrders = [
  {
    id: '1001',
    customer: 'Rajesh Kumar',
    email: 'rajesh.k@example.com',
    phone: '+91 98765 43210',
    total: 10000,
    status: 'delivered',
    date: '2026-01-30',
    items: [
      { name: 'LOONART Solid Sheesham', quantity: 1, price: 10000 }
    ],
    address: '123 MG Road, Bangalore, Karnataka 560001'
  },
  {
    id: '1002',
    customer: 'Priya Sharma',
    email: 'priya.s@example.com',
    phone: '+91 98765 43211',
    total: 9000,
    status: 'shipped',
    date: '2026-01-30',
    items: [
      { name: 'Industrial Metal Chair', quantity: 1, price: 9000 }
    ],
    address: '456 Park Street, Kolkata, West Bengal 700016'
  },
  {
    id: '1003',
    customer: 'Amit Patel',
    email: 'amit.p@example.com',
    phone: '+91 98765 43212',
    total: 15000,
    status: 'processing',
    date: '2026-01-29',
    items: [
      { name: 'Samsung QLED TV', quantity: 1, price: 15000 }
    ],
    address: '789 Station Road, Ahmedabad, Gujarat 380001'
  },
  {
    id: '1004',
    customer: 'Sneha Reddy',
    email: 'sneha.r@example.com',
    phone: '+91 98765 43213',
    total: 1299,
    status: 'pending',
    date: '2026-01-29',
    items: [
      { name: 'COBRA ROMANCE', quantity: 1, price: 1299 }
    ],
    address: '321 Jubilee Hills, Hyderabad, Telangana 500033'
  },
  {
    id: '1005',
    customer: 'Vikram Singh',
    email: 'vikram.s@example.com',
    phone: '+91 98765 43214',
    total: 13000,
    status: 'delivered',
    date: '2026-01-28',
    items: [
      { name: 'LG 43-inch 4K UHD TV', quantity: 1, price: 13000 }
    ],
    address: '654 Civil Lines, Delhi 110054'
  }
];

export const getOrders = () => {
  return getStoredData('adminOrders', defaultOrders);
};

export const updateOrderStatus = (orderId, newStatus) => {
  const orders = getOrders();
  const updated = orders.map(order =>
    order.id === orderId ? { ...order, status: newStatus } : order
  );
  saveData('adminOrders', updated);
  return updated;
};

// ============================================
// DELIVERY DATA
// ============================================
const defaultDeliveries = [
  {
    id: 1,
    trackingNumber: 'TRK' + Date.now() + '001',
    orderId: '1001',
    customer: 'Rajesh Kumar',
    address: '123 MG Road, Bangalore, Karnataka 560001',
    phone: '+91 98765 43210',
    status: 'delivered',
    estimatedDelivery: '2026-01-31',
    createdAt: '2026-01-28',
    carrier: 'Delhivery',
    items: 1
  },
  {
    id: 2,
    trackingNumber: 'TRK' + Date.now() + '002',
    orderId: '1002',
    customer: 'Priya Sharma',
    address: '456 Park Street, Kolkata, West Bengal 700016',
    phone: '+91 98765 43211',
    status: 'in_transit',
    estimatedDelivery: '2026-02-01',
    createdAt: '2026-01-29',
    carrier: 'Blue Dart',
    items: 1
  },
  {
    id: 3,
    trackingNumber: 'TRK' + Date.now() + '003',
    orderId: '1003',
    customer: 'Amit Patel',
    address: '789 Station Road, Ahmedabad, Gujarat 380001',
    phone: '+91 98765 43212',
    status: 'out_for_delivery',
    estimatedDelivery: '2026-01-31',
    createdAt: '2026-01-29',
    carrier: 'DTDC',
    items: 1
  },
  {
    id: 4,
    trackingNumber: 'TRK' + Date.now() + '004',
    orderId: '1004',
    customer: 'Sneha Reddy',
    address: '321 Jubilee Hills, Hyderabad, Telangana 500033',
    phone: '+91 98765 43213',
    status: 'pending',
    estimatedDelivery: '2026-02-03',
    createdAt: '2026-01-30',
    carrier: 'India Post',
    items: 1
  }
];

export const getDeliveries = () => {
  return getStoredData('adminDeliveries', defaultDeliveries);
};

export const updateDeliveryStatus = (deliveryId, newStatus) => {
  const deliveries = getDeliveries();
  const updated = deliveries.map(delivery =>
    delivery.id === deliveryId ? { ...delivery, status: newStatus } : delivery
  );
  saveData('adminDeliveries', updated);
  return updated;
};

// ============================================
// MESSAGES/CONTACTS DATA
// ============================================
const defaultMessages = [
  {
    id: 1,
    name: 'Arjun Mehta',
    email: 'arjun.m@example.com',
    phone: '+91 98765 43215',
    subject: 'Product Inquiry - COBRA ROMANCE',
    message: 'Hi, I would like to know more about COBRA ROMANCE. Is it safe for daily use? What are the side effects? Please provide more details. Thank you!',
    isRead: false,
    createdAt: '2026-01-31 10:30 AM',
    date: '2026-01-31'
  },
  {
    id: 2,
    name: 'Kavita Desai',
    email: 'kavita.d@example.com',
    phone: '+91 98765 43216',
    subject: 'Order Delivery Status',
    message: 'Hello, I placed an order for Samsung QLED TV yesterday (Order #1003) and I haven\'t received any tracking information yet. Can you please help me with this?',
    isRead: false,
    createdAt: '2026-01-31 09:15 AM',
    date: '2026-01-31'
  },
  {
    id: 3,
    name: 'Rohit Gupta',
    email: 'rohit.g@example.com',
    phone: '+91 98765 43217',
    subject: 'Return Request - Industrial Chair',
    message: 'I received my Industrial Metal Chair but it has a manufacturing defect. One leg is slightly bent. I would like to return it and get a replacement or refund. Please advise on the return process.',
    isRead: true,
    createdAt: '2026-01-30 03:45 PM',
    date: '2026-01-30'
  },
  {
    id: 4,
    name: 'Meera Iyer',
    email: 'meera.i@example.com',
    phone: '+91 98765 43218',
    subject: 'Bulk Order Inquiry',
    message: 'We are a hotel chain and interested in placing a bulk order for furniture items (tables and chairs). Can you provide wholesale pricing for 50+ units? Please contact me at your earliest convenience.',
    isRead: true,
    createdAt: '2026-01-30 11:20 AM',
    date: '2026-01-30'
  },
  {
    id: 5,
    name: 'Sanjay Nair',
    email: 'sanjay.n@example.com',
    phone: '+91 98765 43219',
    subject: 'Product Availability',
    message: 'Is the LG 43-inch 4K UHD TV currently in stock? I want to purchase it this week. Also, do you provide installation service? What is the warranty period?',
    isRead: false,
    createdAt: '2026-01-29 02:10 PM',
    date: '2026-01-29'
  }
];

export const getMessages = () => {
  return getStoredData('adminMessages', defaultMessages);
};

export const markMessageAsRead = (messageId) => {
  const messages = getMessages();
  const updated = messages.map(msg =>
    msg.id === messageId ? { ...msg, isRead: true } : msg
  );
  saveData('adminMessages', updated);
  return updated;
};

export const deleteMessage = (messageId) => {
  const messages = getMessages();
  const updated = messages.filter(msg => msg.id !== messageId);
  saveData('adminMessages', updated);
  return updated;
};

// ============================================
// STATISTICS / DASHBOARD DATA
// ============================================
export const getDashboardStats = () => {
  const allProducts = getProducts();
  const allOrders = getOrders();
  const allDeliveries = getDeliveries();
  const allMessages = getMessages();

  // Calculate statistics
  const totalProducts = allProducts.length;
  const totalOrders = allOrders.length;
  const pendingDeliveries = allDeliveries.filter(d => d.status === 'pending' || d.status === 'in_transit' || d.status === 'out_for_delivery').length;
  const unreadMessages = allMessages.filter(m => !m.isRead).length;

  // Calculate revenue
  const todayRevenue = allOrders
    .filter(o => o.date === new Date().toISOString().split('T')[0])
    .reduce((sum, o) => sum + o.total, 0);

  const thisMonthRevenue = allOrders
    .filter(o => {
      const orderDate = new Date(o.date);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, o) => sum + o.total, 0);

  const thisYearRevenue = allOrders
    .filter(o => {
      const orderDate = new Date(o.date);
      const now = new Date();
      return orderDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, o) => sum + o.total, 0);

  // Sales data for charts (last 7 days)
  const salesData = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  days.forEach((day, index) => {
    const randomSales = Math.floor(Math.random() * 50000) + 30000;
    salesData.push({ name: day, sales: randomSales });
  });

  return {
    totalProducts,
    totalOrders,
    pendingDeliveries,
    unreadMessages,
    todayRevenue,
    thisMonthRevenue,
    thisYearRevenue,
    salesData,
    recentOrders: allOrders.slice(0, 5)
  };
};

export default {
  getProducts,
  getOrders,
  updateOrderStatus,
  getDeliveries,
  updateDeliveryStatus,
  getMessages,
  markMessageAsRead,
  deleteMessage,
  getDashboardStats
};
