// filepath: c:\Users\the10\OneDrive\Documents\GitHub\Consensus\frontend\src\components\ModelSelector.jsx
import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';
import { providerModelData as staticProviderModelData } from '../data/ProviderModelData.js'; // Renamed to avoid conflict
import './ModelSelector.css'; // Assuming you have some CSS for styling

const ModelSelector = ({ activeModels, onModelToggle, availableProviders }) => {
  const [dynamicProviderModels, setDynamicProviderModels] = useState({});
  const [loadingProviders, setLoadingProviders] = useState({});
  const [errorProviders, setErrorProviders] = useState({});

  useEffect(() => {
    const fetchModelsForProvider = async (provider) => {
      if (provider.id === 'google' || provider.id === 'openai') { // Only fetch for these initially
        setLoadingProviders(prev => ({ ...prev, [provider.id]: true }));
        setErrorProviders(prev => ({ ...prev, [provider.id]: null }));
        try {
          const models = await ApiService.getModels(provider.id);
          // Ensure models are in the expected format { id: string, name: string, available: boolean }
          const formattedModels = models.map(m => ({
            id: m.id, // Backend should provide this
            name: m.name, // Backend should provide this
            available: true, // Assuming fetched models are available
            providerId: provider.id, // Keep track of provider
          }));
          setDynamicProviderModels(prev => ({ ...prev, [provider.id]: formattedModels }));
        } catch (error) {
          console.error(`Error fetching models for ${provider.name}:`, error);
          setErrorProviders(prev => ({ ...prev, [provider.id]: `Failed to load ${provider.name} models.` }));
          // Fallback to static models for this provider if dynamic fetch fails
          setDynamicProviderModels(prev => ({ ...prev, [provider.id]: provider.models.map(m => ({...m, providerId: provider.id})) }));
        } finally {
          setLoadingProviders(prev => ({ ...prev, [provider.id]: false }));
        }
      } else {
        // For providers not fetched dynamically, use static data directly
        // Ensure they also have providerId for consistency if needed elsewhere
        setDynamicProviderModels(prev => ({
          ...prev,
          [provider.id]: provider.models.map(m => ({...m, providerId: provider.id}))
        }));
      }
    };

    staticProviderModelData.forEach(provider => {
      if (availableProviders.find(p => p.id === provider.id)?.available) {
        fetchModelsForProvider(provider);
      }
    });
  }, [availableProviders]); // Rerun if availableProviders change

  const getModelsForProvider = (provider) => {
    return dynamicProviderModels[provider.id] || provider.models.map(m => ({...m, providerId: provider.id}));
  };

  return (
    <div className="model-selector-container">
      {staticProviderModelData.filter(p => availableProviders.find(ap => ap.id === p.id)?.available).map(provider => (
        <div key={provider.id} className="provider-section">
          <h4 className="provider-name">
            <span className="provider-icon">{provider.icon}</span>
            {provider.name}
            {loadingProviders[provider.id] && <span className="loading-indicator"> (Loading...)</span>}
          </h4>
          {errorProviders[provider.id] && <div className="error-message">{errorProviders[provider.id]}</div>}
          <ul className="model-list">
            {getModelsForProvider(provider).map(model => (
              <li key={model.id} className="model-item">
                <label>
                  <input
                    type="checkbox"
                    checked={activeModels.includes(model.id)}
                    onChange={() => onModelToggle(model.id, provider.id)}
                    disabled={!model.available}
                  />
                  <span className={model.available ? '' : 'model-unavailable'}>
                    {model.name}
                    {!model.available && " (Unavailable)"}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ModelSelector;
