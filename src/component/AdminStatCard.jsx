import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowDownRight } from 'lucide-react';

const AdminStatCard = ({ icon: Icon, title, value, trend, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-card text-card-foreground rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
        <h3 className="text-3xl font-bold mt-2 text-foreground tabular-nums truncate">
          {typeof value === 'number' && (title.toLowerCase().includes('sales') || title.toLowerCase().includes('revenue')) 
            ? `₹${value.toLocaleString()}` 
            : value}
        </h3>
      </div>
      <div className={`p-3 rounded-xl bg-muted`}>
        <Icon size={20} className={color} />
      </div>
    </div>
    
    {trend !== undefined && (
      <div className="mt-6 flex items-center text-xs">
        {trend >= 0 ? (
          <span className="text-emerald-500 font-medium flex items-center bg-emerald-500/10 px-2 py-1 rounded-md">
            <TrendingUp size={12} className="mr-1" /> +{trend}% from last month
          </span>
        ) : (
          <span className="text-rose-500 font-medium flex items-center bg-rose-500/10 px-2 py-1 rounded-md">
            <ArrowDownRight size={12} className="mr-1" /> {Math.abs(trend)}% from last month
          </span>
        )}
      </div>
    )}
  </motion.div>
);

export default AdminStatCard;
