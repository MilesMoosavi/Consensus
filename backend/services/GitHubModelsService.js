import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

/**
 * GitHub Models Service for Consensus Backend
 * Integrates your pre-built GitHub Models client with the existing backend
 */
export class GitHubModelsService {
  constructor(token) {
    this.token = token;
    this.endpoint = "https://models.github.ai/inference/";
    this.client = new ModelClient(this.endpoint, new AzureKeyCredential(this.token));
  }

  /**
   * Available models on GitHub Models platform
   */
  static MODELS = {
    // OpenAI Models
    'openai/gpt-4o': { name: 'GPT-4o', provider: 'OpenAI' },
    'openai/gpt-4o-mini': { name: 'GPT-4o Mini', provider: 'OpenAI' },
    
    // Meta Llama Models
    'meta-llama/Meta-Llama-3.1-405B-Instruct': { name: 'Llama 3.1 405B', provider: 'Meta' },
    'meta-llama/Meta-Llama-3.1-70B-Instruct': { name: 'Llama 3.1 70B', provider: 'Meta' },
    'meta-llama/Meta-Llama-3.1-8B-Instruct': { name: 'Llama 3.1 8B', provider: 'Meta' },
    
    // Mistral Models
    'mistralai/Mistral-large': { name: 'Mistral Large', provider: 'Mistral' },
    'mistralai/Mistral-small': { name: 'Mistral Small', provider: 'Mistral' },
    
    // Cohere Models
    'cohere/Cohere-command-r-plus': { name: 'Command R+', provider: 'Cohere' },
    'cohere/Cohere-command-r': { name: 'Command R', provider: 'Cohere' },
    
    // Microsoft Phi Models
    'microsoft/Phi-3-medium-128k-instruct': { name: 'Phi-3 Medium', provider: 'Microsoft' },
    'microsoft/Phi-3-small-128k-instruct': { name: 'Phi-3 Small', provider: 'Microsoft' }
  };

  /**
   * Query a GitHub model with a prompt
   * @param {string} prompt - The user's input prompt
   * @param {string} model - The model identifier
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The model's response
   */
  async queryModel(prompt, model, options = {}) {
    const {
      temperature = 0.7,
      max_tokens = 1000,
      top_p = 1.0
    } = options;

    try {
      const messages = [{ role: "user", content: prompt }];
      
      console.log(`[GitHubModelsService] Querying model: ${model}`);
      console.log(`[GitHubModelsService] Messages:`, JSON.stringify(messages, null, 2));
      
      const response = await this.client.path("/chat/completions").post({
        body: {
          messages,
          model,
          temperature,
          max_tokens,
          top_p,
          stream: false
        }
      });

      console.log(`[GitHubModelsService] Response status: ${response.status}`);
      console.log(`[GitHubModelsService] Response body:`, JSON.stringify(response.body, null, 2));

      if (response.status !== "200") {
        const errorMessage = response.body?.error?.message || 
                           response.body?.message || 
                           `HTTP ${response.status}`;
        throw new Error(`GitHub Models API Error: ${errorMessage}`);
      }

      if (!response.body?.choices?.[0]?.message?.content) {
        throw new Error(`GitHub Models API Error: Invalid response structure`);
      }

      return response.body.choices[0].message.content;
    } catch (error) {
      console.error(`[GitHubModelsService] Error for ${model}:`, error);
      if (error.message.includes('GitHub Models API Error')) {
        throw error;
      }
      throw new Error(`GitHub Models API Error: ${error.message}`);
    }
  }

  /**
   * Get list of available models
   * @returns {Array} Array of model objects with display names and identifiers
   */
  static getAvailableModels() {
    return Object.entries(this.MODELS).map(([id, info]) => ({
      id,
      name: info.name,
      provider: info.provider,
      available: true
    }));
  }

  /**
   * Validate if a model is supported
   * @param {string} model - Model identifier to validate
   * @returns {boolean} True if model is supported
   */
  static isModelSupported(model) {
    return Object.keys(this.MODELS).includes(model);
  }
}

export default GitHubModelsService;
