/**
 * Handles all API interactions with the backend
 */
class ApiService {
    // Use VITE_API_URL to align with .env.example.frontend
    static API_URL = import.meta.env.VITE_API_URL || ''; 
    /**
     * Sends a prompt to the API for model processing
     * @param {string} prompt - The user's prompt
     * @param {string} modelId - The ID of the model to use
     * @param {string} providerId - The provider ID (google, openai, etc.)
     * @param {Object} settings - Model-specific settings
     * @returns {Promise<Object>} The API response
     */
    static async sendPrompt(prompt, modelId, providerId, settings = {}) {
      try {
        const res = await fetch(`${this.API_URL}/prompt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            model: modelId,
            provider: providerId,
            settings: settings || {},
          }),
        });
  
        // Improved error handling - check response before parsing JSON
        if (!res.ok) {
          let errorMessage = `HTTP error! Status: ${res.status}`;
          try {
            // Try to parse error response as JSON
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            // If JSON parsing fails, try to get text instead
            try {
              const errorText = await res.text();
              errorMessage = errorText || errorMessage;
            } catch (textError) {
              // Fallback if even text extraction fails
              console.error("Could not extract error details:", textError);
            }
          }
          throw new Error(errorMessage);
        }
  
        // Safely parse the JSON response with error handling
        try {
          const data = await res.json();
          return data;
        } catch (jsonError) {
          console.error("JSON parsing error:", jsonError);
          throw new Error("Invalid response format from server");
        }
      } catch (error) {
        console.error(`API request failed:`, error);
        throw error;
      }
    }
  
    /**
     * Generates a consensus from multiple model responses using the new consensus API
     * @param {string} prompt - The user's prompt
     * @param {Array} models - Array of model IDs to query
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} The consensus response
     */
    static async generateMultiModelConsensus(prompt, models, options = {}) {
      try {
        const res = await fetch(`${this.API_URL}/consensus`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            models,
            options
          }),
        });

        if (!res.ok) {
          let errorMessage = `HTTP error! Status: ${res.status}`;
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            try {
              const errorText = await res.text();
              errorMessage = errorText || errorMessage;
            } catch (textError) {
              console.error("Could not extract error details:", textError);
            }
          }
          throw new Error(errorMessage);
        }

        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error generating multi-model consensus:", error);
        throw error;
      }
    }

    /**
     * Get available models for consensus
     * @returns {Promise<Array>} List of available consensus models
     */
    static async getConsensusModels() {
      try {
        const response = await fetch(`${this.API_URL}/consensus/models`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch consensus models. Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching consensus models:", error);
        throw error;
      }
    }

    /**
     * Generates a consensus from multiple model responses (LEGACY - using Gemini)
     * @param {string} originalPrompt - The user's original prompt
     * @param {Array} modelResponses - Array of successful model responses
     * @param {string} consensusModelId - Model ID to use for consensus generation
     * @param {Object} consensusSettings - Settings for the consensus model
     * @returns {Promise<Object>} The consensus response
     */
    static async generateConsensus(
      originalPrompt,
      modelResponses,
      consensusModelId = "gemini-2.0-flash",
      consensusSettings = { temperature: 0.5, maxTokens: 1000 }
    ) {
      let consensusPromptText = `The user's original prompt was: "${originalPrompt}"
      
      Based on the following responses from different AI models, please synthesize a single, comprehensive consensus answer. Analyze the responses for agreement and disagreement, and provide a final answer that reflects the most likely correct or comprehensive information. Please box your final consensus answer in LaTeX if possible.
      
      `;
      modelResponses.forEach((response) => {
        consensusPromptText += `Response from ${response.modelName}:
      ${response.content}
      
      `;
      });
  
      try {
        return await this.sendPrompt(
          consensusPromptText,
          consensusModelId,
          "google",
          consensusSettings
        );
      } catch (error) {
        console.error("Error generating consensus:", error);
        throw error;
      }
    }

    /**
     * Fetches available models from the backend for a specific provider
     * @param {string} provider - The provider ID (e.g., 'openai', 'google')
     * @returns {Promise<Array>} List of available models for the provider
     */
    static async getModels(provider) {
      try {
        console.log(`ApiService: Fetching models for ${provider} from ${this.API_URL}/models/${provider}`);
        const response = await fetch(`${this.API_URL}/models/${provider}`);
        console.log(`ApiService: Response status for ${provider}: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`ApiService: Error fetching models for ${provider}. Status: ${response.status}, Body: ${errorText}`);
          throw new Error(`Failed to fetch models for ${provider}. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`ApiService: Successfully fetched models for ${provider}:`, data);
        return data;
      } catch (error) {
        console.error(`ApiService: Catch block - Error fetching models for ${provider}:`, error);
        // Rethrowing so the component can handle it (e.g., show an error message)
        throw error;
      }
    }
  }
  
  export default ApiService;