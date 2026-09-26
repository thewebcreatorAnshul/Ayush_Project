// External Food API Gateway Service & Abstraction Layer
// Encapsulates all external recipe/food providers (DummyJSON, TheMealDB, TheCocktailDB)
// Exposes clean domain methods: getFoods, getFoodById, searchFoods, getFoodsByCategory, getCategories, getCuisines
// Implements 5-minute in-memory caching and graceful offline fallback.

const fetch = globalThis.fetch || require('node-fetch');

// Standard 8 Categories
const STANDARD_CATEGORIES = ['All', 'Burgers', 'Pizza', 'Asian', 'Pasta', 'Salads', 'Desserts', 'Beverages'];

// Memory cache store
let memoryCache = {
  foods: null,
  categories: null,
  cuisines: null,
  lastFetched: 0
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

// Helper to extract ingredients from MealDB meal object
const extractMealDbIngredients = (meal) => {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push(measure && measure.trim() ? `${measure.trim()} ${ing.trim()}` : ing.trim());
    }
  }
  return ingredients;
};

// Deterministic price calculation based on ID, name hash and category base
const calculateDeterministicPrice = (seedId, name = '', category = '') => {
  const numId = parseInt(String(seedId).replace(/\D/g, ''), 10) || 100;
  const nameHash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), numId * 13);
  
  let basePrice = 11.99;
  if (category === 'Beverages') basePrice = 4.99;
  else if (category === 'Desserts') basePrice = 7.49;
  else if (category === 'Salads') basePrice = 9.99;
  else if (category === 'Pizza') basePrice = 13.99;
  else if (category === 'Burgers') basePrice = 12.49;
  else if (category === 'Pasta') basePrice = 13.50;
  else if (category === 'Asian') basePrice = 14.00;

  const variance = (nameHash % 550) / 100; // $0.00 to $5.50
  return parseFloat((basePrice + variance).toFixed(2));
};

