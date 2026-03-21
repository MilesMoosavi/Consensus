/**
 * Consensus Algorithm for Multi-Model AI Responses
 * Implements various strategies for combining multiple AI model outputs
 */

export class ConsensusEngine {
  /**
   * Simple majority voting for categorical responses
   * @param {Array} responses - Array of model responses
   * @returns {Object} Consensus result with confidence score
   */
  static majorityVoting(responses) {
    const validResponses = responses.filter(r => r.success);
    
    if (validResponses.length === 0) {
      return {
        consensus: null,
        confidence: 0,
        method: 'majority_voting',
        error: 'No valid responses received'
      };
    }

    // Count frequency of each response
    const responseFrequency = {};
    validResponses.forEach(response => {
      const content = response.content.trim().toLowerCase();
      responseFrequency[content] = (responseFrequency[content] || 0) + 1;
    });

    // Find most frequent response
    const sortedResponses = Object.entries(responseFrequency)
      .sort(([,a], [,b]) => b - a);
    
    const [consensusContent, frequency] = sortedResponses[0];
    const confidence = frequency / validResponses.length;

    return {
      consensus: consensusContent,
      confidence,
      method: 'majority_voting',
      frequency,
      totalResponses: validResponses.length,
      allResponses: sortedResponses
    };
  }

  /**
   * Weighted consensus based on model reliability/performance
   * @param {Array} responses - Array of model responses
   * @param {Object} modelWeights - Weights for each model
   * @returns {Object} Weighted consensus result
   */
  static weightedConsensus(responses, modelWeights = {}) {
    const validResponses = responses.filter(r => r.success);
    
    if (validResponses.length === 0) {
      return {
        consensus: null,
        confidence: 0,
        method: 'weighted_consensus',
        error: 'No valid responses received'
      };
    }

    // Default weights if not provided
    const defaultWeight = 1.0;
    const responseScores = {};

    validResponses.forEach(response => {
      const content = response.content.trim();
      const weight = modelWeights[response.model] || defaultWeight;
      
      if (!responseScores[content]) {
        responseScores[content] = {
          totalWeight: 0,
          models: [],
          count: 0
        };
      }
      
      responseScores[content].totalWeight += weight;
      responseScores[content].models.push(response.model);
      responseScores[content].count++;
    });

    // Find highest weighted response
    const sortedByWeight = Object.entries(responseScores)
      .sort(([,a], [,b]) => b.totalWeight - a.totalWeight);

    const [consensusContent, stats] = sortedByWeight[0];
    const totalPossibleWeight = validResponses.reduce((sum, r) => 
      sum + (modelWeights[r.model] || defaultWeight), 0);
    
    const confidence = stats.totalWeight / totalPossibleWeight;

    return {
      consensus: consensusContent,
      confidence,
      method: 'weighted_consensus',
      totalWeight: stats.totalWeight,
      supportingModels: stats.models,
      allScores: sortedByWeight
    };
  }

  /**
   * Semantic similarity-based consensus (simplified version)
   * Groups similar responses and finds the largest cluster
   * @param {Array} responses - Array of model responses
   * @returns {Object} Semantic consensus result
   */
  static semanticConsensus(responses) {
    const validResponses = responses.filter(r => r.success);
    
    if (validResponses.length === 0) {
      return {
        consensus: null,
        confidence: 0,
        method: 'semantic_consensus',
        error: 'No valid responses received'
      };
    }

    // Simple similarity clustering based on common words/phrases
    const clusters = [];
    
    validResponses.forEach(response => {
      const content = response.content.trim().toLowerCase();
      const words = new Set(content.split(/\s+/).filter(w => w.length > 3));
      
      // Find best matching cluster
      let bestCluster = null;
      let maxSimilarity = 0;
      
      clusters.forEach(cluster => {
        const clusterWords = cluster.words;
        const intersection = new Set([...words].filter(w => clusterWords.has(w)));
        const union = new Set([...words, ...clusterWords]);
        const similarity = intersection.size / union.size;
        
        if (similarity > maxSimilarity && similarity > 0.3) {
          maxSimilarity = similarity;
          bestCluster = cluster;
        }
      });
      
      if (bestCluster) {
        bestCluster.responses.push(response);
        bestCluster.words = new Set([...bestCluster.words, ...words]);
      } else {
        clusters.push({
          responses: [response],
          words: words,
          representative: content
        });
      }
    });

    // Find largest cluster
    const largestCluster = clusters.reduce((max, cluster) => 
      cluster.responses.length > max.responses.length ? cluster : max
    );

    const confidence = largestCluster.responses.length / validResponses.length;

    return {
      consensus: largestCluster.representative,
      confidence,
      method: 'semantic_consensus',
      clusterSize: largestCluster.responses.length,
      totalClusters: clusters.length,
      supportingModels: largestCluster.responses.map(r => r.model)
    };
  }

  /**
   * Combined consensus using multiple methods
   * @param {Array} responses - Array of model responses
   * @param {Object} options - Configuration options
   * @returns {Object} Combined consensus result
   */
  static combinedConsensus(responses, options = {}) {
    const {
      modelWeights = {},
      methods = ['majority_voting', 'weighted_consensus', 'semantic_consensus'],
      confidenceThreshold = 0.6
    } = options;

    const results = {};
    
    if (methods.includes('majority_voting')) {
      results.majority = this.majorityVoting(responses);
    }
    
    if (methods.includes('weighted_consensus')) {
      results.weighted = this.weightedConsensus(responses, modelWeights);
    }
    
    if (methods.includes('semantic_consensus')) {
      results.semantic = this.semanticConsensus(responses);
    }

    // Find method with highest confidence
    const bestMethod = Object.entries(results)
      .filter(([, result]) => result.confidence >= confidenceThreshold)
      .sort(([, a], [, b]) => b.confidence - a.confidence)[0];

    if (!bestMethod) {
      // Fall back to majority voting if no method meets threshold
      return {
        ...results.majority,
        fallback: true,
        allMethods: results
      };
    }

    return {
      ...bestMethod[1],
      selectedMethod: bestMethod[0],
      allMethods: results
    };
  }

  /**
   * Generate a summary of consensus analysis
   * @param {Object} consensusResult - Result from consensus method
   * @param {Array} originalResponses - Original model responses
   * @returns {string} Human-readable summary
   */
  static generateSummary(consensusResult, originalResponses) {
    const validResponses = originalResponses.filter(r => r.success);
    const failedCount = originalResponses.length - validResponses.length;
    
    let summary = `Consensus Analysis:\n`;
    summary += `- Queried ${originalResponses.length} models\n`;
    
    if (failedCount > 0) {
      summary += `- ${failedCount} models failed to respond\n`;
    }
    
    summary += `- Method used: ${consensusResult.method}\n`;
    summary += `- Confidence: ${(consensusResult.confidence * 100).toFixed(1)}%\n`;
    
    if (consensusResult.consensus) {
      summary += `- Consensus answer: "${consensusResult.consensus}"\n`;
    } else {
      summary += `- No clear consensus reached\n`;
    }
    
    if (consensusResult.supportingModels) {
      summary += `- Supporting models: ${consensusResult.supportingModels.join(', ')}\n`;
    }
    
    return summary;
  }
}

export default ConsensusEngine;
