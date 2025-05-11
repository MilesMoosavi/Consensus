require('dotenv').config();
const axios = require('axios');
const express = require('express');
const path = require('path');

// Base Gemini API endpoint
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve React frontend static files in production
// The 'frontend/dist' folder is created when you run 'npm run build' in the 'frontend' directory
// app.use(express.static(path.join(__dirname, 'frontend', 'dist'))); // Temporarily commented out

/**
 * Query the Gemini API with a user prompt
 * @param {string} prompt - The user's input prompt
 * @param {string} model - The model to use (e.g. 'gemini-1.5-pro-002')
 * @returns {Promise<string>} - The model's response
 */
async function queryGemini(prompt, model = 'gemini-1.5-pro-002') {
  try {
    const apiUrl = `${GEMINI_API_BASE}/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await axios.post(
      apiUrl,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      }
    );

    if (response.data &&
        response.data.candidates &&
        response.data.candidates[0] &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts[0]) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      console.error("Unexpected response structure from Gemini API:", response.data);
      throw new Error("Unexpected response structure from Gemini API");
    }
  } catch (error) {
    if (error.response) {
      console.error("API Error data:", error.response.data);
      console.error("API Error status:", error.response.status);
      // console.error("API Error headers:", error.response.headers); // Can be verbose
      const errorMessage = error.response.data.error ? error.response.data.error.message : JSON.stringify(error.response.data);
      throw new Error(`API Error: ${error.response.status} - ${errorMessage}`);
    } else if (error.request) {
      console.error("Network Error:", error.request);
      throw new Error("Network error - no response received");
    } else {
      console.error("Error message:", error.message);
      throw error;
    }
  }
}

/**
 * Function to handle different providers (placeholder for future implementation)
 * @param {string} prompt - The user's input prompt
 * @param {string} provider - The provider (google, openai, deepseek)
 * @param {string} model - The specific model to use
 * @returns {Promise<string>} - The model's response
 */
async function queryLLM(prompt, provider = 'google', model = 'gemini-1.5-pro-002') {
  switch(provider) {
    case 'google':
      return await queryGemini(prompt, model);
    case 'openai':
      // Placeholder for future OpenAI implementation
      return "OpenAI integration is coming soon!";
    case 'deepseek':
      // Placeholder for future DeepSeek implementation
      return "DeepSeek integration is coming soon!";
    default:
      throw new Error(`Provider '${provider}' is not supported yet.`);
  }
}

// API endpoint to handle prompts
app.post('/api/prompt', async (req, res) => {
    const { prompt, provider = 'google', model = 'gemini-1.5-pro-002' } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    try {
        // Only allow specific providers that are actually implemented
        if (provider !== 'google') {
          return res.status(400).json({ message: `Provider '${provider}' is not supported yet.` });
        }

        const response = await queryLLM(prompt, provider, model);
        res.json({ response, provider, model });
    } catch (error) {
        console.error('Error in /api/prompt:', error.message);
        res.status(500).json({ message: error.message || 'Failed to get response from LLM' });
    }
});

// For all other GET requests, send back the React frontend's index.html file.
// This is important for SPAs and client-side routing.
// app.get('*', (req, res) => { // Temporarily commented out
//   res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
// });

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('API endpoint available at /api/prompt');
  console.log('Supported providers: google (OpenAI and DeepSeek coming soon)');
  console.log('Supported Gemini 1.5 models: gemini-1.5-pro-002, gemini-1.5-flash-002, gemini-1.5-flash-8b-001');
  console.log('Supported Gemini 2.0 models: gemini-2.0-flash, gemini-2.0-flash-001, gemini-2.0-flash-lite');
  console.log('Supported Gemini 2.5 models: gemini-2.5-pro-preview-05-06, gemini-2.5-flash-preview-04-17');
  // console.log('React frontend should be accessible if built and served, or via Vite dev server.');
});