// Map raw metadata to standard 8 categories
const mapToStandardCategory = (name = '', cuisineOrArea = '', rawCategory = '', tags = []) => {
  const n = (name || '').toLowerCase();
  const a = (cuisineOrArea || '').toLowerCase();
  const c = (rawCategory || '').toLowerCase();
  const t = (tags || []).map(tag => (tag || '').toLowerCase());

  // 1. Pizza & Italian flatbreads / calzones / savory pies
  if (n.includes('pizza') || t.includes('pizza') || n.includes('calzone') || n.includes('flatbread') || n.includes('focaccia') || n.includes('bruschetta') || (n.includes('pie') && (c === 'beef' || c === 'chicken' || c === 'pork' || a === 'italian'))) {
    if (n.includes('apple pie') || n.includes('pecan pie') || n.includes('key lime pie') || n.includes('sugar pie') || n.includes('pumpkin pie') || n.includes('banana pie') || c === 'dessert') {
      return 'Desserts';
    }
    return 'Pizza';
  }

  // 2. Burgers, Gourmet Sandwiches, Sliders & Patties
  if (n.includes('burger') || t.includes('burger') || n.includes('slider') || n.includes('sandwich') || n.includes('bap') || n.includes('patty') || n.includes('sub') || n.includes('steak') || (c === 'beef' && (n.includes('beef') || n.includes('meat') || n.includes('roast')))) {
    return 'Burgers';
  }

  // 3. Pasta & Italian Noodles
  if (c === 'pasta' || t.includes('pasta') || n.includes('pasta') || n.includes('spaghetti') || n.includes('lasagna') || n.includes('linguine') || n.includes('fettuccine') || n.includes('penne') || n.includes('carbonara') || n.includes('rigatoni') || n.includes('macaroni') || n.includes('gnocchi') || n.includes('ravioli') || n.includes('tortellini') || n.includes('tagliatelle') || n.includes('cannelloni') || n.includes('orzo')) {
    return 'Pasta';
  }

  // 4. Salads & Fresh Greens Bowls
  if (n.includes('salad') || t.includes('salad') || n.includes('slaw') || n.includes('tabbouleh') || n.includes('fattoush') || n.includes('caesar') || n.includes('caprese') || (c === 'side' && (n.includes('vegetable') || n.includes('greens') || n.includes('beans') || n.includes('cucumber') || n.includes('tomato')))) {
    return 'Salads';
  }

  // 5. Desserts & Sweet Delights
  if (c === 'dessert' || t.includes('dessert') || n.includes('cake') || n.includes('tart') || n.includes('pudding') || n.includes('cookie') || n.includes('brownie') || n.includes('ice cream') || n.includes('mousse') || n.includes('cheesecake') || n.includes('tiramisu') || n.includes('custard') || n.includes('waffle') || n.includes('pancake') || n.includes('churros') || n.includes('souffle') || n.includes('crumble') || n.includes('pastry') || n.includes('donut') || n.includes('fudge') || n.includes('biscuit') || n.includes('eclair') || n.includes('trifle') || n.includes('fondant') || n.includes('pavlova')) {
    return 'Desserts';
  }

  // 6. Beverages & Refreshers
  if (c.includes('drink') || c.includes('cocktail') || c.includes('beverage') || t.includes('drink') || t.includes('beverage') || n.includes('smoothie') || n.includes('juice') || n.includes('shake') || n.includes('tea') || n.includes('coffee') || n.includes('lemonade') || n.includes('punch') || n.includes('cooler') || n.includes('mocktail') || n.includes('cider') || n.includes('soda') || n.includes('frappe')) {
    return 'Beverages';
  }

  // 7. Asian & World Bowls
  if (['chinese', 'japanese', 'indian', 'thai', 'vietnamese', 'malaysian', 'filipino', 'korean', 'asian'].includes(a) ||
      n.includes('ramen') || n.includes('curry') || n.includes('noodle') || n.includes('sushi') || n.includes('dumpling') || n.includes('fried rice') || n.includes('tikka') || n.includes('tandoori') || n.includes('biryani') || n.includes('pad thai') || n.includes('stir fry') || n.includes('teriyaki') || n.includes('katsu') || n.includes('dim sum') || n.includes('spring roll') || n.includes('pho') || n.includes('udon') || n.includes('soba') || n.includes('chow mein') || n.includes('bao') || n.includes('bibimbap') || n.includes('satay') || n.includes('dosa') || n.includes('paneer') || n.includes('masala')) {
    return 'Asian';
  }

  // Fallbacks
  if (c === 'side' || c === 'starter') return 'Salads';
  if (c === 'beef' || c === 'pork') return 'Burgers';
  if (c === 'chicken' || c === 'seafood') return 'Asian';

  return 'Burgers';
};

// Extract dietary tags
const extractDietaryTags = (name, tags = [], ingredients = [], category = '') => {
  const n = (name || '').toLowerCase();
  const t = (tags || []).map(x => (x || '').toLowerCase());
  const i = (ingredients || []).map(x => (x || '').toLowerCase());
  const dietary = [];

  const isVeg = t.includes('vegetarian') || n.includes('vegetarian') || n.includes('margherita') || n.includes('veggie') || n.includes('paneer') || category === 'Salads' || category === 'Desserts' || category === 'Beverages';
  const isVegan = t.includes('vegan') || n.includes('vegan') || t.includes('plant-based');
  const isGlutenFree = t.includes('gluten-free') || n.includes('gluten free');
  const isSpicy = n.includes('spicy') || n.includes('chilli') || n.includes('chili') || n.includes('hot') || n.includes('curry') || n.includes('jalapeño') || t.includes('spicy');
  const isHealthy = category === 'Salads' || t.includes('healthy') || n.includes('salad') || n.includes('avocado') || n.includes('smoothie');

  if (isVeg) dietary.push('Vegetarian');
  if (isVegan) dietary.push('Vegan');
  if (isGlutenFree) dietary.push('Gluten-Free');
  if (isSpicy) dietary.push('Spicy');
  if (isHealthy) dietary.push('Healthy');

  return dietary.length > 0 ? dietary : ['Gourmet Special'];
};

