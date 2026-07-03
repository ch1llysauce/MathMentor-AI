// Quick test script for login endpoint
import axios from 'axios';

const API_BASE = 'http://192.168.254.107:5000/api';

async function testLogin() {
  console.log('Testing login endpoint...\n');
  
  // Test 1: Valid login
  try {
    console.log('Test 1: Valid login request');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'TestPass123'
    });
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
  
  console.log('\n---\n');
  
  // Test 2: Invalid email format
  try {
    console.log('Test 2: Invalid email format');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'invalid-email',
      password: 'TestPass123'
    });
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Expected validation error:', error.response?.data);
  }
  
  console.log('\n---\n');
  
  // Test 3: Empty password
  try {
    console.log('Test 3: Empty password');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: ''
    });
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Expected validation error:', error.response?.data);
  }
  
  console.log('\n---\n');
  
  // Test 4: Missing fields
  try {
    console.log('Test 4: Missing fields');
    const response = await axios.post(`${API_BASE}/auth/login`, {});
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Expected validation error:', error.response?.data);
  }
}

testLogin();
