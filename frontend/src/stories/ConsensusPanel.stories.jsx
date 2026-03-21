import React from 'react';
import ConsensusPanel from '../components/ConsensusPanel';
import { renderFormattedContent } from './helpers/renderFormatted';

export default {
  title: 'Components/ConsensusPanel',
  component: ConsensusPanel,
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
  args: {
    consensus: {
      isLoading: false,
      content: "Based on the model responses, the consensus is that **Earth** is the third planet from the sun. It has an average radius of approximately 6,371 kilometers. \\boxed{\\text{Earth is the third planet from the sun.}}",
      error: null,
    },
    renderFormattedContent: renderFormattedContent
  },
};

export const Loading = {
  args: {
    consensus: {
      isLoading: true,
      content: "Generating consensus...",
      error: null,
    },
    renderFormattedContent: (content) => content,
  },
};

export const Error = {
  args: {
    consensus: {
      isLoading: false,
      content: null,
      error: "Failed to generate consensus.",
    },
    renderFormattedContent: (content) => content,
  },
};

export const NoConsensus = {
  args: {
    consensus: {
      isLoading: false,
      content: null,
      error: null,
    },
    renderFormattedContent: (content) => content,
  },
};
