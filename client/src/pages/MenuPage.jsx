import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, RefreshCw, AlertCircle, X, ChevronLeft, ChevronRight, Sparkles, Filter } from 'lucide-react';
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

const DIETARY_OPTIONS = [
  { label: 'All Diets', value: 'All' },
  { label: '🌱 Vegetarian', value: 'Vegetarian' },
  { label: '🌿 Vegan', value: 'Vegan' },
  { label: '🌾 Gluten-Free', value: 'Gluten-Free' },
  { label: '🌶️ Spicy', value: 'Spicy' },
  { label: '🥗 Healthy', value: 'Healthy' }
];

export const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'popular';
  const initialCuisine = searchParams.get('cuisine') || 'All';
  const initialDietary = searchParams.get('dietary') || 'All';
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortOption, setSortOption] = useState(initialSort);
  const [selectedCuisine, setSelectedCuisine] = useState(initialCuisine);
  const [selectedDietary, setSelectedDietary] = useState(initialDietary);
  const [page, setPage] = useState(initialPage);
  
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [cuisinesList, setCuisinesList] = useState(['All']);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  const categoryScrollRef = useRef(null);

  // Sync state when URL params change (e.g. back/forward button)
  useEffect(() => {
    const cat = searchParams.get('category') || 'All';
    const q = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'popular';
    const cui = searchParams.get('cuisine') || 'All';
    const diet = searchParams.get('dietary') || 'All';
    const p = parseInt(searchParams.get('page'), 10) || 1;

    setSelectedCategory(cat);
    setSearchQuery(q);
    setSortOption(sort);
    setSelectedCuisine(cui);
    setSelectedDietary(diet);
    setPage(p);
  }, [searchParams]);

  // Fetch cuisines list once
  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        const res = await API.get('/foods/cuisines');
        if (res.data.success && Array.isArray(res.data.data)) {
          setCuisinesList(res.data.data);
        }
      } catch (e) {
        console.warn('Failed to load cuisines list:', e.message);
      }
    };
    fetchCuisines();
  }, []);

  // Fetch foods from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchMenu = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'All') {
          params.append('category', selectedCategory);
        }
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim());
        }
        if (sortOption && sortOption !== 'popular') {
          params.append('sort', sortOption);
        }
        if (selectedCuisine && selectedCuisine !== 'All') {
          params.append('cuisine', selectedCuisine);
        }
        if (selectedDietary && selectedDietary !== 'All') {
          params.append('dietary', selectedDietary);
        }
        params.append('page', page);
        params.append('limit', 12);

        const res = await API.get(`/foods?${params.toString()}`);
        if (isMounted && res.data.success) {
          setFoods(res.data.data);
          setTotalPages(res.data.pages || 1);
          setTotalCount(res.data.total || 0);
          if (res.data.categoryCounts) {
            setCategoryCounts(res.data.categoryCounts);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Unable to load menu. Please check your connection.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMenu();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery, sortOption, selectedCuisine, selectedDietary, page]);

  // Helper to push state to URL
  const updateUrl = (overrides = {}) => {
    const nextState = {
      category: selectedCategory,
      search: searchQuery,
      sort: sortOption,
      cuisine: selectedCuisine,
      dietary: selectedDietary,
      page: 1,
      ...overrides
    };

    const params = new URLSearchParams();
    if (nextState.category && nextState.category !== 'All') params.set('category', nextState.category);
    if (nextState.search && nextState.search.trim()) params.set('search', nextState.search.trim());
    if (nextState.sort && nextState.sort !== 'popular') params.set('sort', nextState.sort);
    if (nextState.cuisine && nextState.cuisine !== 'All') params.set('cuisine', nextState.cuisine);
    if (nextState.dietary && nextState.dietary !== 'All') params.set('dietary', nextState.dietary);
    if (nextState.page && nextState.page > 1) params.set('page', nextState.page);

    setSearchParams(params);
  };

  const handleCategoryChange = (categoryName) => {
    setSelectedCategory(categoryName);
    setPage(1);
    updateUrl({ category: categoryName, page: 1 });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setPage(1);
    updateUrl({ search: val, page: 1 });
  };

  const handleSortChange = (e) => {
    const sort = e.target.value;
    setSortOption(sort);
    setPage(1);
    updateUrl({ sort, page: 1 });
  };

  const handleCuisineChange = (e) => {
    const cuisine = e.target.value;
    setSelectedCuisine(cuisine);
    setPage(1);
    updateUrl({ cuisine, page: 1 });
  };

  const handleDietaryChange = (diet) => {
    setSelectedDietary(diet);
    setPage(1);
    updateUrl({ dietary: diet, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrl({ page: newPage });
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortOption('popular');
    setSelectedCuisine('All');
    setSelectedDietary('All');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategory !== 'All' || searchQuery.trim() !== '' || sortOption !== 'popular' || selectedCuisine !== 'All' || selectedDietary !== 'All';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-amber-600 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Live Food Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Explore Full Menu
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Browse authentic gourmet dishes and beverages powered directly by our live food catalog API.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-900 block">{totalCount} Dishes Available</span>
            <span className="text-[11px] text-slate-400">Page {page} of {totalPages}</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-slate-200/60"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Filter and Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Row 1: Search, Sort & Quick Toggles */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes by name, ingredients, cuisine (e.g., burger, ramen, margherita)..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); updateUrl({ search: '' }); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls: Cuisine, Sort, More Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Cuisine Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cuisine:</span>
              <select
                value={selectedCuisine}
                onChange={handleCuisineChange}
                aria-label="Filter by Cuisine"
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                {cuisinesList.map((cui) => (
                  <option key={cui} value={cui}>
                    {cui === 'All' ? 'All Cuisines' : cui}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sort:</span>
              <select
                value={sortOption}
                onChange={handleSortChange}
                aria-label="Sort dishes"
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Responsive Category Pills (Horizontally scrollable on mobile) */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div
            ref={categoryScrollRef}
            className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth w-full"
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              const count = categoryCounts[cat.name];
              return (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30 ring-2 ring-amber-500/20'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/50'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.name}</span>
                  {count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Dietary Tags Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">Dietary:</span>
          {DIETARY_OPTIONS.map((opt) => {
            const isSelected = selectedDietary === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleDietaryChange(opt.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Main Dishes Grid / States */}
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span>Fetching live API data...</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <FoodSkeleton key={n} />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-10 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-lg">Unable to load menu</h3>
            <p className="text-slate-600 text-xs leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => {
              setPage(1);
              setSelectedCategory('All');
              setSearchQuery('');
              setSearchParams({});
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
        </div>
      ) : foods.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-3xl">
            🍲
          </div>
          <div className="space-y-1.5">
            <h3 className="font-black text-slate-900 text-lg">No items found in this category</h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
              We couldn't find any dishes matching your current filter criteria:
              <span className="font-semibold text-slate-700 block mt-1">
                Category: "{selectedCategory}" {searchQuery ? `| Search: "${searchQuery}"` : ''} {selectedCuisine !== 'All' ? `| Cuisine: "${selectedCuisine}"` : ''}
              </span>
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center space-x-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear Filters & Show All Menu</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Results Header Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Showing {foods.length} of {totalCount} dishes in <strong className="text-slate-800">{selectedCategory}</strong></span>
            <span>Sorted by: <strong className="text-slate-800 capitalize">{sortOption.replace('_', ' ')}</strong></span>
          </div>

          {/* Grid of Dishes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {foods.map((food) => (
              <FoodCard key={food.id || food._id} food={food} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500">
                Showing page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong> ({totalCount} total dishes)
              </span>

              <div className="flex items-center space-x-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center space-x-1 shadow-2xs transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-1 text-slate-400 text-xs font-bold">…</span>
                        )}
                        <button
                          onClick={() => handlePageChange(p)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            page === p
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center space-x-1 shadow-2xs transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
