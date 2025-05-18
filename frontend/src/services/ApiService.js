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
     * Generates a consensus from multiple model responses
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
        const response = await fetch(`${this.API_URL}/models/${provider}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching models for ${provider}:`, error);
        // Optionally, rethrow the error or return a default/empty array
        // depending on how you want the frontend to handle this.
        throw error; // Rethrowing for now, so the caller can handle it
      }
    }
  }
  
  export default ApiService;