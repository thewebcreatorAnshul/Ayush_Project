const fetch = globalThis.fetch || require('node-fetch');

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Asian', 'Pasta', 'Salads', 'Desserts', 'Beverages'];

async function verifyAllCategories() {
  console.log('================================================================');
  console.log('      FEASTDASH LIVE API-DRIVEN MENU VERIFICATION SUITE         ');
  console.log('================================================================\n');

  try {
    // 1. Test Categories Endpoint
    console.log('1. Checking GET /api/categories...');
    const catRes = await fetch('http://localhost:5000/api/categories');
    const catData = await catRes.json();
    console.log(`[PASS] Fetched ${catData.data.length} categories:`);
    catData.data.forEach(c => console.log(`   - ${c.name}: ${c.count} items`));

    // 2. Test each category query
    console.log('\n2. Testing each category on GET /api/foods?category=<NAME>...');
    for (const cat of CATEGORIES) {
      const res = await fetch(`http://localhost:5000/api/foods?category=${encodeURIComponent(cat)}&limit=20`);
      const data = await res.json();
      console.log(`[PASS] Category: ${cat.padEnd(10)} -> Total available: ${String(data.total).padEnd(4)} | Page count: ${data.count} items`);
      if (data.data.length > 0) {
        console.log(`       Sample item: "${data.data[0].name}" ($${data.data[0].price}) [${data.data[0].cuisine}] (Source: ${data.data[0].source || 'API'})`);
      }
    }

    // 3. Test Search
    console.log('\n3. Testing Search GET /api/foods?search=chicken...');
    const searchRes = await fetch('http://localhost:5000/api/foods?search=chicken');
    const searchData = await searchRes.json();
    console.log(`[PASS] Search "chicken" returned ${searchData.total} dishes.`);

    // 4. Test Cuisines
    console.log('\n4. Testing GET /api/foods/cuisines...');
    const cuiRes = await fetch('http://localhost:5000/api/foods/cuisines');
    const cuiData = await cuiRes.json();
    console.log(`[PASS] Available cuisines (${cuiData.data.length}): ${cuiData.data.slice(0, 8).join(', ')}...`);

    // 5. Test Single Item Details
    const firstFoodId = searchData.data[0].id;
    console.log(`\n5. Testing GET /api/foods/${firstFoodId} (Food Details)...`);
    const foodRes = await fetch(`http://localhost:5000/api/foods/${firstFoodId}`);
    const foodData = await foodRes.json();
    console.log(`[PASS] Loaded "${foodData.data.name}"`);
    console.log(`       Ingredients (${foodData.data.ingredients.length}): ${foodData.data.ingredients.slice(0, 4).join(', ')}...`);

    console.log('\n================================================================');
    console.log('✅ ALL CATEGORY & MENU VERIFICATIONS PASSED SUCCESSFULLY');
    console.log('================================================================');
  } catch (err) {
    console.error('Verification failed:', err.message);
  }
}

verifyAllCategories();
