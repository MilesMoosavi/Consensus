#!/usr/bin/env node

/**
 * Quick GitHub Models Test Script
 * Usage: node scripts/test-github.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Quick GitHub Models Test\n');

// Test 1: Check if backend can be reached
console.log('1. Testing backend connectivity...');
try {
  const result = execSync('curl -s http://localhost:5000/api/health', { encoding: 'utf8' });
  console.log('✅ Backend health check:', result);
} catch (error) {
  console.log('❌ Backend not running. Start with: cd backend && npm run dev');
  console.log('   Then try this test again.\n');
  process.exit(1);
}

// Test 2: Check environment variables
console.log('\n2. Checking environment variables...');
try {
  process.chdir('backend');
  require('dotenv').config();
  
  const githubPat = process.env.GITHUB_PAT;
  const geminiKey = process.env.GEMINI_API_KEY;
  
  console.log(`✅ GITHUB_PAT: ${githubPat ? 'Set (' + githubPat.substring(0, 10) + '...)' : '❌ NOT SET'}`);
  console.log(`✅ GEMINI_API_KEY: ${geminiKey ? 'Set (' + geminiKey.substring(0, 10) + '...)' : '❌ NOT SET'}`);
  
  if (!githubPat) {
    console.log('\n🔧 To fix GITHUB_PAT:');
    console.log('   1. Go to: https://github.com/settings/personal-access-tokens/new');
    console.log('   2. Create a fine-grained token (no special permissions needed)');
    console.log('   3. Add to backend/.env: GITHUB_PAT=your_token_here');
    console.log('   4. Restart backend server\n');
  }
} catch (error) {
  console.log('❌ Error checking environment:', error.message);
}

// Test 3: Test GitHub Models directly
console.log('\n3. Testing GitHub Models service...');
try {
  const result = execSync('node testGitHubModels.js', { encoding: 'utf8', stdio: 'pipe' });
  console.log('✅ GitHub Models test result:');
  console.log(result);
} catch (error) {
  console.log('❌ GitHub Models test failed:');
  console.log(error.stdout || error.message);
}

// Test 4: Test API endpoints
console.log('\n4. Testing API endpoints...');
const testCases = [
  {
    name: 'Single GitHub model',
    cmd: 'curl -s -X POST http://localhost:5000/api/prompt -H "Content-Type: application/json" -d "{\\"prompt\\": \\"What is 2+2?\\", \\"provider\\": \\"github\\", \\"model\\": \\"openai/gpt-4o-mini\\"}"'
  },
  {
    name: 'Multi-model consensus',
    cmd: 'curl -s -X POST http://localhost:5000/api/consensus -H "Content-Type: application/json" -d "{\\"prompt\\": \\"What is the capital of France?\\"}"'
  }
];

testCases.forEach(test => {
  try {
    console.log(`\n📡 Testing: ${test.name}`);
    const result = execSync(test.cmd, { encoding: 'utf8', timeout: 30000 });
    console.log('✅ Response:', JSON.stringify(JSON.parse(result), null, 2));
  } catch (error) {
    console.log(`❌ ${test.name} failed:`, error.message);
  }
});

console.log('\n🎉 Test complete! Check results above for any issues.');
