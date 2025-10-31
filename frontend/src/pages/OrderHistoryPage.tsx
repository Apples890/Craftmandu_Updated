import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, MessageCircle, Star } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { OrderApi } from '@/api/order.api';

type OrderRow = {
  id: string;
  order_number: string | null;
  placed_at: string;
  status: 'PENDING'|'PROCESSING'|'SHIPPED'|'DELIVERED'|'CANCELLED';
  total_cents: number;
  currency: string;
};

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        if (!token) { setOrders([]); return; }
        const res = await OrderApi.listMine(token);
        if (!mounted) return;
        setOrders(res.orders || []);
      } catch {
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  const getStatusIcon = (status: OrderRow['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'PROCESSING':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'SHIPPED':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'DELIVERED':
        return <Package className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: OrderRow['status']) => {
    switch (status) {
      case 'PENDING':
        return 'Order Pending';
      case 'PROCESSING':
        return 'Order Confirmed';
      case 'SHIPPED':
        return 'Shipped';
      case 'DELIVERED':
        return 'Delivered';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: OrderRow['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const delivered = orders.filter(o => o.status === 'DELIVERED').length;
    const inProgress = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
    const totalSpentNrs = Math.round(orders.reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100);
    return { totalOrders, delivered, inProgress, totalSpentNrs };
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">Track your orders and view past purchases</p>
        </motion.div>

        {(!loading && orders.length === 0) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <a href="/browse" className="btn-primary">
              Browse Products
            </a>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{summary.totalOrders}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{summary.delivered}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold"><span className="text-gray-600 mr-1">Nrs</span>{summary.totalSpentNrs.toLocaleString()}</p>
              </div>
            </div>
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Order #{order.order_number || order.id.slice(0,8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.placed_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2">{getStatusText(order.status)}</span>
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      <span className="text-gray-600 mr-1">Nrs</span>{Math.round((order.total_cents || 0)/100).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Order Items summary placeholder (detailed items fetch can be added later) */}
                <div className="text-sm text-gray-600 mb-6">Items details will appear here when enabled.</div>

                {/* Order Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="btn-secondary flex items-center justify-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>Track Order</span>
                  </button>
                  
                  {order.status === 'delivered' && (
                    <button className="btn-secondary flex items-center justify-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>Write Review</span>
                    </button>
                  )}
                  
                  <button className="btn-secondary flex items-center justify-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact Vendor</span>
                  </button>
                  
                  <button className="btn-primary flex items-center justify-center space-x-2">
                    <span>Buy Again</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
