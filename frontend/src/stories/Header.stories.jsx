import React from 'react';
import Header from '../components/Header';

export default {
  title: 'Components/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Default = {
  args: {
    darkMode: true,
    toggleTheme: () => console.log("Theme toggled"),
    activeModelDetails: [
      { id: "model-1", name: "Gemini 2.0 Flash", providerIcon: "🔍" },
      { id: "model-2", name: "Gemini 1.5 Pro", providerIcon: "🔍" }
    ],
    setShowModelSelector: () => console.log("Show model selector toggled"),
    showModelSelector: false,
    modelSelectorRef: React.createRef(),
    providers: [
      {
        id: "google",
        name: "Google",
        icon: "🔍",
        available: true,
        models: [
          { id: "model-1", name: "Gemini 2.0 Flash", available: true },
          { id: "model-2", name: "Gemini 1.5 Pro", available: true }
        ],
      },
    ],
    activeModels: ["model-1", "model-2"],
    toggleModelActivation: (id) => console.log(`Toggled model: ${id}`),
  },
};

export const LightMode = {
  args: {
    ...Default.args,
    darkMode: false,
  },
};

export const WithModelSelectorOpen = {
  args: {
    ...Default.args,
    showModelSelector: true,
  },
};
