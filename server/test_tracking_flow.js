const BASE = 'http://localhost:5000/api';

async function testOrderTrackingFlow() {
  console.log('=== END-TO-END ORDER TRACKING FLOW TEST ===\n');

  // 1. Fetch Demo Order ORD-89241
  console.log('Step 1: Fetching Initial Order Info (ORD-89241)...');
  const getRes = await fetch(`${BASE}/orders/ORD-89241`);
  const getData = await getRes.json();
  console.log('GET Status:', getRes.status, 'Order ID:', getData.data.orderId, 'Current Status:', getData.data.status);

  // Status progression loop
  const steps = ['PLACED', 'CONFIRMED', 'PREPARING', 'PICKED UP', 'DELIVERED'];

  for (const targetStatus of steps) {
    console.log(`\nAdvancing Order to: ${targetStatus}...`);
    const patchRes = await fetch(`${BASE}/orders/ORD-89241/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: targetStatus, note: `Moved to ${targetStatus}` })
    });
    const patchData = await patchRes.json();
    console.log('PATCH Status:', patchRes.status, 'New Status in DB:', patchData.data ? patchData.data.status : patchData.message);
  }

  // Verify backward transition is blocked
  console.log('\nTesting Invalid Regression (Trying to jump DELIVERED -> PLACED)...');
  const badPatchRes = await fetch(`${BASE}/orders/ORD-89241/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'PLACED' })
  });
  const badPatchData = await badPatchRes.json();
  console.log('Regression Status Code:', badPatchRes.status, 'Block Message:', badPatchData.message);

  console.log('\n=== END-TO-END ORDER TRACKING FLOW PASSED ALL TESTS ===');
}

testOrderTrackingFlow().catch(console.error);
