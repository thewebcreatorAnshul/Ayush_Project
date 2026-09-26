const fetch = globalThis.fetch || require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

const runSecurityAudit = async () => {
  console.log('================================================================');
  console.log('    FEASTDASH FULL-STACK RBAC & SECURITY AUDIT TEST SUITE       ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const test = (name, condition, details = '') => {
    if (condition) {
      console.log(`[PASS] ${name} ${details ? `(${details})` : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  };

  try {
    // ------------------------------------------------------------
    // 1. CUSTOMER REGISTRATION & PRIVILEGE ESCALATION ATTEMPTS
    // ------------------------------------------------------------
    console.log('--- 1. PRIVILEGE ESCALATION & REGISTRATION AUDIT ---');
    const attackerEmail = `attacker_${Date.now()}@test.com`;
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Malicious Attacker',
        email: attackerEmail,
        password: 'password123',
        role: 'admin', // Attack attempt: escalate role during registration
        isAdmin: true
      })
    });
    const regData = await regRes.json();
    test('Customer Registration Succeeded', regRes.status === 201);
    test(
      'Role Escalation in Registration Blocked',
      regData.data?.user?.role === 'customer',
      `Assigned Role: ${regData.data?.user?.role}`
    );

    const customerToken = regData.data.token;
    const customerId = regData.data.user._id;

    // Attack attempt: escalate role during profile update
    const profileRes = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        name: 'Hacked Admin',
        role: 'admin',
        isAdmin: true,
        permissions: ['*']
      })
    });
    const profileData = await profileRes.json();
    test(
      'Role Escalation in Profile Update Blocked',
      profileData.data?.user?.role === 'customer',
      `Current Role: ${profileData.data?.user?.role}`
    );

    // ------------------------------------------------------------
    // 2. CUSTOMER CALLING ADMIN AUTH PORTAL
    // ------------------------------------------------------------
    console.log('\n--- 2. ADMIN AUTH PORTAL ACCESS CONTROL ---');
    const custAdminLoginRes = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: attackerEmail,
        password: 'password123'
      })
    });
    test(
      'Customer Login to Admin Portal Blocked (403 Forbidden)',
      custAdminLoginRes.status === 403,
      `Status: ${custAdminLoginRes.status}`
    );

    // ------------------------------------------------------------
    // 3. CUSTOMER CALLING ADMIN PROTECTED ENDPOINTS (ATTACK SIMULATION)
    // ------------------------------------------------------------
    console.log('\n--- 3. ATTACK SIMULATION: CUSTOMER CALLING ADMIN ENDPOINTS ---');
    
    // Attack A: Customer calls GET /api/admin/dashboard
    const dashRes = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    test('Customer GET /api/admin/dashboard Blocked (403)', dashRes.status === 403);

    // Attack B: Customer calls GET /api/admin/users
    const usersRes = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    test('Customer GET /api/admin/users Blocked (403)', usersRes.status === 403);

    // Attack C: Customer calls POST /api/admin/products (attempt to inject product)
    const createProdRes = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        name: 'Fake Attack Burger',
        price: 0.01,
        category: 'Burgers',
        description: 'Injected product'
      })
    });
    test('Customer POST /api/admin/products Blocked (403)', createProdRes.status === 403);

    // Attack D: Customer calls PUT /api/admin/products/:id (attempt to modify price)
    const editProdRes = await fetch(`${API_BASE}/admin/products/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({ price: 0.01 })
    });
    test('Customer PUT /api/admin/products/:id Blocked (403)', editProdRes.status === 403);

    // Attack E: Customer calls DELETE /api/admin/products/:id (attempt to delete menu)
    const deleteProdRes = await fetch(`${API_BASE}/admin/products/1`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    test('Customer DELETE /api/admin/products/:id Blocked (403)', deleteProdRes.status === 403);

    // Attack F: Customer calls PATCH /api/admin/orders/ORD-89241/status (attempt to force deliver)
    const statusAttackRes = await fetch(`${API_BASE}/admin/orders/ORD-89241/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({ status: 'DELIVERED' })
    });
    test('Customer PATCH /api/admin/orders/:id/status Blocked (403)', statusAttackRes.status === 403);

    // ------------------------------------------------------------
    // 4. UNAUTHENTICATED PUBLIC USER CALLING ADMIN ENDPOINTS
    // ------------------------------------------------------------
    console.log('\n--- 4. UNAUTHENTICATED PUBLIC USER AUDIT ---');
    const noTokenRes = await fetch(`${API_BASE}/admin/dashboard`);
    test('Unauthenticated GET /api/admin/dashboard Blocked (401)', noTokenRes.status === 401);

    const noTokenUsersRes = await fetch(`${API_BASE}/admin/users`);
    test('Unauthenticated GET /api/admin/users Blocked (401)', noTokenUsersRes.status === 401);

    // ------------------------------------------------------------
    // 5. IDOR ATTACK: CUSTOMER ACCESSING ANOTHER CUSTOMER'S PRIVATE DATA
    // ------------------------------------------------------------
    console.log('\n--- 5. IDOR (INSECURE DIRECT OBJECT REFERENCE) AUDIT ---');
    // Create Victim Customer B
    const victimRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Victim Customer B',
        email: `victim_${Date.now()}@test.com`,
        password: 'password123'
      })
    });
    const victimData = await victimRes.json();
    const victimToken = victimData.data.token;

    // Victim creates an order
    const victimOrderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${victimToken}`
      },
      body: JSON.stringify({
        items: [{ food: '1', quantity: 1 }],
        deliveryAddress: { street: 'Private Victim Street 123', city: 'Metropolis', state: 'NY', zipCode: '10001', phone: '555-9999' }
      })
    });
    const victimOrderData = await victimOrderRes.json();
    const victimOrderId = victimOrderData.data._id;

    // Attacker Customer tries to access Victim's Order via Mongo _id
    const idorRes = await fetch(`${API_BASE}/orders/${victimOrderId}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    test('IDOR Attack on Another Customer’s Order Blocked (403)', idorRes.status === 403);

    // ------------------------------------------------------------
    // 6. LEGITIMATE ADMINISTRATOR OPERATIONS
    // ------------------------------------------------------------
    console.log('\n--- 6. VERIFIED ADMINISTRATOR PRIVILEGED OPERATIONS ---');
    const adminLoginRes = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@foodapp.com',
        password: 'admin123'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    test('Admin Login Succeeded (200)', adminLoginRes.status === 200);
    test('Admin Role Verified', adminLoginData.data?.admin?.role === 'admin');

    const adminToken = adminLoginData.data.token;

    // Admin Dashboard
    const adminDashRes = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminDashData = await adminDashRes.json();
    test('Admin Access to /api/admin/dashboard Allowed (200)', adminDashRes.status === 200 && adminDashData.success);

    // Admin Users List
    const adminUsersRes = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminUsersData = await adminUsersRes.json();
    test('Admin Access to /api/admin/users Allowed (200)', adminUsersRes.status === 200 && adminUsersData.data.length > 0);

    // Admin Product Creation
    const adminCreateProdRes = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Gourmet Truffle Wagyu Burger',
        description: 'Artisanal brioche, truffle aioli, wagyu beef',
        price: 24.50,
        category: 'Burgers',
        cuisine: 'American',
        prepTime: '20 min'
      })
    });
    const adminCreatedProduct = await adminCreateProdRes.json();
    test('Admin Create Product Allowed (201)', adminCreateProdRes.status === 201 && adminCreatedProduct.data?.name === 'Gourmet Truffle Wagyu Burger');

    const createdProductId = adminCreatedProduct.data?._id;

    // Admin Product Update
    const adminUpdateProdRes = await fetch(`${API_BASE}/admin/products/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ price: 26.50 })
    });
    test('Admin Update Product Price Allowed (200)', adminUpdateProdRes.status === 200);

    // Admin Order Status Update
    const adminOrderStatusRes = await fetch(`${API_BASE}/admin/orders/${victimOrderData.data.orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'CONFIRMED' })
    });
    test('Admin Update Order Status Allowed (200)', adminOrderStatusRes.status === 200);

    // Admin Delete Product
    const adminDeleteProdRes = await fetch(`${API_BASE}/admin/products/${createdProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    test('Admin Delete Product Allowed (200)', adminDeleteProdRes.status === 200);

    // ------------------------------------------------------------
    // 7. SUMMARY
    // ------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`SECURITY AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} TESTS`);
    console.log('================================================================');
    
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal Security Audit Error:', err);
    process.exit(1);
  }
};

runSecurityAudit();
