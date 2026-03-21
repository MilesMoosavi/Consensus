import React from 'react';
import MessageList from '../components/MessageList';
import { renderFormattedContent } from './helpers/renderFormatted';

export default {
  title: 'Components/MessageList',
  component: MessageList,
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'light', value: '#f5f5f5' },
        { name: 'dark', value: '#121212' },
      ],
    },
  },
};

export const EmptyState = {
  args: {
    messages: [],
    renderFormattedContent,
    messagesEndRef: React.createRef(),
  },
};

export const WithMessages = {
  args: {
    messages: [
      {
        id: 'user-1',
        role: 'user',
        content: 'What is the capital of France?',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'system-1',
        role: 'system',
        content: 'Processing your request...',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'assistant-1',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        modelResponses: {
          'model-1': {
            modelId: 'model-1',
            modelName: 'Gemini 2.0 Flash',
            providerName: 'Google',
            providerIcon: '🔍',
            content: 'The capital of France is Paris.',
            isLoading: false,
            error: null,
          },
          'model-2': {
            modelId: 'model-2',
            modelName: 'Gemini 1.5 Pro',
            providerName: 'Google',
            providerIcon: '🔍',
            content: 'Paris is the capital city of France.',
            isLoading: false,
            error: null,
          },
        },
        consensus: {
          isLoading: false,
          content: 'The capital of France is Paris.',
          error: null,
        },
      },
    ],
    renderFormattedContent,
    messagesEndRef: React.createRef(),
  },
};
