import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit2, RefreshCw, Check, AlertCircle, X } from 'lucide-react';
import AdminAPI from '../../services/adminApi';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminAPI.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSubmitting(true);
    try {
      const res = await AdminAPI.post('/categories', { name: newCatName.trim() });
      if (res.data.success) {
        setNotification(`Category "${newCatName.trim()}" added successfully.`);
        setNewCatName('');
        fetchCategories();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to add category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    if (!confirm(`Are you sure you want to remove category "${categoryName}"?`)) return;

    try {
      const res = await AdminAPI.delete(`/categories/${encodeURIComponent(categoryName)}`);
      if (res.data.success) {
        setNotification(`Category "${categoryName}" removed.`);
        fetchCategories();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Category Taxonomy</h1>
        <p className="text-slate-400 text-xs">Configure and organize food catalog navigation categories.</p>
      </div>

      {/* Notification */}
      {notification && (
        <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Add New Category Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
          <Plus className="w-4 h-4 text-amber-500" />
          <span>Add New Category</span>
        </h2>
        
        <form onSubmit={handleCreateCategory} className="flex items-center gap-3">
          <input
            type="text"
            required
            placeholder="e.g. Gourmet Tacos, Bowls, BBQ..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={submitting || !newCatName.trim()}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40"
          >
            {submitting ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Categories Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Active Menu Categories</h2>
          <button
            onClick={fetchCategories}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-500 mb-1" />
            <span>Loading categories...</span>
          </div>
        ) : error ? (
          <div className="text-rose-400 text-xs text-center py-4">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between group hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs">{cat.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {cat.count} items in catalog
                    </span>
                  </div>
                </div>

                {cat.name !== 'All' && (
                  <button
                    onClick={() => handleDeleteCategory(cat.name)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title={`Delete ${cat.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
