import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Plus, Minus, ArrowLeft, ShoppingBag, Sparkles, Globe, UtensilsCrossed, ShieldCheck, Check } from 'lucide-react';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { FoodSkeleton } from '../components/FoodSkeleton';

export const FoodDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchFood = async () => {
      try {
        const res = await API.get(`/foods/${id}`);
        if (isMounted && res.data.success) {
          setFood(res.data.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Food item not found');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFood();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (food) {
      addToCart(food, quantity);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <FoodSkeleton />
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-3xl">
          🍲
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900">Dish Not Found</h2>
          <p className="text-slate-500 text-xs leading-relaxed">{error || 'The requested food item could not be retrieved from the catalog API.'}</p>
        </div>
        <button
          onClick={() => navigate('/menu')}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to dishes</span>
      </button>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-8 p-6 md:p-8">
        
        {/* Left: Food Image */}
        <div className="md:col-span-6 relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3.5 left-3.5 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold shadow-xs">
            {food.category}
          </div>
          {food.cuisine && (
            <div className="absolute top-3.5 right-3.5 bg-white/90 backdrop-blur-md text-slate-800 px-3 py-1 rounded-lg text-xs font-bold shadow-xs border border-slate-200/60 flex items-center space-x-1">
              <Globe className="w-3 h-3 text-amber-500" />
              <span>{food.cuisine}</span>
            </div>
          )}
        </div>

        {/* Right: Food Details & Order Controls */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                ${Number(food.price).toFixed(2)}
              </span>
              <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-800 px-3 py-1 rounded-lg text-xs font-bold border border-amber-200/80 shadow-2xs">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{food.rating} ({food.numReviews || 45} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {food.name}
            </h1>
            
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {food.description}
            </p>

            {/* Quick Meta Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center space-x-1 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/60">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Prep: {food.prepTime || '20 min'}</span>
              </div>

              {food.calories && (
                <div className="flex items-center space-x-1 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/60">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{food.calories} Calories</span>
                </div>
              )}

              {food.dietary && food.dietary.map((tag) => (
                <span key={tag} className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold px-3 py-1.5 rounded-xl">
                  {tag}
                </span>
              ))}
            </div>

            {/* Ingredients Section */}
            {food.ingredients && food.ingredients.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
                  <span>Key Ingredients</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {food.ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-lg"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity Selector & Add to Cart Button */}
          <div className="space-y-4 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Quantity</span>
              <div className="flex items-center space-x-3 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 text-xs shadow-2xs transition-all cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-extrabold text-slate-900 w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 text-xs shadow-2xs transition-all cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                addedNotice
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 active:scale-98 text-white'
              }`}
            >
              {addedNotice ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add {quantity} to Cart — ${(food.price * quantity).toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
