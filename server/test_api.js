const BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== RUNNING BACKEND API VALIDATION & SECURITY TEST SUITE ===\n');
  let token = '';

  // 1. Valid Auth Login
  console.log('Test 1: Valid Login Request (demo@foodapp.com)...');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@foodapp.com', password: 'user123' })
  });
  const loginData = await loginRes.json();
  console.log('Status:', loginRes.status, 'Success:', loginData.success);
  if (loginData.data && loginData.data.token) token = loginData.data.token;

  // 2. Invalid Login Password
  console.log('\nTest 2: Invalid Login Password...');
  const badLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@foodapp.com', password: 'wrongpassword' })
  });
  const badLoginData = await badLoginRes.json();
  console.log('Status:', badLoginRes.status, 'Success:', badLoginData.success, 'Message:', badLoginData.message);

  // 3. Validation Failure (Invalid email format)
  console.log('\nTest 3: Input Validation Failure (Malformed Email)...');
  const valRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'invalid-email-string', password: '123' })
  });
  const valData = await valRes.json();
  console.log('Status:', valRes.status, 'Success:', valData.success, 'Errors:', valData.errors);

  // 4. Missing Authentication
  console.log('\nTest 4: Protected Route without Token...');
  const noAuthRes = await fetch(`${BASE}/auth/me`);
  const noAuthData = await noAuthRes.json();
  console.log('Status:', noAuthRes.status, 'Success:', noAuthData.success, 'Message:', noAuthData.message);

  // 5. Invalid Token
  console.log('\nTest 5: Protected Route with Malformed Token...');
  const badAuthRes = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: 'Bearer bogus.token.value' }
  });
  const badAuthData = await badAuthRes.json();
  console.log('Status:', badAuthRes.status, 'Success:', badAuthData.success, 'Message:', badAuthData.message);

  // 6. Food Catalog Fetch
  console.log('\nTest 6: Food Catalog Fetch...');
  const foodRes = await fetch(`${BASE}/foods?category=Burgers`);
  const foodData = await foodRes.json();
  console.log('Status:', foodRes.status, 'Success:', foodData.success, 'Count:', foodData.data ? foodData.data.length : 0);

  // 7. Create Order Validation (Empty items)
  console.log('\nTest 7: Create Order with Empty Items Array...');
  const emptyOrderRes = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ items: [], deliveryAddress: { street: '123 St', city: 'City', phone: '555' } })
  });
  const emptyOrderData = await emptyOrderRes.json();
  console.log('Status:', emptyOrderRes.status, 'Success:', emptyOrderData.success, 'Errors:', emptyOrderData.errors);

  // 8. Create Order Valid
  if (foodData.data && foodData.data.length > 0) {
    console.log('\nTest 8: Valid Order Creation...');
    const validOrderRes = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        items: [{ food: foodData.data[0]._id, quantity: 2 }],
        deliveryAddress: { street: '123 Main St', city: 'Springfield', state: 'OR', zipCode: '97477', phone: '+1 555-0199' },
        paymentMethod: 'Card'
      })
    });
    const validOrderData = await validOrderRes.json();
    console.log('Status:', validOrderRes.status, 'Success:', validOrderData.success, 'OrderId:', validOrderData.data ? validOrderData.data.orderId : null);
  }

  // 9. API 404 Route
  console.log('\nTest 9: Unknown API Route 404...');
  const notFoundRes = await fetch(`${BASE}/non_existent_endpoint`);
  const notFoundData = await notFoundRes.json();
  console.log('Status:', notFoundRes.status, 'Success:', notFoundData.success, 'Message:', notFoundData.message);

  console.log('\n=== ALL API TESTS EXECUTED CLEANLY ===');
}

runTests().catch(console.error);
