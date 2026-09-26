import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Truck, ArrowRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export const OrderSuccessPage = () => {
  const { id } = useParams();

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner"
      >
        <CheckCircle2 className="w-14 h-14 stroke-[2.5]" />
      </motion.div>

      <div className="space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600">Order Confirmed!</span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Thank You For Ordering</h1>
        <p className="text-slate-500 text-sm">
          Your order <strong className="text-slate-900 font-bold">{id}</strong> has been received by the kitchen.
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left space-y-3">
        <div className="flex items-center space-x-3 text-slate-700 text-sm">
          <Truck className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <span>Estimated Delivery Time: <strong>30-35 mins</strong></span>
        </div>
        <p className="text-xs text-slate-400">
          You can track real-time kitchen preparation and delivery progress on our live tracker page.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          to={`/order-tracking/${id}`}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all"
        >
          <span>Track Order Live</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center space-x-2 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>

    </div>
  );
};
