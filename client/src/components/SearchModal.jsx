import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Utensils, ArrowRight, Loader2, Star, Plus } from 'lucide-react';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await API.get(`/foods?search=${encodeURIComponent(query.trim())}&limit=5`);
        if (res.data.success) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectFood = (id) => {
    onClose();
    navigate(`/food/${id}`);
  };

  const handleViewAll = () => {
    onClose();
    navigate(`/menu?search=${encodeURIComponent(query)}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Search Input */}
          <div className="p-4 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/50">
            <Search className="w-5 h-5 text-slate-400 ml-2" />
            <input
              type="text"
              autoFocus
              placeholder="Search dishes, burgers, pizza, pasta..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-0"
            />
            {loading ? (
              <Loader2 className="w-5 h-5 text-amber-500 animate-spin mr-2" />
            ) : (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Results Container */}
          <div className="max-h-96 overflow-y-auto p-4 space-y-2">
            {!query.trim() ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <Utensils className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>Type to search gourmet dishes instantly...</p>
              </div>
            ) : results.length === 0 && !loading ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No matching dishes found for "{query}".
              </div>
            ) : (
              results.map((item) => (
                <div
                  key={item.id || item._id}
                  onClick={() => handleSelectFood(item.id || item._id)}
                  className="p-3 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center space-x-2">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span className="flex items-center text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-500 mr-0.5" />
                          {item.rating}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-slate-900 text-sm">${Number(item.price).toFixed(2)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
                      title="Add to basket"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer CTA */}
          {query.trim() && results.length > 0 && (
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={handleViewAll}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center justify-center space-x-1 mx-auto"
              >
                <span>View all search results in Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
