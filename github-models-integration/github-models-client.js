import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

/**
 * GitHub Models API Client
 * Provides unified access to multiple AI models through GitHub Models service
 */
export class GitHubModelsClient {
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
    'gpt-4o': 'openai/gpt-4o',
    'gpt-4o-mini': 'openai/gpt-4o-mini',
    
    // Meta Llama Models
    'llama-405b': 'meta-llama/Meta-Llama-3.1-405B-Instruct',
    'llama-70b': 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    'llama-8b': 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    
    // Mistral Models
    'mistral-large': 'mistralai/Mistral-large',
    'mistral-small': 'mistralai/Mistral-small',
    
    // Cohere Models
    'cohere-command-r-plus': 'cohere/Cohere-command-r-plus',
    'cohere-command-r': 'cohere/Cohere-command-r',
    
    // Microsoft Phi Models
    'phi-3-medium': 'microsoft/Phi-3-medium-128k-instruct',
    'phi-3-small': 'microsoft/Phi-3-small-128k-instruct'
  };

  /**
   * Send a chat completion request to a specific model
   * @param {string} model - Model identifier (use GitHubModelsClient.MODELS)
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Additional options (temperature, max_tokens, etc.)
   * @returns {Promise<Object>} Response from the model
   */
  async chatCompletion(model, messages, options = {}) {
    const {
      temperature = 0.7,
      max_tokens = 1000,
      top_p = 1.0,
      stream = false
    } = options;

    try {
      const response = await this.client.path("/chat/completions").post({
        body: {
          messages,
          model,
          temperature,
          max_tokens,
          top_p,
          stream
        }
      });

      if (response.status !== "200") {
        throw new Error(`API Error: ${response.body?.error?.message || 'Unknown error'}`);
      }

      return {
        content: response.body.choices[0].message.content,
        model: model,
        usage: response.body.usage,
        finish_reason: response.body.choices[0].finish_reason
      };
    } catch (error) {
      throw new Error(`GitHub Models API Error: ${error.message}`);
    }
  }

  /**
   * Query multiple models simultaneously for consensus building
   * @param {Array} models - Array of model identifiers
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Array of responses from all models
   */
  async queryMultipleModels(models, messages, options = {}) {
    const promises = models.map(async (model) => {
      try {
        const response = await this.chatCompletion(model, messages, options);
        return {
          model,
          success: true,
          ...response
        };
      } catch (error) {
        return {
          model,
          success: false,
          error: error.message
        };
      }
    });

    return Promise.all(promises);
  }

  /**
   * Get list of available models
   * @returns {Array} Array of model objects with display names and identifiers
   */
  static getAvailableModels() {
    return Object.entries(this.MODELS).map(([key, value]) => ({
      id: value,
      name: key,
      provider: value.split('/')[0],
      fullName: value
    }));
  }

  /**
   * Validate if a model is supported
   * @param {string} model - Model identifier to validate
   * @returns {boolean} True if model is supported
   */
  static isModelSupported(model) {
    return Object.values(this.MODELS).includes(model);
  }
}

export default GitHubModelsClient;
