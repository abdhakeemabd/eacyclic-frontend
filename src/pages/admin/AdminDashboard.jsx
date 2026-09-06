import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import AdminLayout from '../../component/AdminLayout';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingBag, MessageSquare, 
  ArrowUpRight, ArrowDownRight, Calendar, Filter,
  Navigation
} from 'lucide-react';
import { productsAPI, ordersAPI, contactAPI } from '../../utils/api';
import { BaseTable } from '../../components/shadcn-custom/BaseTable';
import { BaseDropdown } from '../../components/shadcn-custom/BaseDropdown';

function AdminDashboard() {
  const { adminUser } = useAdmin();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingDeliveries: 0,
    unreadMessages: 0,
    todaySales: 0,
    monthSales: 0,
    yearSales: 0,
    totalRevenue: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [products, orders, contacts] = await Promise.allSettled([
        productsAPI.getAll(),
        ordersAPI.getAll(),
        contactAPI.getAll()
      ]);

      const productsData = products.status === 'fulfilled' ? products.value.data : [];
      let ordersData = orders.status === 'fulfilled' ? orders.value.data : [];
      let contactsData = contacts.status === 'fulfilled' ? contacts.value.data : [];
      
      try {
        const localOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
        const mergedOrdersMap = new Map();
        ordersData.forEach(o => { if (o.id) mergedOrdersMap.set(o.id.toString(), o); });
        localOrders.forEach(o => { if (o.id) mergedOrdersMap.set(o.id.toString(), o); });
        ordersData = Array.from(mergedOrdersMap.values());
      } catch (e) { console.warn('Local orders fetch failed'); }

      try {
        const localContacts = JSON.parse(localStorage.getItem('adminContacts') || '[]');
        const mergedContactsMap = new Map();
        contactsData.forEach(c => { if (c.id) mergedContactsMap.set(c.id.toString(), c); });
        localContacts.forEach(c => { if (c.id) mergedContactsMap.set(c.id.toString(), c); });
        contactsData = Array.from(mergedContactsMap.values());
      } catch (e) { console.warn('Local contacts fetch failed'); }

      
      const uniqueCustomers = new Set(ordersData.map(o => o.customer_email).filter(Boolean));

      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7);
      const thisYear = new Date().getFullYear();

      const todayOrders = ordersData.filter(o => o.created_at?.startsWith(today));
      const monthOrders = ordersData.filter(o => o.created_at?.startsWith(thisMonth));
      const yearOrders = ordersData.filter(o => o.created_at?.startsWith(thisYear.toString()));

      const calculateTotal = (orders) => orders.reduce((sum, order) => sum + (order.total || 0), 0);

      setStats({
        totalProducts: productsData.length || 0,
        totalOrders: ordersData.length || 0,
        totalCustomers: uniqueCustomers.size || 0,
        pendingDeliveries: ordersData.filter(o => o.status === 'pending' || o.status === 'processing').length || 0,
        unreadMessages: contactsData.filter(c => !c.is_read).length || 0,
        todaySales: calculateTotal(todayOrders),
        monthSales: calculateTotal(monthOrders),
        yearSales: calculateTotal(yearOrders),
        totalRevenue: calculateTotal(ordersData)
      });

      generateSalesData(ordersData);
      
      const statusCounts = ordersData.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      setOrderStatusData([
        { name: 'Pending', value: statusCounts.pending || 0, color: '#f59e0b' },
        { name: 'Processing', value: statusCounts.processing || 0, color: '#3b82f6' },
        { name: 'Shipped', value: statusCounts.shipped || 0, color: '#8b5cf6' },
        { name: 'Delivered', value: statusCounts.delivered || 0, color: '#10b981' },
        { name: 'Cancelled', value: statusCounts.cancelled || 0, color: '#ef4444' }
      ]);

      setRecentOrders(ordersData.slice(0, 6));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSalesData = (orders) => {
    const data = [];
    const now = new Date();

    if (selectedPeriod === 'day') {
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourStr = hour.getHours().toString().padStart(2, '0');
        const sales = orders.filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate.getHours() === hour.getHours() && orderDate.getDate() === hour.getDate();
        }).reduce((sum, o) => sum + (o.total || 0), 0);
        data.push({ name: `${hourStr}:00`, sales });
      }
    } else if (selectedPeriod === 'month') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const sales = orders.filter(o => o.created_at?.startsWith(dateStr))
          .reduce((sum, o) => sum + (o.total || 0), 0);
        data.push({ name: date.getDate().toString(), sales });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toISOString().slice(0, 7);
        const sales = orders.filter(o => o.created_at?.startsWith(monthStr))
          .reduce((sum, o) => sum + (o.total || 0), 0);
        data.push({ name: date.toLocaleString('default', { month: 'short' }), sales });
      }
    }
    setSalesData(data);
  };

  const StatCard = ({ icon: Icon, title, value, trend, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card text-card-foreground rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2 text-foreground tabular-nums">
            {typeof value === 'number' && title.toLowerCase().includes('sales') ? `$${value.toLocaleString()}` : value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl bg-muted`}>
          <Icon size={20} className={color} />
        </div>
      </div>
      
      <div className="mt-6 flex items-center text-xs">
        {trend > 0 ? (
          <span className="text-emerald-500 font-medium flex items-center bg-emerald-500/10 px-2 py-1 rounded-md">
            <TrendingUp size={12} className="mr-1" /> +{trend}% from last month
          </span>
        ) : (
          <span className="text-rose-500 font-medium flex items-center bg-rose-500/10 px-2 py-1 rounded-md">
            <ArrowDownRight size={12} className="mr-1" /> {trend}% from last month
          </span>
        )}
      </div>
    </motion.div>
  );

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      shipped: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      cancelled: 'bg-destructive/10 text-destructive dark:text-red-400 border-destructive/30'
    };
    return styles[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/30';
  };

  const tableHeaders = [
    { label: 'Order Info' },
    { label: 'Customer' },
    { label: 'Status' },
    { label: 'Amount' },
    { label: 'Action', className: 'text-center' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 px-4 md:px-8 py-6 w-full max-w-[1600px] mx-auto">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your store's performance.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-muted-foreground shadow-sm">
              <Calendar size={16} className="mr-2 text-primary" /> 
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <button className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
              <Filter size={16} className="mr-2" /> Filters
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard 
            icon={ShoppingBag} 
            title="Total Sales" 
            value={stats.todaySales} 
            trend={12.5} 
            color="text-primary" 
            delay={0.1}
          />
          <StatCard 
            icon={Users} 
            title="Customers" 
            value={stats.totalCustomers} 
            trend={8.2} 
            color="text-blue-500" 
            delay={0.2}
          />
          <StatCard 
            icon={ShoppingBag} 
            title="Orders" 
            value={stats.totalOrders} 
            trend={-2.4} 
            color="text-emerald-500" 
            delay={0.3}
          />
          <StatCard 
            icon={MessageSquare} 
            title="Messages" 
            value={stats.unreadMessages} 
            trend={5.7} 
            color="text-rose-500" 
            delay={0.5}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card text-card-foreground rounded-2xl p-6 border border-border shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Revenue Analytics</h2>
                <p className="text-sm text-muted-foreground mt-1">Track your store earnings over time</p>
              </div>
              <div className="flex bg-muted p-1 rounded-lg border border-border/50">
                {['day', 'month', 'year'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPeriod(p)}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all capitalize
                      ${selectedPeriod === p 
                        ? 'bg-background shadow-sm text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderRadius: '8px', 
                      border: '1px solid hsl(var(--border))', 
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      color: 'hsl(var(--foreground))'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="var(--primary)" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-2xl p-6 border border-border shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-foreground">Order Status</h2>
              <p className="text-sm text-muted-foreground mt-1">Distribution of current orders</p>
            </div>
            
            <div className="h-[200px] w-full relative mt-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderRadius: '8px', 
                      border: '1px solid hsl(var(--border))'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-foreground">{stats.totalOrders}</span>
                <span className="text-xs font-medium text-muted-foreground">Orders</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {orderStatusData.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-medium text-muted-foreground">{s.name}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-card text-card-foreground rounded-3xl shadow-md border border-border overflow-hidden mt-6">
          <div className="p-6 border-b border-border flex items-center justify-between bg-muted/10">
            <div>
              <h2 className="text-xl font-bold text-foreground">Recent Transactions</h2>
              <p className="text-sm text-muted-foreground mt-1">Your store's latest orders</p>
            </div>
            <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
              View All Orders
            </button>
          </div>
          
          <div className="p-0">
            <BaseTable 
              headers={tableHeaders} 
              isLoading={loading} 
              skeletonCount={3}
              data={recentOrders}
              emptyMessage="No recent orders found."
              renderRow={(order, i) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Navigation size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">#{order.id.toString().slice(-6)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 align-middle">
                    <p className="font-semibold text-foreground text-sm">{order.customer_name || 'Guest User'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.customer_email || 'no-email@store.com'}</p>
                  </td>
                  
                  <td className="px-4 py-4 align-middle">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4 align-middle">
                    <p className="font-bold text-foreground text-sm">${order.total?.toFixed(2)}</p>
                  </td>
                  
                  <td className="px-6 py-4 align-middle text-center flex justify-center">
                    <button className="p-2 rounded-lg text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                      <ArrowUpRight size={18} />
                    </button>
                  </td>
                </tr>
              )}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
