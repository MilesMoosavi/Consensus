// routes/consensus.js
import express from 'express';
import GitHubModelsService from '../services/GitHubModelsService.js';

const router = express.Router();

/**
 * Consensus Engine - simplified version
 * This is a basic implementation of consensus algorithms
 */
class ConsensusEngine {
  /**
   * Simple majority voting for categorical responses
   */
  static majorityVoting(responses) {
    const validResponses = responses.filter(r => r.success);
    
    if (validResponses.length === 0) {
      return {
        consensus: null,
        confidence: 0,
        method: 'majority_voting',
        error: 'No valid responses received'
      };
    }

    // Count frequency of each response
    const responseFrequency = {};
    validResponses.forEach(response => {
      const content = response.content.trim().toLowerCase();
      responseFrequency[content] = (responseFrequency[content] || 0) + 1;
    });

    // Find most frequent response
    const sortedResponses = Object.entries(responseFrequency)
      .sort(([,a], [,b]) => b - a);
    
    const [consensusContent, frequency] = sortedResponses[0];
    const confidence = frequency / validResponses.length;

    return {
      consensus: consensusContent,
      confidence,
      method: 'majority_voting',
      frequency,
      totalResponses: validResponses.length,
      supportingModels: validResponses
        .filter(r => r.content.trim().toLowerCase() === consensusContent)
        .map(r => r.model)
    };
  }

  /**
   * Generate a summary of consensus analysis
   */
  static generateSummary(consensusResult, originalResponses) {
    const validResponses = originalResponses.filter(r => r.success);
    const failedCount = originalResponses.length - validResponses.length;
    
    let summary = `Consensus Analysis:\n`;
    summary += `- Queried ${originalResponses.length} models\n`;
    
    if (failedCount > 0) {
      summary += `- ${failedCount} models failed to respond\n`;
    }
    
    summary += `- Method used: ${consensusResult.method}\n`;
    summary += `- Confidence: ${(consensusResult.confidence * 100).toFixed(1)}%\n`;
    
    if (consensusResult.consensus) {
      summary += `- Consensus answer: "${consensusResult.consensus}"\n`;
    } else {
      summary += `- No clear consensus reached\n`;
    }
    
    if (consensusResult.supportingModels) {
      summary += `- Supporting models: ${consensusResult.supportingModels.join(', ')}\n`;
    }
    
    return summary;
  }
}

/**
 * Query multiple GitHub Models simultaneously
 */
async function queryMultipleGitHubModels(models, prompt, options = {}) {
  const GITHUB_PAT = process.env.GITHUB_PAT;
  
  if (!GITHUB_PAT) {
    throw new Error('GitHub PAT not configured');
  }

  const githubService = new GitHubModelsService(GITHUB_PAT);
  
  const promises = models.map(async (model) => {
    try {
      const content = await githubService.queryModel(prompt, model, options);
      return {
        model,
        success: true,
        content,
        provider: 'github'
      };
    } catch (error) {
      return {
        model,
        success: false,
        error: error.message,
        provider: 'github'
      };
    }
  });

  return Promise.all(promises);
}

/**
 * POST /api/consensus
 * Generate consensus from multiple models
 */
router.post('/', async (req, res) => {
  const { 
    prompt, 
    models = [
      'openai/gpt-4o-mini',
      'meta-llama/Meta-Llama-3.1-8B-Instruct',
      'mistralai/Mistral-small'
    ],
    options = {}
  } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    console.log(`Generating consensus for prompt: "${prompt}"`);
    console.log(`Using models: ${models.join(', ')}`);

    // Query all models
    const responses = await queryMultipleGitHubModels(models, prompt, options);
    
    // Generate consensus
    const consensus = ConsensusEngine.majorityVoting(responses);
    const summary = ConsensusEngine.generateSummary(consensus, responses);

    res.json({
      prompt,
      responses,
      consensus,
      summary,
      modelsQueried: models.length,
      successfulResponses: responses.filter(r => r.success).length
    });

  } catch (error) {
    console.error('Error in /api/consensus:', error.message);
    res.status(500).json({ 
      message: error.message || 'Failed to generate consensus',
      error: error.message 
    });
  }
});

/**
 * GET /api/consensus/models
 * Get available models for consensus
 */
router.get('/models', (req, res) => {
  try {
    const models = GitHubModelsService.getAvailableModels();
    res.json(models);
  } catch (error) {
    console.error('Error fetching consensus models:', error.message);
    res.status(500).json({ 
      message: 'Failed to fetch available models',
      error: error.message 
    });
  }
});

export default router;
