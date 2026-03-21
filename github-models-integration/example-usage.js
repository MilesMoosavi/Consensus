import GitHubModelsClient from './github-models-client.js';
import ConsensusEngine from './consensus-engine.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Example usage of GitHub Models integration for consensus building
 */
async function demonstrateConsensus() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.error('Please set GITHUB_TOKEN in your .env file');
    return;
  }

  const client = new GitHubModelsClient(token);
  
  // Example question for consensus
  const messages = [
    { role: "user", content: "What is the derivative of e^x?" }
  ];

  // Select models for consensus
  const models = [
    GitHubModelsClient.MODELS['gpt-4o-mini'],
    GitHubModelsClient.MODELS['llama-8b'],
    GitHubModelsClient.MODELS['mistral-small'],
    GitHubModelsClient.MODELS['phi-3-small']
  ];

  console.log('Querying multiple models for consensus...\n');

  try {
    // Query all models
    const responses = await client.queryMultipleModels(models, messages, {
      temperature: 0.3,
      max_tokens: 500
    });

    console.log('Individual Model Responses:');
    responses.forEach(response => {
      if (response.success) {
        console.log(`\n${response.model}:`);
        console.log(response.content);
      } else {
        console.log(`\n${response.model}: ERROR - ${response.error}`);
      }
    });

    // Generate consensus
    console.log('\n' + '='.repeat(50));
    console.log('CONSENSUS ANALYSIS');
    console.log('='.repeat(50));

    const consensus = ConsensusEngine.combinedConsensus(responses, {
      confidenceThreshold: 0.5
    });

    console.log(ConsensusEngine.generateSummary(consensus, responses));
    
    if (consensus.consensus) {
      console.log('\nFinal Consensus Answer:');
      console.log(`"${consensus.consensus}"`);
    }

  } catch (error) {
    console.error('Error during consensus building:', error);
  }
}

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateConsensus();
}

export { GitHubModelsClient, ConsensusEngine };