// Normalizers
const normalizeDummyJson = (recipe) => {
  const category = mapToStandardCategory(recipe.name, recipe.cuisine, recipe.mealType?.[0] || '', recipe.tags || []);
  const price = calculateDeterministicPrice(recipe.id, recipe.name, category);
  const dietary = extractDietaryTags(recipe.name, recipe.tags || [], recipe.ingredients || [], category);
  const rating = parseFloat((recipe.rating || 4.7).toFixed(1));
  const desc = recipe.instructions
    ? (Array.isArray(recipe.instructions) ? recipe.instructions.slice(0, 2).join(' ') : String(recipe.instructions))
    : `${recipe.name} made with authentic ingredients and artisanal chef styling.`;

  const foodId = String(recipe.id);

  return {
    id: foodId,
    _id: foodId,
    name: recipe.name,
    description: desc,
    price,
    image: recipe.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    category,
    cuisine: recipe.cuisine || 'Continental',
    rating,
    numReviews: recipe.reviewCount || 48,
    prepTime: `${recipe.prepTimeMinutes || 20} min`,
    calories: recipe.caloriesPerServing || 520,
    ingredients: recipe.ingredients || [],
    tags: recipe.tags || [category],
    dietary,
    isPopular: rating >= 4.7 || (recipe.reviewCount || 0) > 50,
    availability: true,
    source: 'DummyJSON'
  };
};

const normalizeMealDb = (meal) => {
  const tags = meal.strTags ? meal.strTags.split(',').map(t => t.trim()) : [];
  const category = mapToStandardCategory(meal.strMeal, meal.strArea, meal.strCategory, tags);
  const numId = parseInt(meal.idMeal, 10) || 50000;
  const price = calculateDeterministicPrice(numId, meal.strMeal, category);
  const ingredients = extractMealDbIngredients(meal);
  const dietary = extractDietaryTags(meal.strMeal, tags, ingredients, category);
  const rating = parseFloat((4.5 + ((numId % 5) / 10)).toFixed(1));
  const numReviews = 25 + (numId % 80);

  let desc = meal.strInstructions ? meal.strInstructions.split('. ').slice(0, 2).join('. ') : '';
  if (!desc || desc.length < 20) {
    desc = `Authentic ${meal.strArea || 'gourmet'} ${meal.strMeal} prepared fresh on order with high-quality ingredients.`;
  } else {
    desc = desc + '.';
  }

  const foodId = String(meal.idMeal);

  return {
    id: foodId,
    _id: foodId,
    name: meal.strMeal,
    description: desc,
    price,
    image: meal.strMealThumb,
    category,
    cuisine: meal.strArea || 'International',
    rating,
    numReviews,
    prepTime: `${15 + (numId % 20)} min`,
    calories: 380 + (numId % 400),
    ingredients: ingredients.length > 0 ? ingredients : [meal.strMeal],
    tags: tags.length > 0 ? tags : [category, meal.strArea || 'Specialty'],
    dietary,
    isPopular: rating >= 4.8 || numReviews > 70,
    availability: true,
    source: 'TheMealDB'
  };
};

const normalizeCocktailDb = (drink) => {
  const numId = parseInt(drink.idDrink, 10) || 10000;
  const price = calculateDeterministicPrice(numId, drink.strDrink, 'Beverages');
  const rating = parseFloat((4.6 + ((numId % 4) / 10)).toFixed(1));
  const numReviews = 20 + (numId % 60);

  const foodId = String(drink.idDrink);

  return {
    id: foodId,
    _id: foodId,
    name: drink.strDrink,
    description: `Refreshing handcrafted ${drink.strDrink} served chilled with fresh ingredients and artisanal ice styling.`,
    price,
    image: drink.strDrinkThumb,
    category: 'Beverages',
    cuisine: 'Beverage Bar',
    rating,
    numReviews,
    prepTime: '5-10 min',
    calories: 120 + (numId % 180),
    ingredients: ['Fresh fruit essence', 'Chilled ice', 'Sparkling water', 'Natural garnish'],
    tags: ['Beverages', 'Refreshing', 'Chilled'],
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Healthy'],
    isPopular: rating >= 4.8,
    availability: true,
    source: 'TheCocktailDB'
  };
};

