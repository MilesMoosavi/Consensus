import React from 'react';
import ModelResponseCard from '../components/ModelResponseCard';
import { renderFormattedContent } from './helpers/renderFormatted';

export default {
  title: 'Components/ModelResponseCard',
  component: ModelResponseCard,
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

export const Default = {
  args:{
    response:{
      "modelId": "gemini-2.0-flash",
      "modelName": "Gemini 2.0 Flash",
      "providerName": "Google",
      "providerIcon": "🔍",
      "content": "This is a sample response from the model. It contains **markdown** and some LaTeX:" +
        "\n \\boxed{E=mc^2}."
        ,
      "isLoading": false,
      "error": null
    },
    renderFormattedContent:renderFormattedContent
  },
};

export const WithBoxedLatex = {
  args: {
    response: {
      modelId: "gemini-2.0-flash",
      modelName: "Gemini 2.0 Flash",
      providerName: "Google",
      providerIcon: "🔍",
      content: "Based on the evidence, we can conclude that: \\boxed{\\text{The Earth orbits around the Sun.}}",
      isLoading: false,
      error: null,
    },
    renderFormattedContent: renderFormattedContent,
  },
};

export const Loading = {
  args: {
    response: {
      modelId: "gemini-2.0-flash",
      modelName: "Gemini 2.0 Flash",
      providerName: "Google",
      providerIcon: "🔍",
      content: "Loading...",
      isLoading: true,
      error: null,
    },
    renderFormattedContent: renderFormattedContent,
  },
};

export const Error = {
  args: {
    response: {
      modelId: "gemini-2.0-flash",
      modelName: "Gemini 2.0 Flash",
      providerName: "Google",
      providerIcon: "🔍",
      content: null,
      isLoading: false,
      error: "An error occurred while generating the response.",
    },
    renderFormattedContent: (content) => content,
  },
};
