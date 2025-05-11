require('dotenv').config();
const axios = require('axios');

// Gemini API models endpoint
const MODELS_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * List available Gemini models
 * @returns {Promise<void>}
 */
async function listGeminiModels() {
  console.log(`API Key available: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
  console.log(`Making request to: ${MODELS_URL}`);
  
  try {
    const response = await axios.get(
      `${MODELS_URL}?key=${process.env.GEMINI_API_KEY}`
    );

    console.log('Response status:', response.status);
    
    if (response.data && response.data.models) {
      console.log('\nAvailable Models:');
      response.data.models.forEach(model => {
        console.log(`\n- Name: ${model.name}`);
        console.log(`  Version: ${model.version || 'N/A'}`);
        console.log(`  Display Name: ${model.displayName || 'N/A'}`);
        console.log(`  Description: ${model.description || 'N/A'}`);
        console.log(`  Input Token Limit: ${model.inputTokenLimit || 'N/A'}`);
        console.log(`  Output Token Limit: ${model.outputTokenLimit || 'N/A'}`);
      });
      
      // Also log models with version 2.0 or higher
      const v2OrHigherModels = response.data.models.filter(model => {
        const nameMatch = model.name.match(/\d+\.\d+/);
        return nameMatch && parseFloat(nameMatch[0]) >= 2.0;
      });
      
      if (v2OrHigherModels.length > 0) {
        console.log('\n\n===== Models 2.0 or higher =====');
        v2OrHigherModels.forEach(model => {
          console.log(`\n- ${model.name}`);
        });
      } else {
        console.log('\n\nNo models with version 2.0 or higher found.');
      }
    } else {
      console.log('No models found in the response');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('\nError occurred:');
    if (error.response) {
      console.error("API Error Status:", error.response.status);
      console.error("API Error Data:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error("Network Error - No response received");
      console.error(error.request);
    } else {
      console.error("Error:", error.message);
    }
    console.error("\nFull error:", error);
  }
}

// Execute the function
console.log('Starting Gemini Models List Request...');
listGeminiModels()
  .then(() => console.log('\nRequest completed.'))
  .catch(err => console.error('\nUnhandled error:', err));
