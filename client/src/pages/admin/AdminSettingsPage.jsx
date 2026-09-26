import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, RefreshCw, AlertCircle, Store, ShieldCheck } from 'lucide-react';
import AdminAPI from '../../services/adminApi';

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    restaurantName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    taxRate: 8,
    deliveryFee: 3.99,
    freeDeliveryThreshold: 40.00,
    estimatedPrepTime: '20-30 min',
    isAcceptingOrders: true
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.get('/settings');
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await AdminAPI.put('/settings', settings);
      if (res.data.success) {
        setNotification('Store settings saved successfully.');
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
        <span>Loading configurations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">System & Store Settings</h1>
        <p className="text-slate-400 text-xs">Configure restaurant fulfillment rules, tax calculation, and operational status.</p>
      </div>

      {/* Notification */}
      {notification && (
        <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-xs">
        
        {/* Section 1: Business Identity */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-white font-extrabold text-sm border-b border-slate-800 pb-2">
            <Store className="w-4 h-4 text-amber-500" />
            <span>Store Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Restaurant Name</label>
              <input
                type="text"
                required
                value={settings.restaurantName}
                onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Support Email</label>
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Contact Phone</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Physical Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Fulfillment & Pricing Rules */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2 text-white font-extrabold text-sm border-b border-slate-800 pb-2">
            <Settings className="w-4 h-4 text-emerald-500" />
            <span>Fulfillment & Pricing Rules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Sales Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Standard Delivery Fee ($)</label>
              <input
                type="number"
                step="0.01"
                value={settings.deliveryFee}
                onChange={(e) => setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Free Delivery Above ($)</label>
              <input
                type="number"
                step="0.01"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Live Status */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2 text-white font-extrabold text-sm border-b border-slate-800 pb-2">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span>Operational Controls</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <span className="font-bold text-white text-xs block">Accepting Customer Orders</span>
              <span className="text-[11px] text-slate-400">Toggle online kitchen order placement on/off</span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isAcceptingOrders}
                onChange={(e) => setSettings({ ...settings, isAcceptingOrders: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving Settings...' : 'Save Configuration'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
