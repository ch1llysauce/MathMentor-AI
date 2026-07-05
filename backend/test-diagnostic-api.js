/**
 * Diagnostic API Test Script
 * 
 * This script tests all diagnostic endpoints to verify they're working correctly.
 * 
 * Usage:
 * 1. Start the backend server: npm start
 * 2. Get a valid JWT token (login via the app or Postman)
 * 3. Run: node test-diagnostic-api.js YOUR_JWT_TOKEN
 */

import axios from 'axios';

// Default to localhost, or use environment variable if set
const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const TOKEN = process.argv[2];

console.log(`Using API URL: ${BASE_URL}`);

if (!TOKEN) {
    console.error('❌ Error: JWT token is required');
    console.log('\nUsage: node test-diagnostic-api.js YOUR_JWT_TOKEN');
    console.log('\nTo get a token:');
    console.log('1. Login via the mobile app or Postman');
    console.log('2. Copy the JWT token from the response');
    console.log('3. Run this script with the token as argument\n');
    process.exit(1);
}

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
    }
});

// Test results storage
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

// Helper function to run a test
async function runTest(name, testFn) {
    try {
        console.log(`\n🧪 Testing: ${name}`);
        const result = await testFn();
        console.log(`✅ PASSED: ${name}`);
        if (result) {
            console.log(`   Response:`, JSON.stringify(result, null, 2).substring(0, 200) + '...');
        }
        results.passed++;
        results.tests.push({ name, status: 'PASSED' });
        return result;
    } catch (error) {
        console.log(`❌ FAILED: ${name}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
        results.failed++;
        results.tests.push({ name, status: 'FAILED', error: error.message });
        return null;
    }
}

// Test functions
async function testHealthCheck() {
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    return response.data;
}

async function testGetDashboard() {
    const response = await api.get('/diagnostic/dashboard');
    if (!response.data.success) throw new Error('Response not successful');
    if (!response.data.data.diagnostic) throw new Error('No diagnostic data in response');
    return response.data;
}

async function testGetTimeline() {
    const response = await api.get('/diagnostic/timeline?period=week');
    if (!response.data.success) throw new Error('Response not successful');
    return response.data;
}

async function testGetWeakAreas() {
    const response = await api.get('/diagnostic/weak-areas');
    if (!response.data.success) throw new Error('Response not successful');
    return response.data;
}

async function testGetRecommendations() {
    const response = await api.get('/diagnostic/recommendations');
    if (!response.data.success) throw new Error('Response not successful');
    return response.data;
}

async function testCompareDiagnostics() {
    const response = await api.get('/diagnostic/compare?limit=5');
    if (!response.data.success) throw new Error('Response not successful');
    return response.data;
}

async function testGetLatestDiagnostic() {
    const response = await api.get('/learning/diagnostic/latest');
    if (!response.data.success) throw new Error('Response not successful');
    return response.data;
}

async function testGetDiagnosticHistory() {
    const response = await api.get('/learning/diagnostic/history');
    if (!response.data.success) throw new Error('Response not successful');
    return response.data;
}

// Main test runner
async function runAllTests() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   Diagnostic API Test Suite           ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\n🔗 Testing API: ${BASE_URL}`);
    console.log(`🔑 Using token: ${TOKEN.substring(0, 20)}...`);

    // Test 1: Health Check
    await runTest('Server Health Check', testHealthCheck);

    // Test 2: Get Dashboard
    await runTest('GET /diagnostic/dashboard', testGetDashboard);

    // Test 3: Get Timeline
    await runTest('GET /diagnostic/timeline', testGetTimeline);

    // Test 4: Get Weak Areas
    await runTest('GET /diagnostic/weak-areas', testGetWeakAreas);

    // Test 5: Get Recommendations
    await runTest('GET /diagnostic/recommendations', testGetRecommendations);

    // Test 6: Compare Diagnostics
    await runTest('GET /diagnostic/compare', testCompareDiagnostics);

    // Test 7: Get Latest Diagnostic
    await runTest('GET /learning/diagnostic/latest', testGetLatestDiagnostic);

    // Test 8: Get Diagnostic History
    await runTest('GET /learning/diagnostic/history', testGetDiagnosticHistory);

    // Print summary
    console.log('\n\n╔════════════════════════════════════════╗');
    console.log('║   Test Results Summary                 ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\n✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📊 Total:  ${results.passed + results.failed}`);
    
    if (results.failed > 0) {
        console.log('\n❌ Failed Tests:');
        results.tests
            .filter(t => t.status === 'FAILED')
            .forEach(t => console.log(`   - ${t.name}: ${t.error}`));
    }

    console.log('\n');
    
    if (results.failed === 0) {
        console.log('🎉 All tests passed! Diagnostic API is working correctly.\n');
        process.exit(0);
    } else {
        console.log('⚠️  Some tests failed. Please check the errors above.\n');
        process.exit(1);
    }
}

// Run the tests
runAllTests().catch(error => {
    console.error('\n💥 Unexpected error running tests:', error.message);
    process.exit(1);
});
