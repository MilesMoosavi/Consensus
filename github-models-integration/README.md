# GitHub Models Integration for Consensus

This folder contains the essential components for integrating GitHub Models API into your Consensus project, replacing the current Google Gemini API dependency.

## Components

### 1. `github-models-client.js`
- **Purpose**: Unified client for accessing all GitHub Models
- **Features**: 
  - Support for 11+ AI models (OpenAI, Meta, Mistral, Cohere, Microsoft)
  - Single and multi-model querying
  - Error handling and response normalization
  - Model validation and discovery

### 2. `consensus-engine.js`
- **Purpose**: Algorithms for building consensus from multiple model responses
- **Methods**:
  - **Majority Voting**: Simple frequency-based consensus
  - **Weighted Consensus**: Model reliability-based weighting
  - **Semantic Consensus**: Similarity clustering approach
  - **Combined Consensus**: Multi-method analysis with confidence scoring

### 3. `example-usage.js`
- **Purpose**: Demonstration of complete workflow
- **Shows**: End-to-end process from query to consensus result

### 4. Supporting Files
- `dependencies.txt`: Required npm packages
- `.env.example`: Environment variable template

## Integration Steps

1. **Install Dependencies**:
   ```bash
   npm install @azure-rest/ai-inference @azure/core-auth dotenv
   ```

2. **Environment Setup**:
   - Copy `.env.example` to `.env`
   - Add your GitHub Personal Access Token

3. **Import and Use**:
   ```javascript
   import { GitHubModelsClient, ConsensusEngine } from './github-models-integration/example-usage.js';
   ```

## Available Models

- **OpenAI**: GPT-4o, GPT-4o Mini
- **Meta**: Llama 3.1 (405B, 70B, 8B)
- **Mistral**: Large, Small
- **Cohere**: Command R+, Command R
- **Microsoft**: Phi-3 Medium, Small

## Consensus Methods

### Majority Voting
Best for: Clear categorical answers (math problems, factual questions)
```javascript
const result = ConsensusEngine.majorityVoting(responses);
```

### Weighted Consensus
Best for: When certain models are more reliable for specific domains
```javascript
const weights = {
  'openai/gpt-4o': 1.5,
  'meta-llama/Meta-Llama-3.1-70B-Instruct': 1.2
};
const result = ConsensusEngine.weightedConsensus(responses, weights);
```

### Semantic Consensus
Best for: Text-based responses requiring similarity analysis
```javascript
const result = ConsensusEngine.semanticConsensus(responses);
```

## Migration from Gemini

Replace your current Gemini API calls with:

```javascript
// Old Gemini approach
const geminiResponse = await geminiClient.generateContent(prompt);

// New GitHub Models consensus approach
const client = new GitHubModelsClient(process.env.GITHUB_TOKEN);
const models = [
  GitHubModelsClient.MODELS['gpt-4o-mini'],
  GitHubModelsClient.MODELS['llama-70b'],
  GitHubModelsClient.MODELS['mistral-large']
];

const responses = await client.queryMultipleModels(models, messages);
const consensus = ConsensusEngine.combinedConsensus(responses);
```

## Next Steps for Consensus Project

1. **Create new branch**: `feature/github-models-integration`
2. **Copy this folder** to your Consensus repository
3. **Update dependencies** in package.json
4. **Replace Gemini client** with GitHubModelsClient
5. **Implement consensus UI** to display multiple responses + final consensus
6. **Add model selection** interface for users to choose which models to query

The consensus algorithm will provide much more robust and reliable results by leveraging multiple state-of-the-art models instead of relying on a single Gemini instance.
