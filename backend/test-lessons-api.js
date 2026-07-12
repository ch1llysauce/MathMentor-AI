// Test the lessons API endpoint
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'https://mathmentor-ai-nxry.onrender.com/api';

const testLessonsAPI = async () => {
  try {
    console.log('🧪 Testing Lessons API...\n');

    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'TestPass123'
    });
    
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token:', token ? token.substring(0, 20) + '...' : 'NOT FOUND\n');

    // Step 2: Get all lessons
    console.log('2. Fetching all lessons...');
    const lessonsResponse = await axios.get(`${API_URL}/learning/lessons`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Found ${lessonsResponse.data.data.lessons.length} lessons:`);
    lessonsResponse.data.data.lessons.forEach(lesson => {
      console.log(`   - ${lesson.topic} > ${lesson.subtopic} > ${lesson.title}`);
    });
    console.log('');

    // Step 3: Get lessons by topic
    console.log('3. Fetching Algebra lessons...');
    const algebraResponse = await axios.get(`${API_URL}/learning/lessons?topic=Algebra`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Found ${algebraResponse.data.data.lessons.length} Algebra lessons`);
    console.log('');

    // Step 4: Get practice problems
    console.log('4. Fetching practice problems...');
    const problemsResponse = await axios.get(`${API_URL}/learning/practice?topic=Algebra&limit=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Found ${problemsResponse.data.data.problems.length} practice problems`);
    problemsResponse.data.data.problems.forEach(problem => {
      console.log(`   - [${problem.difficulty}] ${problem.problem.text}`);
    });
    console.log('');

    console.log('🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testLessonsAPI();
