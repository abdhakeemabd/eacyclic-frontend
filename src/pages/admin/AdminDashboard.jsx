import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingBag, MessageSquare, 
  ArrowUpRight, ArrowDownRight, Calendar, Filter,
  Navigation, Plus, CheckCircle2, Package, Sparkles, ExternalLink
} from 'lucide-react';
import { productsAPI, ordersAPI, contactAPI } from '../../utils/api';
import { BaseTable } from '../../components/shadcn-custom/BaseTable';
import AdminStatCard from '../../component/AdminStatCard';

function AdminDashboard() {
  const { adminUser } = useAdmin();
  const navigate = useNavigate();
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
      
      const uniqueCustomers = new Set(ordersData.map(o => o.customer_email).filter(Boolean));

      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7);
      const thisYear = new Date().getFullYear();

      const todayOrders = ordersData.filter(o => o.created_at?.startsWith(today));
      const monthOrders = ordersData.filter(o => o.created_at?.startsWith(thisMonth));
      const yearOrders = ordersData.filter(o => o.created_at?.startsWith(thisYear.toString()));

      const calculateTotal = (orders) => orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

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
        const s = (order.status || 'pending').toLowerCase();
        acc[s] = (acc[s] || 0) + 1;
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
        }).reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
        data.push({ name: `${hourStr}:00`, sales });
      }
    } else if (selectedPeriod === 'month') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const sales = orders.filter(o => o.created_at?.startsWith(dateStr))
          .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
        data.push({ name: date.getDate().toString(), sales });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toISOString().slice(0, 7);
        const sales = orders.filter(o => o.created_at?.startsWith(monthStr))
          .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
        data.push({ name: date.toLocaleString('default', { month: 'short' }), sales });
      }
    }
    setSalesData(data);
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      shipped: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      cancelled: 'bg-destructive/10 text-destructive dark:text-red-400 border-destructive/30'
    };
    return styles[status] || 'bg-muted text-muted-foreground border-border';
  };

  const tableHeaders = [
    { label: 'Order ID' },
    { label: 'Customer' },
    { label: 'Status' },
    { label: 'Amount' },
    { label: 'Action', className: 'text-center' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-muted-foreground">Loading store dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-card via-card to-primary/5 border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              Store Manager Dashboard
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-medium">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
            Welcome back, {adminUser?.username || 'Admin'} 👋
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Here is your live store performance, recent orders, and inventory overview.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => navigate('/admin/products/add')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
          >
            <Plus size={15} />
            <span>Add New Product</span>
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 px-4 py-2.5 bg-card hover:bg-muted text-foreground border border-border rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ShoppingBag size={15} />
            <span>Manage Orders</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard 
          icon={ShoppingBag} 
          title="Total Store Revenue" 
          value={stats.totalRevenue} 
          color="text-primary" 
          delay={0.1}
        />
        <AdminStatCard 
          icon={ShoppingBag} 
          title="Total Orders" 
          value={stats.totalOrders} 
          color="text-emerald-500" 
          delay={0.2}
        />
        <AdminStatCard 
          icon={Package} 
          title="Catalog Products" 
          value={stats.totalProducts} 
          color="text-blue-500" 
          delay={0.3}
        />
        <AdminStatCard 
          icon={MessageSquare} 
          title="Customer Inquiries" 
          value={stats.unreadMessages} 
          color="text-rose-500" 
          delay={0.4}
        />
      </div>

      {/* Charts Row: Revenue Trend + Order Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Revenue Analytics (Col 8) */}
        <div className="lg:col-span-8 bg-card text-card-foreground rounded-2xl p-6 border border-border/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight">Revenue Analytics</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Track your store earnings and revenue over time</p>
            </div>
            <div className="flex bg-muted/60 p-1 rounded-xl border border-border">
              {['day', 'month', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer
                    ${selectedPeriod === p 
                      ? 'bg-card shadow-xs text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {p === 'day' ? 'Hourly' : p === 'month' ? '30 Days' : '12 Months'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#134e35" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#134e35" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                />
                <Tooltip 
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Sales Revenue']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderRadius: '12px', 
                    border: '1px solid hsl(var(--border))', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    color: 'hsl(var(--foreground))',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#134e35" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution (Col 4) */}
        <div className="lg:col-span-4 bg-card text-card-foreground rounded-2xl p-6 border border-border/80 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">Order Distribution</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Status breakdown of all orders</p>
          </div>
          
          <div className="h-[180px] w-full relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
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
                    border: '1px solid hsl(var(--border))',
                    fontSize: '11px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-foreground">{stats.totalOrders}</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Orders</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/60">
            {orderStatusData.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full mr-2.5" style={{ backgroundColor: s.color }} />
                  <span className="font-medium text-muted-foreground">{s.name}</span>
                </div>
                <span className="font-bold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-card text-card-foreground rounded-2xl shadow-xs border border-border/80 overflow-hidden">
        <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/10">
          <div>
            <h2 className="text-base font-bold text-foreground">Recent Customer Orders</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest purchases made on the store</p>
          </div>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Orders</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
        
        <div className="p-0">
          <BaseTable 
            headers={tableHeaders} 
            isLoading={loading} 
            skeletonCount={3}
            data={recentOrders}
            emptyMessage="No recent orders found."
            renderRow={(order) => (
              <tr key={order.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3.5 align-middle">
                  <span 
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="font-bold text-foreground hover:text-primary font-mono text-xs cursor-pointer hover:underline"
                  >
                    #{order.id}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : 'Recent'}
                  </p>
                </td>
                
                <td className="px-4 py-3.5 align-middle">
                  <p className="font-semibold text-foreground text-xs">{order.customer_name || 'Guest User'}</p>
                  <p className="text-[10px] text-muted-foreground">{order.customer_email || order.customer_phone || 'No contact'}</p>
                </td>
                
                <td className="px-4 py-3.5 align-middle">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                
                <td className="px-4 py-3.5 align-middle">
                  <p className="font-bold text-foreground text-xs">₹{Number(order.total || 0).toLocaleString('en-IN')}</p>
                </td>
                
                <td className="px-4 py-3.5 align-middle text-center">
                  <button 
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                    title="View details"
                  >
                    <ArrowUpRight size={16} />
                  </button>
                </td>
              </tr>
            )}
          />
        </div>
      </div>

    </div>
  );
}

export default AdminDashboard;
