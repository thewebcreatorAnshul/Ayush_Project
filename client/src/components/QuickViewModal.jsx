import React, { useState } from 'react';
import { X, Star, Clock, Plus, Minus, ShoppingBag, Sparkles, Check, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export const QuickViewModal = ({ food, isOpen, onClose }) => {
  const { addToCart, cartItems } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!food) return null;

  const foodKey = String(food.id || food._id);
  const inCartItem = cartItems.find((item) => String(item.food || item._id || item.id) === foodKey);
  const currentInCartCount = inCartItem ? inCartItem.quantity : 0;

  const handleAdd = () => {
    addToCart(food, quantity);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-900 bg-white/80 backdrop-blur-xs rounded-full border border-slate-100 shadow-xs transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image Section */}
              <div className="relative aspect-square md:aspect-auto bg-slate-100 overflow-hidden">
                <img
                  src={food.image}
                  alt={food.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full">
                  {food.category}
                </div>
                {food.isPopular && (
                  <div className="absolute bottom-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center space-x-1 shadow-xs">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>Popular Choice</span>
                  </div>
                )}
              </div>

              {/* Info & Action Section */}
              <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-amber-500">${Number(food.price).toFixed(2)}</span>
                    <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200/60">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{food.rating}</span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    {food.name}
                  </h2>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {food.description}
                  </p>

                  {/* Attributes */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{food.prepTime || '20 min'}</span>
                    </span>

                    {food.calories && (
                      <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{food.calories} kcal</span>
                      </span>
                    )}

                    {food.dietary && food.dietary.map((tag) => (
                      <span key={tag} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {currentInCartCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
                      <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Currently {currentInCartCount} of this item in your basket</span>
                    </div>
                  )}
                </div>

                {/* Quantity & CTA */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity</span>
                    <div className="flex items-center space-x-3 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 text-xs shadow-xs cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-extrabold text-slate-900 w-6 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 text-xs shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAdd}
                    className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add {quantity} to Basket — ${(food.price * quantity).toFixed(2)}</span>
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
