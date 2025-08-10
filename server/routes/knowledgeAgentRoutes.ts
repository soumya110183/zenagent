import { Router } from 'express';
import { spawn } from 'child_process';
import path from 'path';

const router = Router();

// Helper function to call Knowledge Agent Python service
function callKnowledgeAgentService(method: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../services/knowledgeAgentCli.py');
    const python = spawn('python3', [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (e) {
          console.log('Knowledge Agent output:', output);
          resolve({ output: output.trim() });
        }
      } else {
        console.error('Knowledge Agent error output:', errorOutput);
        reject(new Error(`Knowledge Agent failed: ${errorOutput}`));
      }
    });

    // Send method and data to Python Knowledge Agent service
    python.stdin.write(JSON.stringify({ method, data }));
    python.stdin.end();
  });
}

// Scrape Confluence pages with sub-menu navigation
router.post('/scrape-confluence', async (req, res) => {
  try {
    const { baseUrl, credentials, maxDepth = 3 } = req.body;
    
    if (!baseUrl) {
      return res.status(400).json({ 
        error: 'Base URL is required for Confluence scraping' 
      });
    }

    const result = await callKnowledgeAgentService('scrape_confluence_pages', {
      base_url: baseUrl,
      credentials: credentials || {},
      max_depth: maxDepth
    });

    res.json({
      message: 'Confluence scraping completed',
      agent: 'Knowledge Agent',
      ...result
    });

  } catch (error) {
    console.error('Error scraping Confluence:', error);
    res.status(500).json({ 
      error: 'Failed to scrape Confluence pages',
      details: error.message 
    });
  }
});

// Process PDF documents with IBM Doclinq
router.post('/process-pdf', async (req, res) => {
  try {
    const { pdfPath, doclinqConfig } = req.body;
    
    if (!pdfPath) {
      return res.status(400).json({ 
        error: 'PDF path or URL is required' 
      });
    }

    const result = await callKnowledgeAgentService('process_pdf_with_doclinq', {
      pdf_path: pdfPath,
      doclinq_config: doclinqConfig || {}
    });

    res.json({
      message: 'PDF processing completed',
      agent: 'Knowledge Agent',
      ...result
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ 
      error: 'Failed to process PDF document',
      details: error.message 
    });
  }
});

// Chat interface for Q&A
router.post('/chat', async (req, res) => {
  try {
    const { query, contextLimit = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required for chat' 
      });
    }

    const result = await callKnowledgeAgentService('chat_query', {
      query,
      context_limit: contextLimit
    });

    res.json({
      message: 'Chat query processed',
      agent: 'Knowledge Agent',
      ...result
    });

  } catch (error) {
    console.error('Error processing chat query:', error);
    res.status(500).json({ 
      error: 'Failed to process chat query',
      details: error.message 
    });
  }
});

// Get Knowledge Agent statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await callKnowledgeAgentService('get_agent_statistics', {});

    res.json({
      message: 'Knowledge Agent statistics',
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

// Bulk operations for knowledge base management
router.post('/bulk-process', async (req, res) => {
  try {
    const { sources } = req.body;
    
    if (!sources || !Array.isArray(sources)) {
      return res.status(400).json({ 
        error: 'Sources array is required for bulk processing' 
      });
    }

    const results = [];
    
    for (const source of sources) {
      try {
        let result;
        
        if (source.type === 'confluence') {
          result = await callKnowledgeAgentService('scrape_confluence_pages', {
            base_url: source.url,
            credentials: source.credentials || {},
            max_depth: source.maxDepth || 3
          });
        } else if (source.type === 'pdf') {
          result = await callKnowledgeAgentService('process_pdf_with_doclinq', {
            pdf_path: source.path,
            doclinq_config: source.doclinqConfig || {}
          });
        }
        
        results.push({
          source: source,
          result: result,
          status: 'success'
        });
        
      } catch (error) {
        results.push({
          source: source,
          error: error.message,
          status: 'failed'
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    res.json({
      message: 'Bulk processing completed',
      agent: 'Knowledge Agent',
      processed: results.length,
      successful: successCount,
      failed: failedCount,
      results: results
    });

  } catch (error) {
    console.error('Error in bulk processing:', error);
    res.status(500).json({ 
      error: 'Failed to process sources',
      details: error.message 
    });
  }
});

export default router;