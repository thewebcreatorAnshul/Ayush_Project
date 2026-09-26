import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, MapPin, Phone, Clock, ArrowRight, Loader2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get('/orders');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch order history:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          zipCode: profileForm.zipCode
        }
      });
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Profile Badge */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name}</h1>
            <p className="text-slate-500 text-xs sm:text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Order History ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Account Details
          </button>
        </div>
      </div>

      {/* Tab 1: Orders History */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Orders</h2>

          {loadingOrders ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
              <p className="mt-2 text-xs">Loading order history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-900 text-lg">No Past Orders Found</h3>
              <p className="text-slate-500 text-xs">When you place orders, they will appear here with live tracking.</p>
              <Link to="/menu" className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md">
                Order Meal Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => {
                const dateStr = new Date(ord.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <div
                    key={ord._id}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-extrabold text-slate-900 text-base">{ord.orderId || ord._id}</span>
                        <span
                          className={`text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${
                            ord.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 flex items-center space-x-2">
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span>{ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}</span>
                        <span>•</span>
                        <strong className="text-slate-900 font-bold">${ord.total.toFixed(2)}</strong>
                      </p>
                    </div>

                    <Link
                      to={`/order-tracking/${ord.orderId || ord._id}`}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-amber-500 text-white font-bold text-xs transition-colors inline-flex items-center justify-center space-x-2 flex-shrink-0"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile & Address Form */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Edit Profile & Address</h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Phone Number</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Default Delivery Address</h4>
              
              <input
                type="text"
                placeholder="Street Address"
                value={profileForm.street}
                onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900"
              />

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={profileForm.state}
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Zip"
                  value={profileForm.zipCode}
                  onChange={(e) => setProfileForm({ ...profileForm, zipCode: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md flex items-center justify-center space-x-2 transition-colors"
            >
              {updatingProfile ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
