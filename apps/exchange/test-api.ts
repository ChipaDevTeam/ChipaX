/**
 * FILE: apps/exchange/test-api.ts
 * PURPOSE: Test script for internal API endpoints
 * USAGE: node --loader ts-node/esm test-api.ts
 */

const INTERNAL_API_KEY = 'dev-internal-key-123456';
const BASE_URL = 'http://localhost:3000';

async function testOrderCreation() {
  console.log('\n🧪 Testing Order Creation...');
  
  const orderData = {
    userId: 'user-test-001',
    symbol: 'BTC/USDT',
    side: 'BUY',
    type: 'LIMIT',
    price: '50000.00',
    quantity: '0.5',
    timeInForce: 'GTC',
  };

  try {
    const response = await fetch(`${BASE_URL}/api/internal/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': INTERNAL_API_KEY,
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    console.log('✅ Order created:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
}

async function testOrderBookSnapshot() {
  console.log('\n🧪 Testing Order Book Snapshot...');
  
  try {
    const response = await fetch(
      `${BASE_URL}/api/internal/orderbook?symbol=BTC/USDT&depth=10`,
      {
        headers: {
          'x-internal-api-key': INTERNAL_API_KEY,
        },
      }
    );

    const result = await response.json();
    console.log('✅ Order book snapshot:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('❌ Error fetching order book:', error);
    throw error;
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log(`API Base URL: ${BASE_URL}`);
  console.log(`Internal API Key: ${INTERNAL_API_KEY}\n`);

  try {
    // Test 1: Create a buy order
    await testOrderCreation();

    // Test 2: Get order book snapshot
    await testOrderBookSnapshot();

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests();
