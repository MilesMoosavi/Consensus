import React, { useState, useEffect, useRef } from "react";
import { getActiveModelDetails, providerModelData } from "../data/ProviderModelData";
import ApiService from "../services/ApiService";
import ConversationService from "../services/ConversationService";
import StorageService from "../services/StorageService";
import ThemeService from "../services/ThemeService";
import { renderFormattedContent } from "../utils/formatters";
import GuestModeToggle from "./GuestModeToggle";
import "./MainChatApp.css";

const MainChatApp = () => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModels, setActiveModels] = useState([]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [modelSettings, setModelSettings] = useState({});
  const [darkMode, setDarkMode] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const messagesEndRef = useRef(null);
  const modelSelectorRef = useRef(null);

  // Initialize model settings and theme on component mount
  useEffect(() => {
    // Load theme
    const isDarkMode = ThemeService.initializeTheme();
    setDarkMode(isDarkMode);

    // Check if guest mode is active
    const guestModeActive = StorageService.isGuestMode();
    setIsGuestMode(guestModeActive);

    // Load saved settings from localStorage if available
    const savedActiveModels = StorageService.getActiveModels();
    const savedModelSettings = StorageService.getModelSettings();

    if (savedActiveModels) {
      setActiveModels(savedActiveModels);
    }

    if (savedModelSettings) {
      setModelSettings(savedModelSettings);
    } else {
      // Initialize default settings for each model
      const initialSettings = {};
      providerModelData.forEach((provider) => {
        provider.models.forEach((model) => {
          initialSettings[model.id] = {
            useInternet: false,
            temperature: 0.7,
            maxTokens: 800,
            visible: true,
          };
        });
      });
      setModelSettings(initialSettings);
    }

    // Load previous conversation if in guest mode
    if (guestModeActive) {
      const previousConversation = ConversationService.loadPreviousConversation();
      if (previousConversation && previousConversation.length > 0) {
        setMessages(previousConversation);
      }
    }
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    if (activeModels.length > 0) {
      StorageService.saveActiveModels(activeModels);
    }
    
    if (Object.keys(modelSettings).length > 0) {
      StorageService.saveModelSettings(modelSettings);
    }
    
    // Save conversation if in guest mode
    if (isGuestMode && messages.length > 0) {
      ConversationService.saveCurrentConversation(messages);
    }
  }, [activeModels, modelSettings, messages, isGuestMode]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle clicks outside of dropdowns to close them
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        modelSelectorRef.current &&
        !modelSelectorRef.current.contains(event.target)
      ) {
        setShowModelSelector(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newDarkMode = ThemeService.toggleTheme(darkMode);
    setDarkMode(newDarkMode);
  };

  // Handle guest mode toggle
  const handleGuestModeToggle = (newGuestMode) => {
    setIsGuestMode(newGuestMode);
    
    if (newGuestMode) {
      // If enabling guest mode, save current conversation
      if (messages.length > 0) {
        ConversationService.saveCurrentConversation(messages);
      }
    } else {
      // If disabling guest mode, clear stored conversation
      ConversationService.clearConversation();
    }
  };

  const toggleModelActivation = (modelId) => {
    setActiveModels((prevModels) => {
      if (prevModels.includes(modelId)) {
        return prevModels.filter((id) => id !== modelId);
      } else {
        // Update settings for this model if it doesn't exist
        if (!modelSettings[modelId]) {
          setModelSettings((prevSettings) => ({
            ...prevSettings,
            [modelId]: {
              useInternet: false,
              temperature: 0.7,
              maxTokens: 800,
              visible: true,
            },
          }));
        }
        return [...prevModels, modelId];
      }
    });
  };

  const toggleModelVisibility = (modelId) => {
    setModelSettings((prevSettings) => ({
      ...prevSettings,
      [modelId]: {
        ...prevSettings[modelId],
        visible: !prevSettings[modelId]?.visible,
      },
    }));
  };

  const toggleModelSetting = (modelId, setting) => {
    setModelSettings((prevSettings) => ({
      ...prevSettings,
      [modelId]: {
        ...prevSettings[modelId],
        [setting]: !prevSettings[modelId]?.[setting],
      },
    }));
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      return;
    }

    if (activeModels.length === 0) {
      alert("Please select at least one model.");
      setShowModelSelector(true);
      return;
    }

    const originalUserPrompt = prompt; // Store original prompt for consensus
    const userPromptWithCustomInstruction = `${originalUserPrompt}

Please box your final answer in LaTeX if possible.`;

    // Add user message to the chat
    const userMessage = ConversationService.createUserMessage(originalUserPrompt);

    // Create response placeholders for each active model
    const assistantMessage = ConversationService.createAssistantMessageStructure(
      activeModels, 
      providerModelData
    );

    setMessages([...messages, userMessage, assistantMessage]);
    setIsLoading(true); // For initial batch of requests
    setPrompt(""); // Clear the input

    try {
      // Make requests for each active model
      const requests = activeModels.map(async (modelId) => {
        try {
          const providerId =
            providerModelData.find((p) => p.models.some((m) => m.id === modelId))?.id ||
            "google";

          const data = await ApiService.sendPrompt(
            userPromptWithCustomInstruction,
            modelId,
            providerId,
            modelSettings[modelId] || {}
          );

          return {
            modelId,
            modelName: assistantMessage.modelResponses[modelId]?.modelName || modelId,
            content: data.response,
            isLoading: false,
            error: null,
          };
        } catch (error) {
          console.error(`Error fetching response from ${modelId}:`, error);
          return {
            modelId,
            modelName: assistantMessage.modelResponses[modelId]?.modelName || modelId,
            content: null,
            isLoading: false,
            error: error.message,
          };
        }
      });

      // Wait for all initial requests to complete
      const results = await Promise.all(requests);

      // Update the response message with the actual responses
      const updatedMessages = ConversationService.updateAssistantMessage(
        messages,
        assistantMessage.id,
        results
      );
      setMessages(updatedMessages);

      // --- Consensus Generation ---
      const successfulResponses = results.filter((r) => !r.error && r.content);
      if (successfulResponses.length >= 1) {
        // Changed to >=1 for testing, ideally >=2
        // Update UI to show consensus is loading
        setMessages((prevMessages) =>
          ConversationService.updateConsensus(
            prevMessages,
            assistantMessage.id,
            {
              isLoading: true,
              content: "Generating consensus...",
              error: null,
            }
          )
        );

        try {
          const consensusData = await ApiService.generateConsensus(
            originalUserPrompt,
            successfulResponses
          );

          setMessages((prevMessages) =>
            ConversationService.updateConsensus(
              prevMessages,
              assistantMessage.id,
              {
                isLoading: false,
                content: consensusData.response,
                error: null,
              }
            )
          );
        } catch (consensusError) {
          console.error("Error generating consensus:", consensusError);
          setMessages((prevMessages) =>
            ConversationService.updateConsensus(
              prevMessages,
              assistantMessage.id,
              {
                isLoading: false,
                content: null,
                error: consensusError.message,
              }
            )
          );
        }
      } else {
        // If not enough successful responses for consensus
        setMessages((prevMessages) =>
          ConversationService.updateConsensus(
            prevMessages,
            assistantMessage.id,
            {
              isLoading: false,
              content:
                successfulResponses.length === 1
                  ? "Not enough responses to generate a consensus (only 1 successful response)."
                  : "No successful responses to generate a consensus.",
              error: null,
            }
          )
        );
      }
    } catch (error) {
      console.error("Error handling requests:", error);
      // Add error message to chat
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: `error-${Date.now()}`,
          role: "system",
          content: `Error: ${error.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get active models with their provider information
  const activeModelDetails = getActiveModelDetails(activeModels, providerModelData);

  return (
    <div className="chat-app">
      {/* Header with model selector */}
      <header className="chat-header">
        <div className="header-left">
          <h1>Consensus</h1>

          {/* Provider/Model selector dropdown */}
          <div className="model-selector-container" ref={modelSelectorRef}>
            <button
              className="model-selector-button"
              onClick={() => setShowModelSelector(!showModelSelector)}
            >
              {activeModelDetails.length === 0 ? (
                <span>Select Models</span>
              ) : (
                <span>
                  {activeModelDetails.length} model
                  {activeModelDetails.length !== 1 ? "s" : ""} active
                </span>
              )}
              <span className="dropdown-arrow">▼</span>
            </button>

            {showModelSelector && (
              <div className="model-dropdown">
                {providerModelData.map((provider) => (
                  <div key={provider.id} className="provider-section">
                    <div className="provider-header">
                      <span>
                        {provider.icon} {provider.name}
                      </span>
                      {!provider.available && (
                        <span className="coming-soon-tag">Coming Soon</span>
                      )}
                    </div>

                    {provider.available && (
                      <div className="model-list">
                        {provider.models.map((model) => (
                          <div
                            key={model.id}
                            className={`model-item ${
                              activeModels.includes(model.id) ? "active" : ""
                            } ${!model.available ? "disabled" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (model.available) {
                                toggleModelActivation(model.id);
                              }
                            }}
                          >
                            <span className="model-checkbox">
                              {activeModels.includes(model.id) ? "✓" : ""}
                            </span>
                            <span className="model-name">{model.name}</span>
                            {!model.available && (
                              <span className="model-coming-soon">Soon</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="header-right">
          <GuestModeToggle 
            isGuestMode={isGuestMode}
            onGuestModeChange={handleGuestModeToggle}
          />
          <button
            className="icon-button theme-toggle"
            title="Toggle theme"
            onClick={toggleTheme}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button className="icon-button" title="Settings">
            ⚙️
          </button>
          <button className="icon-button" title="Help">
            ❓
          </button>
        </div>
      </header>

      {/* Main chat window */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <h2>Welcome to Consensus</h2>
            <p>Select models and start chatting to compare responses</p>
            {isGuestMode && (
              <p className="guest-mode-notice">
                You're in temporary chat mode. Conversations will be cleared on page reload.
              </p>
            )}
            <button
              className="select-models-button"
              onClick={() => setShowModelSelector(true)}
            >
              Select Models
            </button>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              {message.role === "user" ? (
                <>
                  <div className="user-avatar">👤</div>
                  <div className="message-content">
                    {/* Render user message content */}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderFormattedContent(message.content),
                      }}
                    />
                  </div>
                </>
              ) : message.role === "system" ? (
                <div className="system-message">{message.content}</div>
              ) : (
                <div className="assistant-responses">
                  {Object.entries(message.modelResponses).map(
                    ([modelId, response]) => {
                      const settings = modelSettings[modelId] || {
                        visible: true,
                      };
                      return (
                        <div
                          key={modelId}
                          className={`model-response ${
                            !settings.visible ? "collapsed" : ""
                          }`}
                        >
                          <div
                            className="model-response-header"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleModelVisibility(modelId);
                            }}
                          >
                            <div className="model-info">
                              <span className="model-icon">
                                {response.providerIcon}
                              </span>
                              <span className="model-name">
                                {response.modelName}
                              </span>
                              {response.isLoading && (
                                <span className="loading-indicator">⏳</span>
                              )}
                              {response.error && (
                                <span className="error-indicator">⚠️</span>
                              )}
                            </div>
                            <div className="model-controls">
                              <button
                                className={`model-setting-button ${
                                  modelSettings[modelId]?.useInternet
                                    ? "active"
                                    : ""
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleModelSetting(modelId, "useInternet");
                                }}
                                title="Toggle Internet Access"
                              >
                                🌐
                              </button>
                              {/* Add more controls here if needed */}
                            </div>
                          </div>
                          {settings.visible && (
                            <div className="model-response-content">
                              {response.isLoading ? (
                                <div className="skeleton-loader"></div>
                              ) : response.error ? (
                                <div className="error-message">
                                  {response.error}
                                </div>
                              ) : (
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: renderFormattedContent(
                                      response.content
                                    ),
                                  }}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}

                  {/* Consensus Response Section */}
                  {message.consensus && (
                    <div className="consensus-response">
                      <div className="consensus-header">
                        <span className="consensus-icon">🤝</span>
                        <span>Consensus (via Gemini 2.0 Flash)</span>
                        {message.consensus.isLoading && (
                          <span className="loading-indicator">⏳</span>
                        )}
                        {message.consensus.error && (
                          <span className="error-indicator">⚠️</span>
                        )}
                      </div>
                      <div className="consensus-content">
                        {message.consensus.isLoading ? (
                          <div className="skeleton-loader"></div>
                        ) : message.consensus.error ? (
                          <div className="error-message">
                            {message.consensus.error}
                          </div>
                        ) : message.consensus.content ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: renderFormattedContent(
                                message.consensus.content
                              ),
                            }}
                          />
                        ) : (
                          <p>No consensus generated.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <div className="chat-input">
        <div className="input-container">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              activeModels.length === 0
                ? "Select models first..."
                : "Type your message..."
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isLoading || activeModels.length === 0}
          />
          <div className="input-actions">
            <button className="action-button" title="Attach file">
              📎
            </button>
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={
                isLoading || !prompt.trim() || activeModels.length === 0
              }
            >
              {isLoading ? "⏳" : "➤"}
            </button>
          </div>
        </div>

        <div className="active-models-chips">
          {activeModelDetails.map((model) => (
            <div key={model.id} className="model-chip">
              <span className="model-icon">{model.providerIcon}</span>
              <span className="model-name">{model.name}</span>
              <button
                className="remove-model"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleModelActivation(model.id);
                }}
                title={`Remove ${model.name}`}
              >
                ×              </button>
            </div>
          ))}        </div>
      </div>    </div>
  );
};

export default MainChatApp;
