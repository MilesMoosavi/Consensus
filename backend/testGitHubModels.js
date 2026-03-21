// backend/testGitHubModels.js
import './loadEnv.js'; // Load environment variables
import GitHubModelsService from './services/GitHubModelsService.js';

const GITHUB_PAT = process.env.GITHUB_PAT;

async function testGitHubModels() {
  console.log('Testing GitHub Models Integration...');
  console.log(`GitHub PAT available: ${GITHUB_PAT ? 'Yes' : 'No'}`);
  
  if (!GITHUB_PAT) {
    console.error('GITHUB_PAT environment variable not set');
    return;
  }

  try {
    // Test 1: Get available models
    console.log('\n1. Testing getAvailableModels...');
    const models = GitHubModelsService.getAvailableModels();
    console.log(`Found ${models.length} models:`);
    models.forEach(model => {
      console.log(`  - ${model.name} (${model.provider}) - ${model.id}`);
    });

    // Test 2: Test a simple query
    console.log('\n2. Testing model query...');
    const githubService = new GitHubModelsService(GITHUB_PAT);
    const testPrompt = "What is 2+2? Please answer briefly.";
    const testModel = "openai/gpt-4o-mini"; // Use a smaller model for testing
    
    console.log(`Querying ${testModel} with: "${testPrompt}"`);
    const response = await githubService.queryModel(testPrompt, testModel);
    console.log(`Response: ${response}`);
    
    console.log('\n✅ GitHub Models integration test successful!');
  } catch (error) {
    console.error('❌ GitHub Models integration test failed:', error.message);
    console.error('Full error:', error);
  }
}

testGitHubModels();