// Fetch and cache all external items from upstream providers
const fetchAllRawFoods = async () => {
  const now = Date.now();
  if (memoryCache.foods && (now - memoryCache.lastFetched < CACHE_TTL_MS)) {
    return memoryCache.foods;
  }

  const allFoods = [];
  const seenIds = new Set();
  const seenNames = new Set();

  const addUniqueFood = (food) => {
    const normName = food.name.trim().toLowerCase();
    if (!seenIds.has(String(food.id)) && !seenNames.has(normName)) {
      seenIds.add(String(food.id));
      seenNames.add(normName);
      allFoods.push(food);
    }
  };

  try {
    // 1. Fetch DummyJSON recipes
    try {
      const dummyRes = await fetch('https://dummyjson.com/recipes?limit=0', { timeout: 5000 });
      if (dummyRes.ok) {
        const dummyData = await dummyRes.json();
        if (dummyData.recipes && Array.isArray(dummyData.recipes)) {
          dummyData.recipes.forEach(r => addUniqueFood(normalizeDummyJson(r)));
        }
      }
    } catch (err) {
      console.warn('[Food API] DummyJSON fetch failed:', err.message);
    }

    // 2. Fetch TheMealDB items
    const letters = ['b', 'c', 'p', 's', 'm', 't', 'r', 'l', 'k', 'd', 'f', 'g', 'h'];
    await Promise.allSettled(
      letters.map(async (l) => {
        try {
          const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${l}`, { timeout: 4000 });
          if (res.ok) {
            const data = await res.json();
            if (data.meals && Array.isArray(data.meals)) {
              data.meals.forEach(m => addUniqueFood(normalizeMealDb(m)));
            }
          }
        } catch (e) {
          // ignore single letter timeout
        }
      })
    );

    // 3. Fetch TheMealDB Pasta category
    try {
      const pastaRes = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Pasta', { timeout: 4000 });
      if (pastaRes.ok) {
        const pastaData = await pastaRes.json();
        if (pastaData.meals && Array.isArray(pastaData.meals)) {
          pastaData.meals.forEach(m => {
            if (!seenIds.has(String(m.idMeal)) && !seenNames.has(m.strMeal.trim().toLowerCase())) {
              addUniqueFood(normalizeMealDb({
                ...m,
                strCategory: 'Pasta',
                strArea: 'Italian',
                strInstructions: `Delicious artisanal ${m.strMeal} tossed with Italian herbs and seasonings.`
              }));
            }
          });
        }
      }
    } catch (e) {
      console.warn('[Food API] TheMealDB Pasta fetch failed:', e.message);
    }

    // 4. Fetch TheCocktailDB Non-Alcoholic Beverages
    try {
      const drinksRes = await fetch('https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic', { timeout: 4000 });
      if (drinksRes.ok) {
        const drinksData = await drinksRes.json();
        if (drinksData.drinks && Array.isArray(drinksData.drinks)) {
          drinksData.drinks.forEach(d => addUniqueFood(normalizeCocktailDb(d)));
        }
      }
    } catch (e) {
      console.warn('[Food API] TheCocktailDB fetch failed:', e.message);
    }

    if (allFoods.length === 0) {
      throw new Error('All external food API endpoints returned empty datasets');
    }

    // Update memory cache
    memoryCache.foods = allFoods;
    memoryCache.lastFetched = now;

    return allFoods;
  } catch (err) {
    console.warn(`[Food API Warning] API fetch issue (${err.message}). Using fallback dataset.`);
    if (memoryCache.foods && memoryCache.foods.length > 0) {
      return memoryCache.foods;
    }
    return getFallbackFoodDataset();
  }
};

// ==========================================
// ABSTRACTION LAYER INTERFACE METHODS
// ==========================================

/**
 * Get foods with flexible search, category, cuisine, dietary, pricing, sorting, and pagination
 * @param {Object} options
 */
const getFoods = async (options = {}) => {
  const {
    search,
    category,
    cuisine,
    dietary,
    minPrice,
    maxPrice,
    minRating,
    sort = 'popular',
    page = 1,
    limit = 12
  } = options;

  const allFoods = await fetchAllRawFoods();
  let filtered = [...allFoods];

  // 1. Search Filter
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.cuisine.toLowerCase().includes(q) ||
        (f.tags && f.tags.some((t) => t.toLowerCase().includes(q))) ||
        (f.ingredients && f.ingredients.some((i) => i.toLowerCase().includes(q)))
    );
  }

  // 2. Category Filter
  if (category && category.toLowerCase() !== 'all') {
    const catLower = category.toLowerCase();
    filtered = filtered.filter((f) => f.category.toLowerCase() === catLower);
  }

  // 3. Cuisine Filter
  if (cuisine && cuisine.toLowerCase() !== 'all') {
    const cuiLower = cuisine.toLowerCase();
    filtered = filtered.filter((f) => f.cuisine.toLowerCase() === cuiLower);
  }

  // 4. Dietary Tag Filter
  if (dietary && dietary.toLowerCase() !== 'all') {
    const dietLower = dietary.toLowerCase();
    filtered = filtered.filter(
      (f) => f.dietary && f.dietary.some((d) => d.toLowerCase() === dietLower)
    );
  }

  // 5. Price Range Filter
  if (minPrice !== undefined && minPrice !== '') {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) filtered = filtered.filter((f) => f.price >= min);
  }
  if (maxPrice !== undefined && maxPrice !== '') {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) filtered = filtered.filter((f) => f.price <= max);
  }

  // 6. Rating Filter
  if (minRating !== undefined && minRating !== '') {
    const r = parseFloat(minRating);
    if (!isNaN(r)) filtered = filtered.filter((f) => f.rating >= r);
  }

  // 7. Sorting
  switch (sort) {
    case 'price_asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'name_asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name_desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'popular':
    default:
      filtered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || b.rating - a.rating);
      break;
  }

  // 8. Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 12);
  const total = filtered.length;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIndex, startIndex + limitNum);

  // Category counts from full dataset
  const categoryCounts = { All: allFoods.length };
  STANDARD_CATEGORIES.forEach((cat) => {
    if (cat !== 'All') {
      categoryCounts[cat] = allFoods.filter((f) => f.category.toLowerCase() === cat.toLowerCase()).length;
    }
  });

  return {
    foods: paginated,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    count: paginated.length,
    categoryCounts
  };
};

/**
 * Get single food by ID
 * @param {string} id
 */
const getFoodById = async (id) => {
  const allFoods = await fetchAllRawFoods();
  return allFoods.find((f) => String(f.id) === String(id) || String(f._id) === String(id)) || null;
};

/**
 * Search foods by query string
 * @param {string} query
 * @param {Object} options
 */
const searchFoods = async (query, options = {}) => {
  return getFoods({ ...options, search: query });
};

/**
 * Get foods filtered by category
 * @param {string} category
 * @param {Object} options
 */
const getFoodsByCategory = async (category, options = {}) => {
  return getFoods({ ...options, category });
};

/**
 * Get list of standard categories with item counts
 */
const getCategories = async () => {
  const allFoods = await fetchAllRawFoods();
  const counts = { All: allFoods.length };

  STANDARD_CATEGORIES.forEach((cat) => {
    if (cat !== 'All') {
      counts[cat] = allFoods.filter((f) => f.category.toLowerCase() === cat.toLowerCase()).length;
    }
  });

  return STANDARD_CATEGORIES.map((cat) => ({
    name: cat,
    count: counts[cat] || 0
  }));
};

/**
 * Get list of available cuisines
 */
const getCuisines = async () => {
  const allFoods = await fetchAllRawFoods();
  const cuisinesSet = new Set();

  allFoods.forEach((f) => {
    if (f.cuisine && f.cuisine.trim() && f.cuisine !== 'Continental' && f.cuisine !== 'International') {
      cuisinesSet.add(f.cuisine.trim());
    }
  });

  return ['All', ...Array.from(cuisinesSet).sort()];
};

// Fallback high-quality curated dataset if external network is disconnected
const getFallbackFoodDataset = () => {
  const fallback = [
    {
      id: "1",
      name: "Classic Margherita Pizza",
      description: "San Marzano tomatoes, fresh mozzarella, basil leaves, extra virgin olive oil.",
      price: 14.99,
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
      category: "Pizza",
      cuisine: "Italian",
      rating: 4.8,
      numReviews: 95,
      prepTime: "20 min",
      calories: 780,
      ingredients: ["Pizza dough", "San Marzano tomatoes", "Mozzarella", "Fresh basil"],
      tags: ["Pizza", "Italian", "Vegetarian"],
      dietary: ["Vegetarian"],
      isPopular: true,
      availability: true
    },
    {
      id: "2",
      name: "Truffle Smash Cheeseburger",
      description: "Double Angus beef patties, aged cheddar, black truffle aioli, caramelised onions.",
      price: 15.50,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
      category: "Burgers",
      cuisine: "American",
      rating: 4.9,
      numReviews: 128,
      prepTime: "15 min",
      calories: 850,
      ingredients: ["Angus beef", "Aged cheddar", "Truffle aioli", "Brioche bun"],
      tags: ["Burgers", "American"],
      dietary: ["Chef Special"],
      isPopular: true,
      availability: true
    },
    {
      id: "3",
      name: "Tonkotsu Pork Ramen",
      description: "Rich pork broth, thin noodles, chashu pork belly, ajitsuke tamago egg, bamboo shoots.",
      price: 16.25,
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
      category: "Asian",
      cuisine: "Japanese",
      rating: 4.8,
      numReviews: 110,
      prepTime: "25 min",
      calories: 680,
      ingredients: ["Ramen noodles", "Pork broth", "Chashu pork", "Soft-boiled egg"],
      tags: ["Asian", "Japanese", "Ramen"],
      dietary: ["Chef Special"],
      isPopular: true,
      availability: true
    },
    {
      id: "4",
      name: "Creamy Fettuccine Carbonara",
      description: "Al dente fettuccine pasta, crispy guanciale, egg yolk cream, Pecorino Romano.",
      price: 14.50,
      image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80",
      category: "Pasta",
      cuisine: "Italian",
      rating: 4.7,
      numReviews: 73,
      prepTime: "20 min",
      calories: 820,
      ingredients: ["Fettuccine", "Guanciale", "Pecorino Romano", "Egg yolk"],
      tags: ["Pasta", "Italian"],
      dietary: ["Chef Special"],
      isPopular: false,
      availability: true
    },
    {
      id: "5",
      name: "Avocado Caesar Power Salad",
      description: "Crisp romaine, fresh Hass avocado, shaved parmesan, garlic croutons, house dressing.",
      price: 11.99,
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
      category: "Salads",
      cuisine: "Mediterranean",
      rating: 4.6,
      numReviews: 48,
      prepTime: "10 min",
      calories: 340,
      ingredients: ["Romaine lettuce", "Avocado", "Parmesan", "Caesar dressing"],
      tags: ["Salads", "Healthy", "Vegetarian"],
      dietary: ["Vegetarian", "Healthy"],
      isPopular: false,
      availability: true
    },
    {
      id: "6",
      name: "Belgian Chocolate Lava Cake",
      description: "Warm molten dark chocolate center, served with Madagascan vanilla ice cream.",
      price: 8.50,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
      category: "Desserts",
      cuisine: "French",
      rating: 4.9,
      numReviews: 210,
      prepTime: "12 min",
      calories: 580,
      ingredients: ["Belgian dark chocolate", "Butter", "Eggs", "Vanilla ice cream"],
      tags: ["Desserts", "Sweet"],
      dietary: ["Vegetarian"],
      isPopular: true,
      availability: true
    },
    {
      id: "7",
      name: "Fresh Strawberry Lemonade Cooler",
      description: "Hand-squeezed organic lemons, muddled ripe strawberries, sparkling soda, fresh mint leaves.",
      price: 5.25,
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
      category: "Beverages",
      cuisine: "Beverage Bar",
      rating: 4.8,
      numReviews: 64,
      prepTime: "5 min",
      calories: 140,
      ingredients: ["Fresh lemons", "Strawberries", "Mint", "Sparkling water", "Cane sugar"],
      tags: ["Beverages", "Refreshing", "Chilled"],
      dietary: ["Vegetarian", "Vegan", "Gluten-Free", "Healthy"],
      isPopular: true,
      availability: true
    }
  ];

  return fallback.map(normalizeDummyJson);
};

module.exports = {
  getFoods,
  getFoodById,
  searchFoods,
  getFoodsByCategory,
  getCategories,
  getCuisines,
  fetchAllRawFoods,
  fetchExternalFoods: fetchAllRawFoods // Alias for backward compatibility
};
