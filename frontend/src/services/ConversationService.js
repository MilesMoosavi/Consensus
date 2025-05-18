import StorageService from './StorageService';
import ApiService from './ApiService';
import { getActiveModelDetails, getModelDetailsById } from '../data/ProviderModelData';

/**
 * Handles conversation data and operations
 */
class ConversationService {
  /**
   * Creates a user message object
   * @param {string} content - Message content
   * @returns {Object} User message object
   */
  static createUserMessage(content) {
    return {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Creates an initial assistant message structure with placeholders
   * @param {Array} activeModelIds - IDs of active models
   * @param {Array} providers - Provider data
   * @returns {Object} Assistant message structure
   */
  static createAssistantMessageStructure(activeModelIds, providers) {
    const modelResponsePlaceholders = {};
    const activeModelDetails = getActiveModelDetails(activeModelIds, providers);
    
    activeModelDetails.forEach((model) => {
      modelResponsePlaceholders[model.id] = {
        modelId: model.id,
        modelName: model.name,
        providerName: model.providerName,
        providerIcon: model.providerIcon,
        content: "Generating response...",
        isLoading: true,
        error: null,
      };
    });

    return {
      id: `response-${Date.now()}`,
      role: "assistant",
      modelResponses: modelResponsePlaceholders,
      consensus: null,
      timestamp: new Date().toISOString(),
    };
  }
  /**
   * Updates an assistant message with a model response
   * @param {Array} messages - Current messages array
   * @param {string} assistantMessageId - ID of the message to update
   * @param {Array|Object} modelResponses - New model response data (single object or array)
   * @returns {Array} Updated messages array
   */
  static updateAssistantMessage(messages, assistantMessageId, modelResponses) {
    return messages.map((msg) => {
      if (msg.id === assistantMessageId) {
        const updatedModelResponses = { ...msg.modelResponses };
        
        // Handle both single response and array of responses
        const responsesToProcess = Array.isArray(modelResponses) ? modelResponses : [modelResponses];
        
        responsesToProcess.forEach(response => {
          if (updatedModelResponses[response.modelId]) {
            updatedModelResponses[response.modelId] = {
              ...updatedModelResponses[response.modelId],
              content: response.error
                ? `Error: ${response.error}`
                : response.content,
              isLoading: false,
              error: response.error,
            };
          }
        });
        
        return { ...msg, modelResponses: updatedModelResponses };
      }
      return msg;
    });
  }

  /**
   * Updates the consensus part of an assistant message
   * @param {Array} messages - Current messages array
   * @param {string} assistantMessageId - ID of the message to update
   * @param {Object} consensusData - New consensus data
   * @returns {Array} Updated messages array
   */
  static updateConsensus(messages, assistantMessageId, consensusData) {
    return messages.map((msg) => {
      if (msg.id === assistantMessageId) {
        return {
          ...msg,
          consensus: consensusData,
        };
      }
      return msg;
    });
  }

  /**
   * Saves the current conversation if in guest mode
   * @param {Array} messages - Current messages array
   */
  static saveCurrentConversation(messages) {
    if (StorageService.isGuestMode()) {
      StorageService.saveGuestConversation(messages);
    }
    // In the future, we could add logic here to save to the backend for logged-in users
  }

  /**
   * Loads the previous conversation
   * @returns {Array|null} Previous conversation or null if none exists
   */
  static loadPreviousConversation() {
    if (StorageService.isGuestMode()) {
      return StorageService.getGuestConversation();
    }
    return null;
    // In the future, we could add logic here to load from the backend for logged-in users
  }

  /**
   * Clears the current conversation
   */
  static clearConversation() {
    if (StorageService.isGuestMode()) {
      StorageService.clearGuestConversation();
    }
    // In the future, we could add logic here to handle clearing for logged-in users
  }
}

export default ConversationService;
