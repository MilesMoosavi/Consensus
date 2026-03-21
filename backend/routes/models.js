// routes/models.js
import express from 'express';
import axios from 'axios';
import GitHubModelsService from '../services/GitHubModelsService.js';

const router = express.Router();

/**
 * GET /api/models/:provider
 * Fetch available models for a specific provider
 */
router.get('/:provider', async (req, res) => {
  const { provider } = req.params;

  try {
    let models = [];
    
    switch (provider) {
      case 'google':
        // Fetch Gemini models
        if (!process.env.GEMINI_API_KEY) {
          console.warn('GEMINI_API_KEY not configured. Skipping Google models.');
          models = [];
          break;
        }
        
        const geminiResponse = await axios.get(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
        );
        
        if (geminiResponse.data && geminiResponse.data.models) {
          models = geminiResponse.data.models.map(model => ({
            id: model.name, // e.g., "models/gemini-1.5-pro-latest"
            name: model.displayName, // e.g., "Gemini 1.5 Pro"
            available: true,
          }));
        }
        break;

      case 'openai':
        // Fetch OpenAI models
        if (!process.env.OPENAI_API_KEY) {
          console.warn('OPENAI_API_KEY not configured. Skipping OpenAI models.');
          models = [];
          break;
        }
        
        const openaiResponse = await axios.get('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
        });
        
        if (openaiResponse.data && openaiResponse.data.data) {
          models = openaiResponse.data.data.filter(model => {
            return model.id.startsWith('gpt-');
          }).map(model => ({
            id: model.id,
            name: model.id,
            available: true,
          })).sort((a, b) => a.id.localeCompare(b.id));
        }
        break;

      case 'github':
        // Use GitHub Models service
        models = GitHubModelsService.getAvailableModels();
        break;

      default:
        return res.status(400).json({ 
          message: `Provider '${provider}' is not supported for dynamic model fetching.` 
        });
    }

    res.json(models);
  } catch (error) {
    console.error(`Error fetching models for ${provider}:`, error);
    res.status(500).json({ 
      message: `Failed to fetch models for ${provider}`, 
      error: error.message 
    });
  }
});

export default router;
