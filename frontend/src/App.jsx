import { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Helper function to render content with Markdown and LaTeX
const renderFormattedContent = (content) => {
  if (typeof content !== 'string') {
    return ''; // Or some fallback for non-string content
  }
  let processedInput = content;

  // Step 1: Render LaTeX from the raw input
  // Handle block formulas first
  processedInput = processedInput.replace(/\$\$(.*?)\$\$/gs, (match, p1) => {
    try {
      return `<div style='text-align: center;'>${katex.renderToString(p1.trim(), { throwOnError: false, displayMode: true, trust: true })}</div>`;
    } catch (e) {
      return `<div style='color: red;'>Error rendering block formula: ${match} (${e.message})</div>`;
    }
  });

  // Handle inline formulas
  processedInput = processedInput.replace(/\$(.*?)\$/g, (match, p1) => {
    if (match.startsWith('$$') || match.endsWith('$$')) {
      return match;
    }
    try {
      return katex.renderToString(p1.trim(), { throwOnError: false, trust: true });
    } catch (e) {
      return `<span style='color: red;'>Error rendering inline formula: ${match} (${e.message})</span>`;
    }
  });

  // Step 2: Render Markdown from the processed input (which now has HTML for LaTeX)
  // Make sure to sanitize if the content can come from untrusted sources.
  // For this internal tool, we might skip heavy sanitization if performance is key and content is trusted.
  const finalHtml = marked.parse(processedInput);
  return finalHtml;
};

function App() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // General loading for initial prompt submission
  const [activeModels, setActiveModels] = useState([]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [modelSettings, setModelSettings] = useState({});
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const messagesEndRef = useRef(null);
  
  const modelSelectorRef = useRef(null);
  
  // Available providers and their models
  const providers = useMemo(() => [
    { 
      id: 'google', 
      name: 'Google', 
      icon: '🔍',
      available: true,
      models: [
        // Gemini 1.5 Models
        { id: 'gemini-1.5-pro-002', name: 'Gemini 1.5 Pro', available: true },
        { id: 'gemini-1.5-flash-002', name: 'Gemini 1.5 Flash', available: true },
        { id: 'gemini-1.5-flash-8b-001', name: 'Gemini 1.5 Flash 8B', available: true },
        
        // Gemini 2.0 Models
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', available: true },
        { id: 'gemini-2.0-flash-001', name: 'Gemini 2.0 Flash 001', available: true },
        { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', available: true },
        
        // Gemini 2.5 Models
        { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro Preview', available: true },
        { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash Preview', available: true }
      ]
    },
    { 
      id: 'openai', 
      name: 'OpenAI',
      icon: '🤖',
      available: false,
      models: [
        { id: 'gpt-4', name: 'GPT-4', available: false },
        { id: 'gpt-4o', name: 'GPT-4o', available: false }
      ]
    },
    { 
      id: 'deepseek', 
      name: 'DeepSeek',
      icon: '🔍',
      available: false,
      models: [
        { id: 'deepseek-coder', name: 'DeepSeek Coder', available: false },
        { id: 'deepseek-chat', name: 'DeepSeek Chat', available: false }
      ]
    }
  ], []);

  // Initialize model settings on component mount
  useEffect(() => {
    // Load saved settings from localStorage if available
    const savedActiveModels = localStorage.getItem('activeModels');
    const savedModelSettings = localStorage.getItem('modelSettings');
    
    if (savedActiveModels) {
      try {
        const parsedActiveModels = JSON.parse(savedActiveModels);
        setActiveModels(parsedActiveModels);
      } catch (e) {
        console.error('Failed to parse saved active models', e);
        setActiveModels([]);
      }
    }
    
    if (savedModelSettings) {
      try {
        const parsedModelSettings = JSON.parse(savedModelSettings);
        setModelSettings(parsedModelSettings);
      } catch (e) {
        console.error('Failed to parse saved model settings', e);
        setModelSettings({});
      }
    } else {
      // Initialize default settings for each model
      const initialSettings = {};
      providers.forEach(provider => {
        provider.models.forEach(model => {
          initialSettings[model.id] = {
            useInternet: false,
            temperature: 0.7,
            maxTokens: 800,
            visible: true
          };
        });
      });
      setModelSettings(initialSettings);
    }
  }, [providers]);
  
  // Save settings whenever they change
  useEffect(() => {
    if (activeModels.length > 0) {
      localStorage.setItem('activeModels', JSON.stringify(activeModels));
    }
    if (Object.keys(modelSettings).length > 0) {
      localStorage.setItem('modelSettings', JSON.stringify(modelSettings));
    }
  }, [activeModels, modelSettings]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle clicks outside of dropdowns to close them
  useEffect(() => {
    function handleClickOutside(event) {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target)) {
        setShowModelSelector(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Initialize theme and set class on document
  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark-mode');
    } else {
      // Default to dark mode
      setDarkMode(true);
      document.documentElement.classList.add('dark-mode');
    }
  }, []);
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  const toggleModelActivation = (modelId) => {
    setActiveModels(prevModels => {
      if (prevModels.includes(modelId)) {
        return prevModels.filter(id => id !== modelId);
      } else {
        // Update settings for this model if it doesn't exist
        if (!modelSettings[modelId]) {
          setModelSettings(prevSettings => ({
            ...prevSettings,
            [modelId]: {
              useInternet: false,
              temperature: 0.7,
              maxTokens: 800,
              visible: true
            }
          }));
        }
        return [...prevModels, modelId];
      }
    });
  };

  const toggleModelVisibility = (modelId) => {
    setModelSettings(prevSettings => ({
      ...prevSettings,
      [modelId]: {
        ...prevSettings[modelId],
        visible: !prevSettings[modelId]?.visible
      }
    }));
  };

  const toggleModelSetting = (modelId, setting) => {
    setModelSettings(prevSettings => ({
      ...prevSettings,
      [modelId]: {
        ...prevSettings[modelId],
        [setting]: !prevSettings[modelId]?.[setting]
      }
    }));
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      return;
    }

    if (activeModels.length === 0) {
      alert('Please select at least one model.');
      setShowModelSelector(true);
      return;
    }

    const originalUserPrompt = prompt; // Store original prompt for consensus
    const userPromptWithCustomInstruction = `${originalUserPrompt}

Please box your final answer in LaTeX if possible.`;

    // Add user message to the chat
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: originalUserPrompt, // Show original prompt in UI
      timestamp: new Date().toISOString()
    };
    
    // Create response placeholders for each active model
    const modelResponsePlaceholders = {};
    activeModels.forEach(modelId => {
      const provider = providers.find(p => 
        p.models.some(m => m.id === modelId)
      );
      const model = provider?.models.find(m => m.id === modelId);
      
      if (model) {
        modelResponsePlaceholders[modelId] = {
          modelId,
          modelName: model.name,
          providerName: provider.name,
          providerIcon: provider.icon,
          content: 'Generating response...',
          isLoading: true,
          error: null
        };
      }
    });
    
    // Add the assistant message structure (including placeholders and initial consensus state)
    const assistantMessageId = `response-${Date.now()}`;
    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      modelResponses: modelResponsePlaceholders,
      consensus: null, // Initialize consensus part
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, userMessage, assistantMessage]);
    setIsLoading(true); // For initial batch of requests
    setPrompt(''); // Clear the input

    try {
      // Make requests for each active model
      const requests = activeModels.map(async (modelId) => {
        try {
          const providerId = providers.find(p => 
            p.models.some(m => m.id === modelId)
          )?.id || 'google';
          
          const res = await fetch('/api/prompt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              prompt: userPromptWithCustomInstruction, // Use prompt with custom instruction
              model: modelId,
              provider: providerId,
              settings: modelSettings[modelId] || {}
            }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
          }

          const data = await res.json();
          return { 
            modelId, 
            modelName: modelResponsePlaceholders[modelId]?.name || modelId, // Keep modelName for consensus prompt
            content: data.response,
            isLoading: false,
            error: null 
          };
        } catch (error) {
          console.error(`Error fetching response from ${modelId}:`, error);
          return { 
            modelId,
            modelName: modelResponsePlaceholders[modelId]?.name || modelId,
            content: null,
            isLoading: false,
            error: error.message
          };
        }
      });

      // Wait for all initial requests to complete
      const results = await Promise.all(requests);
      
      // Update the response message with the actual responses
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.id === assistantMessageId) {
            const updatedModelResponses = { ...msg.modelResponses };
            results.forEach(result => {
              if (updatedModelResponses[result.modelId]) {
                updatedModelResponses[result.modelId] = {
                  ...updatedModelResponses[result.modelId],
                  content: result.error ? `Error: ${result.error}` : result.content,
                  isLoading: false,
                  error: result.error
                };
              }
            });
            return { ...msg, modelResponses: updatedModelResponses };
          }
          return msg;
        })
      );

      // --- Consensus Generation ---
      const successfulResponses = results.filter(r => !r.error && r.content);
      if (successfulResponses.length >= 1) { // Changed to >=1 for testing, ideally >=2
        // Update UI to show consensus is loading
        setMessages(prevMessages =>
          prevMessages.map(msg => {
            if (msg.id === assistantMessageId) {
              return {
                ...msg,
                consensus: {
                  isLoading: true,
                  content: 'Generating consensus...',
                  error: null,
                },
              };
            }
            return msg;
          })
        );

        let consensusPromptText = `The user's original prompt was: "${originalUserPrompt}"

Based on the following responses from different AI models, please synthesize a single, comprehensive consensus answer. Analyze the responses for agreement and disagreement, and provide a final answer that reflects the most likely correct or comprehensive information. Please box your final consensus answer in LaTeX if possible.

`;
        successfulResponses.forEach(response => {
          consensusPromptText += `Response from ${response.modelName}:
${response.content}

`;
        });

        const consensusModelId = 'gemini-2.0-flash';
        const consensusProvider = providers.find(p => p.models.some(m => m.id === consensusModelId));
        const consensusProviderId = consensusProvider ? consensusProvider.id : 'google';
        const consensusModelSettings = modelSettings[consensusModelId] || { temperature: 0.5, maxTokens: 1000 }; // Specific settings for consensus

        try {
          const consensusRes = await fetch('/api/prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: consensusPromptText,
              model: consensusModelId,
              provider: consensusProviderId,
              settings: consensusModelSettings,
            }),
          });

          if (!consensusRes.ok) {
            const errorData = await consensusRes.json();
            throw new Error(errorData.message || `HTTP error! Status: ${consensusRes.status}`);
          }
          const consensusData = await consensusRes.json();
          
          setMessages(prevMessages =>
            prevMessages.map(msg => {
              if (msg.id === assistantMessageId) {
                return {
                  ...msg,
                  consensus: {
                    isLoading: false,
                    content: consensusData.response,
                    error: null,
                  },
                };
              }
              return msg;
            })
          );

        } catch (consensusError) {
          console.error('Error generating consensus:', consensusError);
          setMessages(prevMessages =>
            prevMessages.map(msg => {
              if (msg.id === assistantMessageId) {
                return {
                  ...msg,
                  consensus: {
                    isLoading: false,
                    content: null,
                    error: consensusError.message,
                  },
                };
              }
              return msg;
            })
          );
        }
      } else {
         // If not enough successful responses for consensus, ensure consensus part is cleared or indicates no consensus
         setMessages(prevMessages =>
          prevMessages.map(msg => {
            if (msg.id === assistantMessageId && successfulResponses.length < 2) { // Strictly less than 2 for "no consensus"
              return {
                ...msg,
                consensus: {
                  isLoading: false,
                  content: successfulResponses.length === 1 ? 'Not enough responses to generate a consensus (only 1 successful response).' : 'No successful responses to generate a consensus.',
                  error: null,
                },
              };
            }
            return msg;
          })
        );
      }

    } catch (error) {
      console.error('Error handling requests:', error);
      // Add error message to chat
      setMessages(prevMessages => [
        ...prevMessages, 
        {
          id: `error-${Date.now()}`,
          role: 'system',
          content: `Error: ${error.message}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get active models with their provider information
  const getActiveModelDetails = () => {
    return activeModels.map(modelId => {
      const provider = providers.find(p => 
        p.models.some(m => m.id === modelId)
      );
      const model = provider?.models.find(m => m.id === modelId);
      
      return {
        id: modelId,
        name: model?.name || modelId,
        providerName: provider?.name || 'Unknown',
        providerIcon: provider?.icon || '❓'
      };
    });
  };
  
  const activeModelDetails = getActiveModelDetails();

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
                  {activeModelDetails.length} model{activeModelDetails.length !== 1 ? 's' : ''} active
                </span>
              )}
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showModelSelector && (
              <div className="model-dropdown">
                {providers.map(provider => (
                  <div key={provider.id} className="provider-section">
                    <div className="provider-header">
                      <span>{provider.icon} {provider.name}</span>
                      {!provider.available && (
                        <span className="coming-soon-tag">Coming Soon</span>
                      )}
                    </div>
                    
                    {provider.available && (
                      <div className="model-list">
                        {provider.models.map(model => (
                          <div 
                            key={model.id}
                            className={`model-item ${activeModels.includes(model.id) ? 'active' : ''} ${!model.available ? 'disabled' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (model.available) {
                                toggleModelActivation(model.id);
                              }
                            }}
                          >
                            <span className="model-checkbox">
                              {activeModels.includes(model.id) ? '✓' : ''}
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
          <button className="icon-button theme-toggle" title="Toggle theme" onClick={toggleTheme}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="icon-button" title="Settings">⚙️</button>
          <button className="icon-button" title="Help">❓</button>
        </div>
      </header>

      {/* Main chat window */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <h2>Welcome to Consensus</h2>
            <p>Select models and start chatting to compare responses</p>
            <button 
              className="select-models-button"
              onClick={() => setShowModelSelector(true)}
            >
              Select Models
            </button>
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.role}`}
            >
              {message.role === 'user' ? (
                <>
                  <div className="user-avatar">👤</div>
                  <div className="message-content">
                    {/* Render user message content */}
                    <div dangerouslySetInnerHTML={{ __html: renderFormattedContent(message.content) }} />
                  </div>
                </>
              ) : message.role === 'system' ? (
                <div className="system-message">
                  {message.content}
                </div>
              ) : (
                <div className="assistant-responses">
                  {Object.entries(message.modelResponses).map(([modelId, response]) => {
                    const settings = modelSettings[modelId] || { visible: true };
                    return (
                      <div 
                        key={modelId} 
                        className={`model-response ${!settings.visible ? 'collapsed' : ''}`}
                      >
                        <div 
                          className="model-response-header"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleModelVisibility(modelId);
                          }}
                        >
                          <div className="model-info">
                            <span className="model-icon">{response.providerIcon}</span>
                            <span className="model-name">{response.modelName}</span>
                            {response.isLoading && <span className="loading-indicator">⏳</span>}
                            {response.error && <span className="error-indicator">⚠️</span>}
                          </div>
                          <div className="model-controls">
                            <button 
                              className={`model-setting-button ${modelSettings[modelId]?.useInternet ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleModelSetting(modelId, 'useInternet');
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
                              <div className="error-message">{response.error}</div>
                            ) : (
                              <div dangerouslySetInnerHTML={{ __html: renderFormattedContent(response.content) }} />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Consensus Response Section */}
                  {message.consensus && (
                    <div className="consensus-response">
                      <div className="consensus-header">
                        <span className="consensus-icon">🤝</span>
                        <span>Consensus (via Gemini 2.0 Flash)</span>
                        {message.consensus.isLoading && <span className="loading-indicator">⏳</span>}
                        {message.consensus.error && <span className="error-indicator">⚠️</span>}
                      </div>
                      <div className="consensus-content">
                        {message.consensus.isLoading ? (
                          <div className="skeleton-loader"></div> // Or simply message.consensus.content which is "Generating..."
                        ) : message.consensus.error ? (
                          <div className="error-message">{message.consensus.error}</div>
                        ) : message.consensus.content ? (
                          <div dangerouslySetInnerHTML={{ __html: renderFormattedContent(message.consensus.content) }} />
                        ) : (
                          <p>No consensus generated.</p> // Fallback if content is null/empty but no error
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
            placeholder={activeModels.length === 0 
              ? "Select models first..." 
              : "Type your message..."}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
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
              disabled={isLoading || !prompt.trim() || activeModels.length === 0}
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
        
        <div className="active-models-chips">
          {activeModelDetails.map(model => (
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
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
