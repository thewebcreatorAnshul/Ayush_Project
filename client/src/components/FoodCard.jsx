import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Plus, Flame, Sparkles, Eye, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { QuickViewModal } from './QuickViewModal';

export const FoodCard = memo(({ food }) => {
  const { addToCart, cartItems } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const foodKey = String(food.id || food._id);
  const inCartItem = cartItems.find((item) => String(item.food || item._id || item.id) === foodKey);
  const cartQty = inCartItem ? inCartItem.quantity : 0;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
        
        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setIsQuickViewOpen(true)}>
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            loading="lazy"
          />

          {/* Quick View Floating Button */}
          <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <span className="bg-white/90 backdrop-blur-md text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick View</span>
            </span>
          </div>

          {/* Popular Tag */}
          {food.isPopular && (
            <div className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs flex items-center space-x-1 z-10">
              <Flame className="w-3 h-3 fill-white" />
              <span>Popular</span>
            </div>
          )}

          {/* In-Cart Badge */}
          {cartQty > 0 && (
            <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs flex items-center space-x-1 z-10">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>{cartQty} in Basket</span>
            </div>
          )}

          {/* Rating Tag */}
          <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center space-x-1 z-10 border border-slate-100">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{food.rating}</span>
          </div>

          {/* Category Pill */}
          <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md z-10">
            {food.category}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <Link to={`/food/${foodKey}`} className="block group-hover:text-amber-600 transition-colors">
              <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                {food.name}
              </h3>
            </Link>
            <p className="text-slate-500 text-xs line-clamp-2 mt-1 leading-relaxed">
              {food.description}
            </p>
          </div>

          {/* Meta details */}
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium pt-2 border-t border-slate-100/80">
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{food.prepTime || '20 min'}</span>
            </div>
            {food.calories && (
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{food.calories} kcal</span>
              </div>
            )}
          </div>

          {/* Price & Add to Cart button */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">Price</span>
              <span className="text-lg font-extrabold text-slate-900">
                ${Number(food.price).toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => addToCart(food)}
              className="flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              aria-label={`Add ${food.name} to basket`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        food={food}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
});
