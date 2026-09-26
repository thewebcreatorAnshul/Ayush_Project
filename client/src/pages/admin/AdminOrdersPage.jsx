import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Eye,
  AlertCircle,
  X,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  DollarSign
} from 'lucide-react';
import AdminAPI from '../../services/adminApi';

const STATUSES = ['All', 'PLACED', 'CONFIRMED', 'PREPARING', 'PICKED UP', 'DELIVERED'];
const UPDATEABLE_STATUSES = ['PLACED', 'CONFIRMED', 'PREPARING', 'PICKED UP', 'DELIVERED'];

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());
      params.append('page', page);
      params.append('limit', 15);

      const res = await AdminAPI.get(`/orders?${params.toString()}`);
      if (res.data.success) {
        setOrders(res.data.data);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleStatusChange = async (orderId, nextStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await AdminAPI.patch(`/orders/${orderId}/status`, {
        status: nextStatus,
        note: `Status advanced to ${nextStatus} by Administrator`
      });

      if (res.data.success) {
        // Update state in place
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId || o._id === orderId ? { ...o, status: nextStatus } : o))
        );
        if (selectedOrder && (selectedOrder.orderId === orderId || selectedOrder._id === orderId)) {
          setSelectedOrder({ ...selectedOrder, status: nextStatus });
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80';
      case 'PICKED UP':
        return 'bg-blue-950/80 text-blue-400 border border-blue-800/80';
      case 'PREPARING':
        return 'bg-amber-950/80 text-amber-400 border border-amber-800/80';
      case 'CONFIRMED':
        return 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/80';
      case 'PLACED':
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Orders Fulfillment Management</h1>
          <p className="text-slate-400 text-xs">Track real-time orders and update kitchen preparation & delivery states.</p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID (ORD-...), customer phone, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </form>

          {/* Status Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
            {STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => { setStatusFilter(st); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
            <span>Loading orders...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400 text-xs space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto" />
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No customer orders found matching filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status & Transition</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((order) => {
                  const targetId = order.orderId || order._id;
                  const isUpdating = updatingId === targetId;

                  return (
                    <tr key={order._id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Order ID */}
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {order.orderId}
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-200 block">{order.user?.name || 'Customer'}</span>
                        <span className="text-[10px] text-slate-500 block">{order.deliveryAddress?.phone || order.user?.email || 'N/A'}</span>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-4">
                        <span className="text-slate-300 font-medium block">
                          {order.items?.length || 0} items
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-xs">
                          {order.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-bold text-white">
                        ${order.total?.toFixed(2)}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                          
                          {order.status !== 'DELIVERED' && (
                            <select
                              disabled={isUpdating}
                              value={order.status}
                              onChange={(e) => handleStatusChange(targetId, e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-40"
                            >
                              {UPDATEABLE_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  ➔ {st}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>

                      {/* Created Time */}
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Details View */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Inspect Order Breakdown"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {orders.length} of {totalCount} orders</span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-black text-white">Order Details</h2>
                <span className="text-xs text-amber-400 font-mono font-bold">{selectedOrder.orderId}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Address */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">Customer & Delivery Info</span>
              <p className="font-bold text-white text-sm">{selectedOrder.user?.name || 'Customer'}</p>
              <div className="flex items-center space-x-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedOrder.deliveryAddress?.phone || 'No phone'}</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                <span>
                  {selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.state} {selectedOrder.deliveryAddress?.zipCode}
                </span>
              </div>
              {selectedOrder.deliveryAddress?.instructions && (
                <p className="text-[11px] text-amber-400/90 italic">
                  Note: "{selectedOrder.deliveryAddress.instructions}"
                </p>
              )}
            </div>

            {/* Itemized list */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">Ordered Items</span>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center space-x-2.5">
                      <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover bg-slate-800" />
                      <div>
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-[10px] text-slate-400">Qty: {item.quantity} &times; ${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <span className="font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>${selectedOrder.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax (8%)</span>
                <span>${selectedOrder.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Fee</span>
                <span>${selectedOrder.deliveryFee?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white font-extrabold text-sm pt-1 border-t border-slate-800">
                <span>Total</span>
                <span>${selectedOrder.total?.toFixed(2)}</span>
              </div>
            </div>

            {/* Status changer in modal */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Update Status:</span>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder.orderId, e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-400 focus:outline-none"
              >
                {UPDATEABLE_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
