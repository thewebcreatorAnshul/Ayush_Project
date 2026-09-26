import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, DollarSign, Smartphone, MapPin, Lock, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';

export const CheckoutPage = () => {
  const { cartItems, subtotal, deliveryFee, tax, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [formData, setFormData] = useState({
    street: user?.address?.street || '742 Evergreen Terrace',
    city: user?.address?.city || 'Springfield',
    state: user?.address?.state || 'OR',
    zipCode: user?.address?.zipCode || '97477',
    phone: user?.phone || '+1 555-0144',
    instructions: 'Leave at front door'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.street || !formData.city || !formData.phone) {
      addToast('Please fill out address and phone number', 'error');
      return;
    }

    if (!isAuthenticated) {
      addToast('Please sign in to place your order', 'info');
      navigate('/login?redirect=/checkout');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          food: item.food || item._id,
          quantity: item.quantity
        })),
        deliveryAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: formData.phone,
          instructions: formData.instructions
        },
        paymentMethod,
        deliveryFee
      };

      const res = await API.post('/orders', orderPayload);

      if (res.data.success) {
        addToast('Order placed successfully!', 'success');
        clearCart();
        const createdOrder = res.data.data;
        navigate(`/order-success/${createdOrder.orderId || createdOrder._id}`);
      }
    } catch (err) {
      addToast(err.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-slate-500 text-xs sm:text-sm">Provide your delivery address and payment choice</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        
        {/* Left: Address & Payment */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Address Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Delivery Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700">Street Address *</label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="e.g. 123 Main St, Apt 4B"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">State / Zip Code</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="Zip"
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Contact Phone Number for Delivery Driver"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700">Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Leave at door, gate code, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Payment Option</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label
                onClick={() => setPaymentMethod('Card')}
                className={`p-3.5 rounded-xl border-2 flex flex-col items-center text-center space-y-1.5 cursor-pointer transition-all ${
                  paymentMethod === 'Card'
                    ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-500" />
                <span className="text-xs">Credit/Debit Card</span>
              </label>

              <label
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`p-3.5 rounded-xl border-2 flex flex-col items-center text-center space-y-1.5 cursor-pointer transition-all ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <span className="text-xs">Cash on Delivery</span>
              </label>

              <label
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3.5 rounded-xl border-2 flex flex-col items-center text-center space-y-1.5 cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Smartphone className="w-5 h-5 text-blue-500" />
                <span className="text-xs">Instant UPI</span>
              </label>
            </div>
          </div>

        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Order Items ({cartItems.length})</h2>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.food || item._id} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <span className="font-bold text-amber-600">{item.quantity}x</span>
                  <span className="font-medium text-slate-800 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3.5 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span className="font-bold text-slate-900">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (8%)</span>
              <span className="font-bold text-slate-900">${tax.toFixed(2)}</span>
            </div>
            <div className="pt-2.5 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
              <span>Total Amount</span>
              <span className="text-amber-500">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 disabled:opacity-50 text-white font-extrabold text-sm shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Confirm Order — ${total.toFixed(2)}</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-1.5 text-slate-400 text-xs justify-center pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted & Secure 256-Bit Checkout</span>
          </div>
        </div>

      </form>
    </div>
  );
};
