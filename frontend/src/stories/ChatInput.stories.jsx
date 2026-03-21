import React from 'react';
import ChatInput from '../components/ChatInput';

export default {
  title: 'Components/ChatInput',
  component: ChatInput,
};

export const Default = {
  args: {
    prompt: '',
    setPrompt: (value) => console.log(`Setting prompt to: ${value}`),
    isLoading: false,
    activeModels: [
      { id: "model-1", name: "Gemini 2.0 Flash", providerIcon: "🔍" },
      { id: "model-2", name: "Gemini 1.5 Pro", providerIcon: "🔍" }
    ],
    handleSubmit: () => console.log('Submitting prompt'),
    setShowModelSelector: () => console.log('Show model selector toggled'),
  },
};

export const Loading = {
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const WithText = {
  args: {
    ...Default.args,
    prompt: 'What is the capital of France?',
  },
};

export const NoActiveModels = {
  args: {
    ...Default.args,
    activeModels: [],
  },
};
