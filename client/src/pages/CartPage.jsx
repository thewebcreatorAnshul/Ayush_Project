import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, ShieldCheck, Tag, Sparkles, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    tax,
    total,
    totalCount
  } = useCart();

  const { addToast } = useToast();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    const code = promoCode.trim().toUpperCase();
    if (code === 'FEAST20' || code === 'WELCOME20') {
      setDiscountPercent(20);
      setAppliedCode(code);
      addToast('20% Discount Promo Applied!', 'success');
    } else if (code === 'SAVE10') {
      setDiscountPercent(10);
      setAppliedCode(code);
      addToast('10% Discount Promo Applied!', 'success');
    } else {
      addToast('Invalid promo code. Try "FEAST20"', 'error');
    }
  };

  const discountAmount = parseFloat(((subtotal * discountPercent) / 100).toFixed(2));
  const finalTotal = Math.max(0, parseFloat((total - discountAmount).toFixed(2)));

  // Free delivery progress calculation (Target $40)
  const freeDeliveryThreshold = 40;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-4xl shadow-inner"
        >
          🛒
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Basket is Empty</h2>
          <p className="text-slate-500 text-sm">
            Discover artisanal dishes prepared fresh on order by expert local chefs.
          </p>
        </div>
        <Link
          to="/menu"
          className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all"
        >
          <span>Explore Full Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Food Basket</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {totalCount} {totalCount === 1 ? 'item' : 'items'} ready for order
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Basket</span>
        </button>
      </div>

      {/* Free Delivery Banner */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700 flex items-center space-x-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              {amountToFreeDelivery > 0
                ? `Add $${amountToFreeDelivery.toFixed(2)} more to unlock FREE Delivery!`
                : '🎉 Congratulations! You have unlocked FREE Delivery!'}
            </span>
          </span>
          <span className="text-amber-600">{Math.round(freeDeliveryPercent)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${freeDeliveryPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Items List */}
        <div className="lg:col-span-7 space-y-4">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.food || item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex items-center space-x-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-2xl object-cover bg-slate-100 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-base truncate">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{item.category}</p>
                  <p className="text-amber-500 font-extrabold text-sm mt-1">
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => updateQuantity(item.food || item._id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 text-xs shadow-xs cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-extrabold text-slate-900 w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.food || item._id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 text-xs shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.food || item._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <Link
            to="/menu"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Add More Items from Menu</span>
          </Link>
        </div>

        {/* Right: Order Summary Card */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Order Summary</h2>

          {/* Promo Code Input Form */}
          <form onSubmit={handleApplyPromo} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Promo code (e.g. FEAST20)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Apply
            </button>
          </form>

          {appliedCode && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Code '{appliedCode}' ({discountPercent}% OFF)</span>
              </span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span className="font-bold text-slate-900">
                {amountToFreeDelivery <= 0 ? <span className="text-emerald-600 font-extrabold">FREE</span> : `$${deliveryFee.toFixed(2)}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Estimated Tax (8%)</span>
              <span className="font-bold text-slate-900">${tax.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-semibold">
                <span>Promo Discount ({discountPercent}%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-lg font-black text-slate-900">
              <span>Grand Total</span>
              <span className="text-amber-500">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-3 transition-colors cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-slate-400 text-xs justify-center pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Guaranteed Secure & Encrypted Checkout</span>
          </div>
        </div>

      </div>
    </div>
  );
};
