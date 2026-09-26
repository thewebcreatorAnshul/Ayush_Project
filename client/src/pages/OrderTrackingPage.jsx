import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MapPin, Phone, RefreshCw, AlertCircle, FastForward, Package, Bike, ShieldAlert, CheckCircle2, Calendar } from 'lucide-react';
import API from '../services/api';
import { OrderStatusTracker } from '../components/OrderStatusTracker';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export const OrderTrackingPage = () => {
  const { id } = useParams();
  const { addToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  // Ref to track previous status for toast notification & animation triggers
  const prevStatusRef = useRef(null);

  const fetchOrderDetails = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await API.get(`/orders/${id}`);
      if (res.data.success) {
        const fetchedOrder = res.data.data;

        // Detect status change during polling
        if (prevStatusRef.current && prevStatusRef.current !== fetchedOrder.status) {
          addToast(`Order update: Status changed to ${fetchedOrder.status}!`, 'info');
        }
        prevStatusRef.current = fetchedOrder.status;

        setOrder(fetchedOrder);
        setError(null);
        setIsUnauthorized(false);
      }
    } catch (err) {
      if (!isSilent) {
        if (err.message && err.message.toLowerCase().includes('unauthorized')) {
          setIsUnauthorized(true);
        }
        setError(err.message || 'Failed to fetch order details');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Initial fetch + Polling every 3 seconds with cleanup on unmount
  useEffect(() => {
    fetchOrderDetails(false);

    const timer = setInterval(() => {
      fetchOrderDetails(true);
    }, 3000);

    // Cleanup timer on unmount to prevent memory leaks
    return () => {
      clearInterval(timer);
    };
  }, [id]);

  // Demo status advancement action trigger
  const handleAdvanceStatus = async () => {
    setAdvancing(true);
    try {
      const res = await API.post(`/orders/${id}/advance`);
      if (res.data.success) {
        const updated = res.data.data;
        if (prevStatusRef.current !== updated.status) {
          addToast(`Status advanced to ${updated.status}`, 'success');
          prevStatusRef.current = updated.status;
        }
        setOrder(updated);
      }
    } catch (err) {
      addToast(err.message || 'Could not advance status', 'error');
    } finally {
      setAdvancing(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto animate-spin">
          <RefreshCw className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Fetching Order Details...</h2>
        <p className="text-slate-400 text-xs">Connecting to live order telemetry server</p>
      </div>
    );
  }

  // Unauthorized State
  if (isUnauthorized) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-slate-500 text-xs">
          You do not have authorization to view order "{id}". Please log in with the correct user account.
        </p>
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Invalid / Error State
  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-slate-500 text-xs">
          {error || `No order matching ID '${id}' was found in database.`}
        </p>
        <div className="flex justify-center space-x-3 pt-2">
          <button
            onClick={() => fetchOrderDetails(false)}
            className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
          >
            Retry Fetch
          </button>
          <Link
            to="/menu"
            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  // Timestamps
  const estDate = new Date(order.estimatedDelivery);
  const formattedEstTime = estDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const createdTimeStr = new Date(order.createdAt).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const updatedTimeStr = new Date(order.updatedAt || order.createdAt).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
            <span>Order Reference:</span>
            <strong className="text-slate-900 font-extrabold">{order.orderId || order._id}</strong>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Live Order Status
          </h1>
        </div>

        {/* Action Controls: Live Polling indicator & Demo advance button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Live Polling (3s)</span>
          </div>

          <button
            onClick={handleAdvanceStatus}
            disabled={advancing || order.status === 'DELIVERED'}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-xs shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            title="Click to advance status for viva demo test"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{order.status === 'DELIVERED' ? 'Delivered' : 'Simulate Next Step'}</span>
          </button>
        </div>
      </div>

      {/* Visual Progress Timeline Tracker */}
      <OrderStatusTracker status={order.status} statusHistory={order.statusHistory} />

      {/* Timestamps Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-100 text-xs">
        <div className="flex items-center space-x-2 text-slate-600">
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>Placed: <strong>{createdTimeStr}</strong></span>
        </div>
        <div className="flex items-center space-x-2 text-slate-600">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>Estimated ETA: <strong>{formattedEstTime}</strong></span>
        </div>
        <div className="flex items-center space-x-2 text-slate-600">
          <RefreshCw className="w-4 h-4 text-blue-500" />
          <span>Last Updated: <strong>{updatedTimeStr}</strong></span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Ordered Items Breakdown */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <Package className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-lg">Items Ordered ({order.items.length})</h3>
          </div>

          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-3 truncate">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-slate-400 text-xs">Quantity: {item.quantity} x ${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span className="font-bold text-slate-900">${order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (8%)</span>
              <span className="font-bold text-slate-900">${order.tax.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
              <span>Total Paid</span>
              <span className="text-amber-500">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right: Delivery Info & Address */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Delivery Destination</span>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">{order.deliveryAddress?.street}</p>
              <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zipCode}</p>
              <p className="flex items-center space-x-1 pt-1 text-slate-500">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{order.deliveryAddress?.phone}</span>
              </p>
              {order.deliveryAddress?.instructions && (
                <p className="pt-2 text-amber-800 bg-amber-50 p-2 rounded-xl text-[11px] font-medium border border-amber-100">
                  Instruction: "{order.deliveryAddress.instructions}"
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
