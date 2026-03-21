// routes/prompt.js
import express from 'express';
import axios from 'axios';
import GitHubModelsService from '../services/GitHubModelsService.js';

const router = express.Router();

// Base API endpoints
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const OPENAI_API_BASE = 'https://api.openai.com/v1';

/**
 * Query the Gemini API with a user prompt
 */
async function queryGemini(prompt, model = 'gemini-1.5-pro-002') {
  try {
    const apiUrl = `${GEMINI_API_BASE}/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await axios.post(apiUrl, {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    });

    if (response.data?.candidates?.[0]?.content?.parts?.[0]) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      console.error("Unexpected response structure from Gemini API:", response.data);
      throw new Error("Unexpected response structure from Gemini API");
    }
  } catch (error) {
    if (error.response) {
      console.error("API Error data:", error.response.data);
      console.error("API Error status:", error.response.status);
      const errorMessage = error.response.data.error 
        ? error.response.data.error.message 
        : JSON.stringify(error.response.data);
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
 */
async function queryOpenAI(prompt, model = 'gpt-4o') {
  try {
    const response = await axios.post(`${OPENAI_API_BASE}/chat/completions`, {
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    } else {
      console.error("Unexpected response structure from OpenAI API:", response.data);
      throw new Error("Unexpected response structure from OpenAI API");
    }
  } catch (error) {
    if (error.response) {
      console.error("OpenAI API Error:", error.response.data);
      const errorMessage = error.response.data.error?.message || JSON.stringify(error.response.data);
      throw new Error(`OpenAI API Error: ${error.response.status} - ${errorMessage}`);
    } else {
      console.error("OpenAI Error:", error.message);
      throw error;
    }
  }
}

/**
 * Query GitHub Models using the integrated service
 */
async function queryGitHubModel(prompt, model = 'openai/gpt-4o') {
  const GITHUB_PAT = process.env.GITHUB_PAT;
  
  if (!GITHUB_PAT) {
    throw new Error('GitHub PAT not configured');
  }

  try {
    const githubService = new GitHubModelsService(GITHUB_PAT);
    return await githubService.queryModel(prompt, model);
  } catch (error) {
    console.error("GitHub Models Error:", error.message);
    throw error;
  }
}

/**
 * Function to handle different providers
 */
async function queryLLM(prompt, provider = 'google', model = 'gemini-1.5-pro-002') {
  switch(provider) {
    case 'google':
      return await queryGemini(prompt, model);
    case 'openai':
      return await queryOpenAI(prompt, model);
    case 'github':
      return await queryGitHubModel(prompt, model);
    case 'deepseek':
      return "DeepSeek integration is coming soon!";
    default:
      throw new Error(`Provider '${provider}' is not supported yet.`);
  }
}

/**
 * POST /api/prompt
 * Handle single model prompts
 */
router.post('/', async (req, res) => {
  const { prompt, provider = 'google', model = 'gemini-1.5-pro-002' } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    // Allow google, openai, and github providers
    if (!['google', 'openai', 'github'].includes(provider)) {
      return res.status(400).json({ 
        message: `Provider '${provider}' is not supported yet.` 
      });
    }

    const response = await queryLLM(prompt, provider, model);
    res.json({ response, provider, model });
  } catch (error) {
    console.error('Error in /api/prompt:', error.message);
    res.status(500).json({ 
      message: error.message || 'Failed to get response from LLM' 
    });
  }
});

export default router;
