import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import axios from '../node_modules_old/axios';
import express from 'express';
import cors from 'cors'; // Import the cors package

// Replicate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Base Gemini API endpoint
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const OPENAI_API_BASE = 'https://api.openai.com/v1'; // Added OpenAI base URL

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Use cors middleware

// Middleware to parse JSON bodies
app.use(express.json());

// Serve React frontend static files in production
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

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
 * Query the OpenAI API with a user prompt
 * @param {string} prompt - The user's input prompt
 * @param {string} model - The model to use (e.g. 'gpt-4o')
 * @returns {Promise<string>} - The model's response
 */
async function queryOpenAI(prompt, model = 'gpt-4o') {
  try {
    const apiUrl = `${OPENAI_API_BASE}/chat/completions`;
    const response = await axios.post(
      apiUrl,
      {
        model: model,
        messages: [{ role: "user", content: prompt }],
        // Add other parameters like temperature, max_tokens if needed
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content;
    } else {
      console.error("Unexpected response structure from OpenAI API:", response.data);
      throw new Error("Unexpected response structure from OpenAI API");
    }
  } catch (error) {
    if (error.response) {
      console.error("OpenAI API Error data:", error.response.data);
      console.error("OpenAI API Error status:", error.response.status);
      const errorMessage = error.response.data.error ? error.response.data.error.message : JSON.stringify(error.response.data);
      throw new Error(`OpenAI API Error: ${error.response.status} - ${errorMessage}`);
    } else if (error.request) {
      console.error("OpenAI Network Error:", error.request);
      throw new Error("OpenAI Network error - no response received");
    } else {
      console.error("OpenAI Error message:", error.message);
      throw error;
    }
  }
}

/**
 * Function to handle different providers
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
      return await queryOpenAI(prompt, model); // Updated to call queryOpenAI
    case 'deepseek':
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
        if (provider !== 'google' && provider !== 'openai') { // Updated to allow openai
          return res.status(400).json({ message: `Provider '${provider}' is not supported yet.` });
        }

        const response = await queryLLM(prompt, provider, model);
        res.json({ response, provider, model });
    } catch (error) {
        console.error('Error in /api/prompt:', error.message);
        res.status(500).json({ message: error.message || 'Failed to get response from LLM' });
    }
});

// New endpoint to fetch available models for a provider
app.get('/api/models/:provider', async (req, res) => {
  const { provider } = req.params;

  try {
    let models = [];
    switch (provider) {
      case 'google':
        const geminiResponse = await axios.get(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
        );
        if (geminiResponse.data && geminiResponse.data.models) {
          models = geminiResponse.data.models.map(model => ({
            id: model.name, // e.g., "models/gemini-1.5-pro-latest"
            name: model.displayName, // e.g., "Gemini 1.5 Pro"
            available: true,
            // Add other relevant properties if needed, like version: model.version
          }));
        }
        break;
      case 'openai':
        const openaiResponse = await axios.get('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
        });
        if (openaiResponse.data && openaiResponse.data.data) {
          models = openaiResponse.data.data.map(model => ({
            id: model.id, // e.g., "gpt-4o"
            name: model.id, // OpenAI API doesn't have a separate displayName, using id
            available: true,
            // Add other relevant properties if needed
          })).sort((a, b) => a.id.localeCompare(b.id)); // Optional: sort models by ID
        }
        break;
      default:
        return res.status(400).json({ message: `Provider '${provider}' is not supported for dynamic model fetching.` });
    }
    res.json(models);
  } catch (error) {
    console.error(`Error fetching models for ${provider}:`, error.message);
    if (error.response) {
      console.error(`API Error Data for ${provider}:`, error.response.data);
      console.error(`API Error Status for ${provider}:`, error.response.status);
    }
    res.status(500).json({ message: `Failed to fetch models for ${provider}. ${error.message}` });
  }
});

// For all other GET requests, serve the React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
