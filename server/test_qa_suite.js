const BASE = 'http://localhost:5000/api';

async function runQATestSuite() {
  console.log('================================================================');
  console.log('       FEASTDASH FULL-STACK QA COMPREHENSIVE TEST SUITE         ');
  console.log('================================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  const assert = (condition, testName, detail = '') => {
    if (condition) {
      console.log(`[PASS] ${testName} ${detail ? '(' + detail + ')' : ''}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName} ${detail ? '(' + detail + ')' : ''}`);
      failedTests++;
    }
  };

  let userToken = '';
  let testUserId = '';
  let createdOrderId = '';
  let firstFoodId = '';

  // 1. AUTHENTICATION TEST SUITE
  console.log('--- 1. AUTHENTICATION TEST SUITE ---');
  
  // 1.1 Invalid Registration (Short password)
  const invRegRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'QA User', email: 'qa_test@foodapp.com', password: '123' })
  });
  assert(invRegRes.status === 400, 'Invalid Registration (Short Password blocked with 400)');

  // 1.2 Valid Registration
  const uniqueEmail = `qa_user_${Date.now()}@foodapp.com`;
  const regRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'QA Tester',
      email: uniqueEmail,
      password: 'password123',
      phone: '+1 555-0199',
      address: { street: '100 QA Blvd', city: 'Test City', state: 'CA', zipCode: '90210' }
    })
  });
  const regData = await regRes.json();
  assert(regRes.status === 201 && regData.success && regData.data.token, 'Valid Registration (Returned JWT Token)');

  // 1.3 Duplicate Registration
  const dupRegRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'QA Tester', email: uniqueEmail, password: 'password123' })
  });
  assert(dupRegRes.status === 400, 'Duplicate Registration (Email already exists blocked)');

  // 1.4 Invalid Login (Wrong Password)
  const invLogRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: uniqueEmail, password: 'wrongpassword' })
  });
  assert(invLogRes.status === 401, 'Invalid Login (Wrong Password blocked with 401)');

  // 1.5 Valid Login
  const logRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: uniqueEmail, password: 'password123' })
  });
  const logData = await logRes.json();
  assert(logRes.status === 200 && logData.success && logData.data.token, 'Valid Login (Token issued)');
  userToken = logData.data.token;
  testUserId = logData.data.user._id;

  // 1.6 Protected Route Auth Check
  const meRes = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const meData = await meRes.json();
  assert(meRes.status === 200 && meData.data.user._id === testUserId, 'GET /api/auth/me (Authenticated profile access)');

  // 1.7 Unauthorized Access Check
  const unAuthRes = await fetch(`${BASE}/auth/me`);
  assert(unAuthRes.status === 401, 'GET /api/auth/me without Token (Blocked with 401)');


  // 2. FOOD CATALOG & SEARCH TEST SUITE
  console.log('\n--- 2. FOOD CATALOG TEST SUITE ---');

  // 2.1 Load All Foods
  const foodRes = await fetch(`${BASE}/foods`);
  const foodData = await foodRes.json();
  assert(foodRes.status === 200 && foodData.data.length > 0, 'GET /api/foods (Loaded menu catalog)', `Items: ${foodData.data.length}`);
  firstFoodId = foodData.data[0]._id;

  // 2.2 Search Food
  const searchRes = await fetch(`${BASE}/foods?search=Pizza`);
  const searchData = await searchRes.json();
  assert(searchRes.status === 200 && searchData.data.length > 0, 'GET /api/foods?search=Pizza (Search query)', `Results: ${searchData.data.length}`);

  // 2.3 Filter by Category
  const catRes = await fetch(`${BASE}/foods?category=Burgers`);
  const catData = await catRes.json();
  assert(catRes.status === 200 && catData.data.length > 0, 'GET /api/foods?category=Burgers (Category filter)', `Items: ${catData.data.length}`);

  // 2.4 Sort Foods (Price Ascending)
  const sortRes = await fetch(`${BASE}/foods?sort=price_asc`);
  const sortData = await sortRes.json();
  const prices = sortData.data.map(f => f.price);
  const isSorted = prices.every((val, i, arr) => !i || arr[i - 1] <= val);
  assert(sortRes.status === 200 && isSorted, 'GET /api/foods?sort=price_asc (Price low-to-high sorting verified)');

  // 2.5 View Food Details
  const detailRes = await fetch(`${BASE}/foods/${firstFoodId}`);
  const detailData = await detailRes.json();
  assert(detailRes.status === 200 && detailData.data._id === firstFoodId, 'GET /api/foods/:id (Single food item fetch)');

  // 2.6 Invalid Food ID
  const invFoodRes = await fetch(`${BASE}/foods/64f1a0000000000000000000`);
  assert(invFoodRes.status === 404, 'GET /api/foods/invalid_id (Invalid food ID returns 404)');


  // 3. CART & ORDER CREATION TEST SUITE
  console.log('\n--- 3. CART & ORDER CREATION TEST SUITE ---');

  // 3.1 Calculate Totals Verification
  const itemPrice = detailData.data.price;
  const quantity = 2;
  const subtotal = itemPrice * quantity;
  const deliveryFee = 3.99;
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const expectedTotal = parseFloat((subtotal + tax + deliveryFee).toFixed(2));

  // 3.2 Post Order
  const orderRes = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`
    },
    body: JSON.stringify({
      items: [{ food: firstFoodId, quantity }],
      deliveryAddress: { street: '100 QA Blvd', city: 'Test City', state: 'CA', zipCode: '90210', phone: '+1 555-0199' },
      paymentMethod: 'Card'
    })
  });
  const orderData = await orderRes.json();
  assert(orderRes.status === 201 && orderData.success, 'POST /api/orders (Order created successfully)');
  
  if (orderData.data) {
    createdOrderId = orderData.data.orderId || orderData.data._id;
    assert(orderData.data.total === expectedTotal, 'Order Subtotal, Tax (8%), Fee & Grand Total Calculation Match', `Total: $${orderData.data.total}`);
  }

  // 3.3 Invalid Order Payload (Empty items array)
  const badOrderRes = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`
    },
    body: JSON.stringify({ items: [] })
  });
  assert(badOrderRes.status === 400, 'POST /api/orders with empty items (Blocked with 400)');


  // 4. ORDER HISTORY & TRACKING TEST SUITE
  console.log('\n--- 4. ORDER HISTORY & TRACKING TEST SUITE ---');

  // 4.1 Fetch My Orders
  const myOrdersRes = await fetch(`${BASE}/orders`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const myOrdersData = await myOrdersRes.json();
  assert(myOrdersRes.status === 200 && myOrdersData.data.length >= 1, 'GET /api/orders (Fetch user order history)');

  // 4.2 Track Single Order (User authenticated)
  const trackRes = await fetch(`${BASE}/orders/${createdOrderId}`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const trackData = await trackRes.json();
  assert(trackRes.status === 200 && trackData.data.status === 'PLACED', 'GET /api/orders/:id (Track order initial status PLACED)');

  // 4.3 Admin Login to perform Status Progression
  const adminLoginRes = await fetch(`${BASE}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@foodapp.com', password: 'admin123' })
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.data.token;
  assert(adminLoginRes.status === 200 && adminToken, 'Admin Login for Order Management');

  // 4.4 Advance Order Status Lifecycle via Admin API
  const statuses = ['CONFIRMED', 'PREPARING', 'PICKED UP', 'DELIVERED'];
  for (const status of statuses) {
    const patchRes = await fetch(`${BASE}/admin/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status })
    });
    const patchData = await patchRes.json();
    assert(patchRes.status === 200 && patchData.data.status === status, `Admin Order Status Advanced to ${status}`);
  }

  // 4.5 Backward Status Regression Prevention Check
  const regressRes = await fetch(`${BASE}/admin/orders/${createdOrderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'PLACED' })
  });
  assert(regressRes.status === 400, 'Backward Status Regression (Jumping DELIVERED -> PLACED blocked with 400)');


  // 5. ERROR & EDGE CASES TEST SUITE
  console.log('\n--- 5. ERROR & EDGE CASES TEST SUITE ---');

  // 5.1 Invalid 404 Route
  const route404Res = await fetch(`${BASE}/invalid_route_xyz`);
  assert(route404Res.status === 404, 'API 404 Handler (Returns clean JSON error structure)');

  // 5.2 Invalid Order ID Fetch
  const invOrderRes = await fetch(`${BASE}/orders/ORD-999999`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert(invOrderRes.status === 404, 'GET /api/orders/ORD-999999 (Non-existent order returns 404)');

  console.log('\n================================================================');
  console.log(`QA RESULTS: ${passedTests} PASSED, ${failedTests} FAILED out of ${passedTests + failedTests} TESTS`);
  console.log('================================================================');
}

runQATestSuite().catch(console.error);
