import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  DollarSign,
  Users,
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import AdminAPI from '../../services/adminApi';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminAPI.get('/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80';
      case 'PICKED UP':
        return 'bg-blue-950/60 text-blue-400 border border-blue-800/80';
      case 'PREPARING':
        return 'bg-amber-950/60 text-amber-400 border border-amber-800/80';
      case 'CONFIRMED':
        return 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/80';
      case 'PLACED':
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-900 rounded-xl w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-950/40 border border-rose-800 rounded-2xl p-8 text-center max-w-md mx-auto space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="font-bold text-white text-base">Dashboard Error</h3>
        <p className="text-slate-400 text-xs">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Real-time telemetry, revenue analytics, and fulfillment health.</p>
        </div>

        <button
          onClick={fetchStats}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Revenue */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ${stats?.totalRevenue?.toFixed(2) || '0.00'}
            </span>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>Gross Completed Orders</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {stats?.totalOrders || 0}
            </span>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">
              <span>{stats?.pendingOrders || 0} currently in kitchen/delivery</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Customers */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Users</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Users className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {stats?.totalUsers || 0}
            </span>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">
              <span>Customer Accounts</span>
            </div>
          </div>
        </div>

        {/* Card 4: Catalog Products */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menu Products</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {stats?.totalProducts || 0}
            </span>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">
              <span>Across 8 Live Categories</span>
            </div>
          </div>
        </div>

      </div>

      {/* Fulfillment Status Pipeline Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Live Fulfillment Pipeline</h2>
          <span className="text-xs text-slate-400 font-mono">Status Telemetry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Placed</span>
            <span className="text-lg font-black text-white">{stats?.statusCounts?.PLACED || 0}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-bold text-indigo-400 uppercase block">2. Confirmed</span>
            <span className="text-lg font-black text-indigo-300">{stats?.statusCounts?.CONFIRMED || 0}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-bold text-amber-400 uppercase block">3. Preparing</span>
            <span className="text-lg font-black text-amber-300">{stats?.statusCounts?.PREPARING || 0}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-bold text-blue-400 uppercase block">4. Picked Up</span>
            <span className="text-lg font-black text-blue-300">{stats?.statusCounts?.PICKED_UP || 0}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase block">5. Delivered</span>
            <span className="text-lg font-black text-emerald-300">{stats?.statusCounts?.DELIVERED || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Orders & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-white">{order.orderId}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-200 block">{order.user?.name || 'Customer'}</span>
                        <span className="text-[10px] text-slate-500">{order.user?.email || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-white">${order.total.toFixed(2)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-500">
                      No customer orders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Quick Management</h2>
          <div className="space-y-2.5">
            <Link
              to="/admin/products"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-all text-xs text-slate-200 font-bold group"
            >
              <div className="flex items-center space-x-2.5">
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                <span>Manage Products</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
            </Link>

            <Link
              to="/admin/orders"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-all text-xs text-slate-200 font-bold group"
            >
              <div className="flex items-center space-x-2.5">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Process Orders</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-all text-xs text-slate-200 font-bold group"
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Customer Directory</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
            </Link>

            <Link
              to="/admin/settings"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-all text-xs text-slate-200 font-bold group"
            >
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Store Configurations</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
