import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Flame, Star, Sparkles, ChevronRight, Clock, ShieldCheck } from 'lucide-react';
import API from '../services/api';
import { FoodCard } from '../components/FoodCard';
import { FoodSkeleton } from '../components/FoodSkeleton';

const CATEGORIES = [
  { name: 'All', icon: '🍽️' },
  { name: 'Burgers', icon: '🍔' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Asian', icon: '🍜' },
  { name: 'Pasta', icon: '🍝' },
  { name: 'Salads', icon: '🥗' },
  { name: 'Desserts', icon: '🍰' },
  { name: 'Beverages', icon: '🧃' }
];

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await API.get('/foods?sort=popular&limit=6');
        if (res.data.success) {
          setFeaturedFoods(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching popular foods:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/menu');
    }
  };

  return (
    <div className="space-y-14 pb-16">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-500/10 via-slate-50/50 to-slate-50/50 pt-10 pb-16 rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-amber-500/10 text-amber-700 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gourmet Delivery Service</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Fresh Gourmet Meals, <span className="text-amber-500">Delivered Fast.</span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Handcrafted artisanal dishes prepared fresh on order by certified local chefs. Track your order live from kitchen to doorstep.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200/80 flex items-center space-x-2 max-w-lg mx-auto lg:mx-0"
              >
                <Search className="w-5 h-5 text-slate-400 ml-2.5 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search burgers, woodfired pizza, ramen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-0 px-2"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center space-x-1.5 flex-shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Stats */}
              <div className="pt-2 flex items-center justify-center lg:justify-start space-x-6 text-slate-600 text-xs font-semibold">
                <div className="flex items-center space-x-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>4.9 Rating (12k+ Reviews)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>35 Min Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5 relative">
              <div className="mx-auto max-w-sm lg:max-w-none">
                <img
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"
                  alt="Smash Cheeseburger"
                  className="rounded-2xl shadow-lg object-cover aspect-[4/3] w-full border-2 border-white"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Explore Categories</h2>
            <p className="text-slate-500 text-xs mt-0.5">Filter dishes by your favorite culinary craving</p>
          </div>
          <Link
            to="/menu"
            className="text-amber-500 hover:text-amber-600 font-bold text-xs flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={cat.name === 'All' ? '/menu' : `/menu?category=${encodeURIComponent(cat.name)}`}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200/70 hover:border-amber-400 text-slate-700 font-bold text-xs whitespace-nowrap transition-all flex-shrink-0 shadow-xs"
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Dishes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Trending Now</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Popular Dishes</h2>
          </div>
          <Link
            to="/menu?sort=popular"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors"
          >
            See Full Menu
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <FoodSkeleton key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredFoods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-slate-900 text-white py-14 rounded-2xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-1">
          <span className="text-[11px] uppercase font-bold tracking-widest text-amber-400">Simple 3-Step Experience</span>
          <h2 className="text-2xl font-black tracking-tight">How FeastDash Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black text-base flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="text-base font-bold">Select Fresh Dishes</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Browse our curated menu, customize item quantities, and add gourmet meals to your food cart.
            </p>
          </div>

          <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black text-base flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="text-base font-bold">Track Order Live</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Watch your order progress from Placed → Confirmed → Kitchen Prep → Picked Up in real-time.
            </p>
          </div>

          <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black text-base flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="text-base font-bold">Enjoy Hot & Fresh</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Receive your piping hot meal right at your door with complete contact-free delivery safety.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
