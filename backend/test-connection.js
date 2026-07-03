// Quick test to verify backend is accessible
import fetch from 'node-fetch';

const API_URL = 'http://192.168.254.107:5000';

console.log(`Testing connection to: ${API_URL}`);

try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log('✅ Backend is accessible!');
    console.log('Response:', data);
} catch (error) {
    console.error('❌ Cannot reach backend:');
    console.error(error.message);
}
