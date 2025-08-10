import { Router } from 'express';
import { getZenVectorAgent } from '../services/zenVectorService';

const router = Router();

// Add code to vector database for similarity analysis
router.post('/add-code', async (req, res) => {
  try {
    const { projectId, codeData } = req.body;
    
    if (!projectId || !codeData) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId and codeData' 
      });
    }

    const zenAgent = getZenVectorAgent();
    const result = await zenAgent.addCodeToVectorDb(projectId, codeData);

    res.json({
      message: 'Code added to ZenVector database successfully',
      agent: 'ZenVector',
      ...result
    });

  } catch (error) {
    console.error('Error adding code to vector DB:', error);
    res.status(500).json({ 
      error: 'Failed to add code to vector database',
      details: error.message 
    });
  }
});

// Find similar code using vector similarity
router.post('/find-similar', async (req, res) => {
  try {
    const { query, projectId, topK = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const zenAgent = getZenVectorAgent();
    const result = await zenAgent.findSimilarCode(query, projectId, topK);

    res.json({
      message: 'Similar code search completed',
      agent: 'ZenVector',
      query,
      similar_code: result,
      total_matches: result.length
    });

  } catch (error) {
    console.error('Error finding similar code:', error);
    res.status(500).json({ 
      error: 'Failed to find similar code',
      details: error.message 
    });
  }
});

// Semantic search across codebase
router.post('/semantic-search', async (req, res) => {
  try {
    const { query, searchType = 'all', topK = 10 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const zenAgent = getZenVectorAgent();
    const result = await zenAgent.semanticSearch(query, searchType, topK);

    res.json({
      message: 'Semantic search completed',
      agent: 'ZenVector',
      ...result
    });

  } catch (error) {
    console.error('Error in semantic search:', error);
    res.status(500).json({ 
      error: 'Semantic search failed',
      details: error.message 
    });
  }
});

// Analyze demographic data patterns
router.post('/analyze-demographics', async (req, res) => {
  try {
    const { demographicData } = req.body;
    
    if (!demographicData || !Array.isArray(demographicData)) {
      return res.status(400).json({ 
        error: 'demographicData array is required' 
      });
    }

    const zenAgent = getZenVectorAgent();
    const result = await zenAgent.analyzeDemographicPatterns(demographicData);

    res.json({
      message: 'Demographic analysis completed',
      agent: 'ZenVector',
      ...result
    });

  } catch (error) {
    console.error('Error analyzing demographics:', error);
    res.status(500).json({ 
      error: 'Failed to analyze demographic data',
      details: error.message 
    });
  }
});

// Search demographic data
router.post('/search-demographics', async (req, res) => {
  try {
    const { query, topK = 10 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const zenAgent = getZenVectorAgent();
    const result = await zenAgent.searchDemographicData(query, topK);

    res.json({
      message: 'Demographic search completed',
      agent: 'ZenVector',
      query,
      matches: result,
      total_matches: result.length
    });

  } catch (error) {
    console.error('Error searching demographics:', error);
    res.status(500).json({ 
      error: 'Failed to search demographic data',
      details: error.message 
    });
  }
});

// SonarQube integration for code quality analysis
router.post('/sonar-analysis', async (req, res) => {
  try {
    const { projectKey, sonarConfig } = req.body;
    
    if (!projectKey) {
      return res.status(400).json({ 
        error: 'Project key is required for SonarQube analysis' 
      });
    }

    const zenAgent = getZenVectorAgent();
    const result = await zenAgent.analyzeWithSonarqube(projectKey, sonarConfig || {});

    res.json({
      message: 'SonarQube analysis completed',
      agent: 'ZenVector',
      ...result
    });

  } catch (error) {
    console.error('Error with SonarQube analysis:', error);
    res.status(500).json({ 
      error: 'Failed to perform SonarQube analysis',
      details: error.message 
    });
  }
});

// Get ZenVector agent statistics
router.get('/stats', async (req, res) => {
  try {
    const zenAgent = getZenVectorAgent();
    const result = zenAgent.getAgentStatistics();

    res.json({
      message: 'ZenVector agent statistics',
      ...result
    });

  } catch (error) {
    console.error('Error getting agent stats:', error);
    res.status(500).json({ 
      error: 'Failed to get agent statistics',
      details: error.message 
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    agent: 'ZenVector',
    status: 'active',
    capabilities: [
      'Code Similarity Detection',
      'Semantic Code Search', 
      'Demographic Data Analysis',
      'Pattern Recognition',
      'Multi-modal Search',
      'HuggingFace Code Analysis',
      'SonarQube Integration',
      'Langfuse Observability'
    ],
    database: 'ChromaDB',
    embedding_model: 'all-MiniLM-L6-v2'
  });
});

export default router;