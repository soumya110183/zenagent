import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSession, requireAuth, optionalAuth } from "./auth";
import { loginSchema, insertProjectSchema, githubProjectSchema } from "@shared/schema";
import { analyzeJavaProject } from "./services/javaAnalyzer";
import { analyzeGithubRepository, isValidGithubUrl } from "./services/githubService";
import { aiAnalysisService, getGlobalUsageStats } from "./services/aiAnalysisService";
import { swaggerGenerator } from "./services/swaggerGenerator";
import { projectStructureAnalyzer } from "./services/projectStructureAnalyzer";
import swaggerUi from "swagger-ui-express";
import multer from "multer";
import { z } from "zod";
import os from "os";
import zenVectorRoutes from "./routes/zenVectorRoutes";
import knowledgeAgentRoutes from "./routes/knowledgeAgentRoutes";
import { demographicScanner } from "./services/demographicScanner";

interface AIModelConfig {
  type: 'openai' | 'local';
  openaiApiKey?: string;
  localEndpoint?: string;
  modelName?: string;
}

const aiModelConfigSchema = z.object({
  type: z.enum(['openai', 'local']),
  openaiApiKey: z.string().optional(),
  localEndpoint: z.string().optional(),
  modelName: z.string().optional(),
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const isZip = file.mimetype === 'application/zip' || 
                  file.originalname.endsWith('.zip') ||
                  file.mimetype === 'application/x-zip-compressed';
    
    if (isZip) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  }
});

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    
    if (isImage) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for Excel files
  },
  fileFilter: (req, file, cb) => {
    const isExcel = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    file.mimetype === 'application/vnd.ms-excel' ||
                    file.originalname.endsWith('.xlsx') ||
                    file.originalname.endsWith('.xls');
    
    if (isExcel) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  }
});

function generateExcelMappingHTML(project: any, mapping: any): string {
  const scanResults = mapping.scanResults || {};
  const matches = scanResults.matches || [];
  const unmatchedFields = scanResults.unmatchedFields || [];
  const matchRate = mapping.totalFields > 0 
    ? Math.round((mapping.matchedFields / mapping.totalFields) * 100) 
    : 0;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Excel Field Mapping Report - ${project.name}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .header p {
            margin: 5px 0;
            opacity: 0.9;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .summary-card .value {
            font-size: 36px;
            font-weight: bold;
            margin: 10px 0;
        }
        .summary-card.total .value { color: #667eea; }
        .summary-card.matched .value { color: #10b981; }
        .summary-card.unmatched .value { color: #f97316; }
        .summary-card.rate .value { color: #3b82f6; }
        .section {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .section-title.matched { border-bottom-color: #10b981; color: #10b981; }
        .section-title.unmatched { border-bottom-color: #f97316; color: #f97316; }
        .field-item {
            padding: 15px;
            margin-bottom: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background-color: #f9fafb;
        }
        .field-item.matched { border-left: 4px solid #10b981; background-color: #f0fdf4; }
        .field-item.unmatched { border-left: 4px solid #f97316; background-color: #fff7ed; }
        .field-header {
            display: flex;
            justify-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .field-name {
            font-weight: bold;
            font-size: 16px;
        }
        .field-name .table { color: #3b82f6; }
        .field-name .field { color: #8b5cf6; }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge.field-match { background-color: #ddd6fe; color: #7c3aed; }
        .badge.table-match { background-color: #dbeafe; color: #2563eb; }
        .badge.total-matches { background-color: #d1fae5; color: #059669; }
        .location {
            margin-top: 10px;
            padding: 10px;
            background-color: white;
            border-radius: 4px;
            font-size: 13px;
        }
        .location-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 5px;
        }
        .location-type {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
        }
        .location-type.field { background-color: #e9d5ff; color: #7c3aed; }
        .location-type.table { background-color: #bfdbfe; color: #1e40af; }
        .location-path {
            color: #6b7280;
            font-size: 12px;
        }
        .code-block {
            background-color: #1f2937;
            color: #e5e7eb;
            padding: 8px 12px;
            border-radius: 4px;
            margin-top: 5px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            overflow-x: auto;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            color: #6b7280;
            font-size: 13px;
        }
        .footer strong {
            color: #111827;
        }
        @media print {
            body { background-color: white; }
            .summary-grid { page-break-inside: avoid; }
            .field-item { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Excel Field Mapping Report</h1>
        <p><strong>Project:</strong> ${project.name}</p>
        <p><strong>Excel File:</strong> ${mapping.fileName}</p>
        <p><strong>Scan Date:</strong> ${new Date(mapping.uploadedAt).toLocaleString()}</p>
    </div>

    <div class="summary-grid">
        <div class="summary-card total">
            <h3>Total Fields</h3>
            <div class="value">${mapping.totalFields}</div>
        </div>
        <div class="summary-card matched">
            <h3>Matched</h3>
            <div class="value">${mapping.matchedFields}</div>
        </div>
        <div class="summary-card unmatched">
            <h3>Unmatched</h3>
            <div class="value">${mapping.totalFields - mapping.matchedFields}</div>
        </div>
        <div class="summary-card rate">
            <h3>Match Rate</h3>
            <div class="value">${matchRate}%</div>
        </div>
    </div>

    ${matches.length > 0 ? `
    <div class="section">
        <div class="section-title matched">
            ✅ Matched Fields (${matches.length})
        </div>
        ${matches.map((match: any) => `
            <div class="field-item matched">
                <div class="field-header">
                    <div class="field-name">
                        Table: <span class="table">${match.tableName}</span> | 
                        Field: <span class="field">${match.fieldName}</span>
                    </div>
                    <div>
                        ${match.fieldMatchCount > 0 ? `<span class="badge field-match">Field: ${match.fieldMatchCount}</span>` : ''}
                        ${match.tableMatchCount > 0 ? `<span class="badge table-match">Table: ${match.tableMatchCount}</span>` : ''}
                        <span class="badge total-matches">${match.matchCount} total</span>
                    </div>
                </div>
                ${match.locations.slice(0, 5).map((loc: any) => `
                    <div class="location">
                        <div class="location-header">
                            <span class="location-type ${loc.matchType === 'field_name' ? 'field' : 'table'}">
                                ${loc.matchType === 'field_name' ? '📄 Field Match' : '🗃️ Table Match'}
                            </span>
                            <span class="location-path">${loc.filePath}:${loc.lineNumber}</span>
                        </div>
                        <div class="code-block">${loc.line}</div>
                    </div>
                `).join('')}
                ${match.matchCount > 5 ? `<p style="margin-top: 10px; color: #6b7280; font-size: 13px;">+${match.matchCount - 5} more matches</p>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${unmatchedFields.length > 0 ? `
    <div class="section">
        <div class="section-title unmatched">
            ❌ Unmatched Fields (${unmatchedFields.length})
        </div>
        ${unmatchedFields.map((field: any) => `
            <div class="field-item unmatched">
                <div class="field-name">
                    Table: <span class="table">${field.tableName}</span> | 
                    Field: <span class="field">${field.fieldName}</span>
                </div>
                <p style="margin-top: 10px; color: #9ca3af; font-size: 13px;">
                    No matches found in the codebase for this field.
                </p>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="footer">
        <p><strong>Developed by:</strong> Ullas Krishnan, Sr Solution Architect</p>
        <p>Copyright © Project Diamond Zensar team</p>
    </div>
</body>
</html>
  `.trim();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Session middleware
  setupSession(app);

  // Auth routes (login only - registration removed)

  app.post('/api/auth/login', async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const user = await storage.validateUser(loginData.username, loginData.password);
      
      if (user) {
        if (req.session) {
          req.session.user = user;
          // Ensure session is saved before responding
          await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
              if (err) {
                console.error("Session save error:", err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
        }
        const { password, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ success: false, message: "Invalid request" });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    try {
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error("Session destroy error:", err);
            return res.status(500).json({ message: "Logout failed" });
          }
          res.json({ success: true, message: "Logout successful" });
        });
      } else {
        res.json({ success: true, message: "Already logged out" });
      }
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.get('/api/auth/user', requireAuth, async (req, res) => {
    try {
      const user = req.session?.user;
      if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/auth/user', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const updateData = req.body;
      
      // Validate the update data
      const allowedFields = ['firstName', 'lastName', 'email', 'position', 'department'];
      const validData: any = {};
      
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          validData[field] = updateData[field];
        }
      }
      
      const updatedUser = await storage.updateUser(userId, validData);
      if (updatedUser) {
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Upload profile image
  app.post('/api/auth/upload-avatar', requireAuth, uploadImage.single('profileImage'), async (req, res) => {
    try {
      const userId = req.session.userId!;
      const file = req.file;
      
      console.log(`Avatar upload attempt for user ID: ${userId}`);
      
      if (!file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      // Check if user exists first
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        console.error(`User not found with ID: ${userId}`);
        return res.status(404).json({ message: "User not found" });
      }
      
      // Convert image to base64 for storage
      const imageData = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      const updatedUser = await storage.updateUser(userId, { profileImageUrl: imageData });
      if (updatedUser) {
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } else {
        res.status(404).json({ message: "Failed to update user profile" });
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });
  
  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get a specific project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Upload and analyze Java project
  app.post("/api/projects/upload", upload.single('zipFile'), async (req, res) => {
    try {
      console.log('Upload request received:', {
        file: req.file ? req.file.originalname : 'No file',
        size: req.file ? req.file.size : 'N/A',
        mimetype: req.file ? req.file.mimetype : 'N/A'
      });
      
      if (!req.file) {
        return res.status(400).json({ message: "No ZIP file provided" });
      }

      const { originalname, buffer } = req.file;
      
      // Create project record
      const projectData = {
        name: originalname.replace('.zip', ''),
        originalFileName: originalname,
        status: 'processing' as const,
        analysisData: null,
        fileCount: 0,
        controllerCount: 0,
        serviceCount: 0,
        repositoryCount: 0,
        entityCount: 0,
      };

      const validatedData = insertProjectSchema.parse(projectData);
      const project = await storage.createProject(validatedData);

      // Start analysis in background
      analyzeJavaProject(project.id, buffer).catch((error) => {
        console.error(`Analysis failed for project ${project.id}:`, error);
        storage.updateProject(project.id, { 
          status: 'failed',
        });
      });

      res.json(project);
    } catch (error) {
      console.error("Error uploading project:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: error.errors 
        });
      }
      
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File size too large. Maximum size is 50MB." });
        }
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: "Failed to upload and analyze project" });
    }
  });

  // Analyze GitHub repository
  app.post("/api/projects/github", async (req, res) => {
    try {
      const validatedData = githubProjectSchema.parse(req.body);
      
      if (!isValidGithubUrl(validatedData.githubUrl)) {
        return res.status(400).json({ message: "Invalid GitHub URL format" });
      }

      const projectId = await analyzeGithubRepository(validatedData);
      const project = await storage.getProject(projectId);
      
      res.json(project);
    } catch (error) {
      console.error("Error analyzing GitHub repository:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid GitHub repository data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to analyze GitHub repository" });
    }
  });

  // Generate AI analysis for project
  app.post("/api/projects/ai-analysis", async (req, res) => {
    try {
      const { customPrompt, ...analysisData } = req.body;
      console.log("Generating AI analysis for project...");
      if (customPrompt) {
        console.log("Custom prompt provided:", customPrompt.substring(0, 100) + (customPrompt.length > 100 ? '...' : ''));
      }
      
      const aiAnalysis = await aiAnalysisService.analyzeProject(analysisData, customPrompt);
      
      res.json(aiAnalysis);
    } catch (error) {
      console.error("Error generating AI analysis:", error);
      res.status(500).json({ message: "Failed to generate AI analysis" });
    }
  });

  // Delete a project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // In a real implementation, you'd delete from the database
      // For now, we'll just mark it as deleted by updating status
      await storage.updateProject(req.params.id, { status: 'deleted' as any });
      
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // AI Model Configuration endpoint
  app.post("/api/ai-config", async (req, res) => {
    try {
      const config = aiModelConfigSchema.parse(req.body);
      
      // Update the AI service configuration
      aiAnalysisService.setModelConfig(config);
      
      res.json({ 
        success: true, 
        message: `AI model configured to use ${config.type === 'openai' ? 'OpenAI GPT-4o' : 'Local LLM'}`,
        config: {
          type: config.type,
          ...(config.type === 'local' && { 
            endpoint: config.localEndpoint,
            model: config.modelName 
          })
        }
      });
    } catch (error) {
      console.error('AI configuration error:', error);
      res.status(400).json({ 
        error: error instanceof z.ZodError ? error.errors : 'Invalid AI configuration' 
      });
    }
  });

  // Get current AI configuration
  app.get("/api/ai-config", async (req, res) => {
    try {
      res.json({
        type: 'openai', // Default configuration
        message: 'Current AI configuration'
      });
    } catch (error) {
      console.error('Error getting AI config:', error);
      res.status(500).json({ error: 'Failed to get AI configuration' });
    }
  });

  // Get LLM usage statistics
  app.get("/api/usage-statistics", async (req, res) => {
    try {
      const llmStats = getGlobalUsageStats();
      const projects = await storage.getAllProjects();
      
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const totalProjects = projects.length;
      
      res.json({
        openaiUsage: {
          requests: llmStats.openai.requests,
          tokens: llmStats.openai.tokens,
          cost: llmStats.openai.cost,
          averageResponseTime: llmStats.openai.averageResponseTime,
          models: {
            'gpt-4o': llmStats.openai.tokens // All tokens are from gpt-4o
          }
        },
        analysisStats: {
          totalProjects: totalProjects,
          completedAnalyses: completedProjects,
          averageProcessingTime: llmStats.openai.averageResponseTime / 1000, // Convert to seconds
          successRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100 * 10) / 10 : 0
        }
      });
    } catch (error) {
      console.error('Error getting usage statistics:', error);
      res.status(500).json({ error: 'Failed to get usage statistics' });
    }
  });

  // Get Swagger documentation for a project
  app.get("/api/projects/:id/swagger", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project || !project.analysisData) {
        return res.status(404).json({ error: "Project not found or not analyzed" });
      }

      const requestMappings = swaggerGenerator.extractRequestMappings(project.analysisData);
      const swaggerDoc = swaggerGenerator.generateSwaggerDocumentation(
        project.analysisData,
        project.name,
        requestMappings
      );

      res.json(swaggerDoc);
    } catch (error) {
      console.error('Error generating Swagger documentation:', error);
      res.status(500).json({ error: 'Failed to generate Swagger documentation' });
    }
  });

  // Get project structure analysis
  app.get("/api/projects/:id/structure", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project || !project.analysisData) {
        return res.status(404).json({ error: "Project not found or not analyzed" });
      }

      // Mock project structure for demonstration
      const projectStructure = {
        directories: [
          {
            name: 'src',
            type: 'directory',
            importance: 'high',
            description: 'Source code root directory',
            children: [
              {
                name: 'main',
                type: 'directory',
                importance: 'high',
                description: 'Main application source code',
                children: [
                  {
                    name: 'java',
                    type: 'directory',
                    importance: 'high',
                    description: 'Java source files',
                    children: project.analysisData.classes.map(c => ({
                      name: `${c.name}.java`,
                      type: 'file',
                      importance: 'high',
                      description: `${c.type} class implementing ${c.name} functionality`
                    }))
                  },
                  {
                    name: 'resources',
                    type: 'directory',
                    importance: 'medium',
                    description: 'Application resources and configuration files'
                  }
                ]
              },
              {
                name: 'test',
                type: 'directory',
                importance: 'medium',
                description: 'Test source code and resources'
              }
            ]
          }
        ],
        fileCount: project.fileCount || 0,
        directoryCount: 8,
        buildFiles: [
          {
            name: 'pom.xml',
            type: 'maven',
            dependencies: ['spring-boot-starter-web', 'spring-boot-starter-data-jpa', 'mysql-connector-java'],
            purpose: 'Maven build configuration with project dependencies'
          }
        ]
      };

      res.json(projectStructure);
    } catch (error) {
      console.error('Error getting project structure:', error);
      res.status(500).json({ error: 'Failed to get project structure' });
    }
  });

  // Get comprehensive project analysis
  app.get("/api/projects/:id/comprehensive", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project || !project.analysisData) {
        return res.status(404).json({ error: "Project not found or not analyzed" });
      }

      console.log('[Comprehensive] Project:', project.name);
      console.log('[Comprehensive] Total classes:', project.analysisData.classes.length);
      console.log('[Comprehensive] Controllers:', project.analysisData.classes.filter(c => c.type === 'controller').length);
      
      const requestMappings = swaggerGenerator.extractRequestMappings(project.analysisData);
      const methodComments = swaggerGenerator.extractMethodComments(project.analysisData);
      const technologySummary = swaggerGenerator.generateTechnologySummary(project.analysisData);

      console.log('[Comprehensive] Request mappings:', requestMappings.length);

      const comprehensiveAnalysis = {
        projectOverview: {
          name: project.name,
          type: project.projectType,
          fileCount: project.fileCount,
          architecture: technologySummary.architecture,
          framework: technologySummary.framework
        },
        requestMappings,
        methodComments,
        technologySummary,
        modules: project.analysisData.classes.map(c => ({
          name: c.name,
          type: c.type,
          description: getModuleDescription(c),
          methods: c.methods.length,
          responsibilities: getModuleResponsibilities(c.type),
          businessLogic: getBusinessLogic(c)
        })),
        qualityMetrics: {
          complexity: 'Medium',
          maintainability: 'Good',
          testability: 'Good',
          documentation: 'Needs Improvement'
        }
      };

      res.json(comprehensiveAnalysis);
    } catch (error) {
      console.error('Error getting comprehensive analysis:', error);
      res.status(500).json({ error: 'Failed to get comprehensive analysis' });
    }
  });

  // Get API documentation with comprehensive details
  app.get("/api/projects/:id/api-docs", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project || !project.analysisData) {
        return res.status(404).json({ error: "Project not found or not analyzed" });
      }

      const requestMappings = swaggerGenerator.extractRequestMappings(project.analysisData);
      
      const endpoints = requestMappings.map(mapping => ({
        apiName: `${mapping.controllerClass}.${mapping.controllerMethod}`,
        httpMethod: mapping.httpMethod,
        path: mapping.endpoint,
        description: mapping.description,
        requestParameters: mapping.parameters,
        requestBody: mapping.requestBody || "",
        responseBody: mapping.responseBody || "",
        statusCodes: mapping.statusCodes,
        authRequired: mapping.authRequired,
        module: mapping.controllerClass
      }));

      res.json({ endpoints });
    } catch (error) {
      console.error('Error getting API documentation:', error);
      res.status(500).json({ error: 'Failed to get API documentation' });
    }
  });

  // Generate UML class diagram using Python Graphviz
  app.get("/api/projects/:id/diagrams/class", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project || !project.analysisData) {
        return res.status(404).json({ error: "Project not found or not analyzed" });
      }

      const format = (req.query.format as string) || 'svg';
      const theme = (req.query.theme as string) || 'light';

      // Validate format
      if (!['svg', 'png', 'pdf'].includes(format)) {
        return res.status(400).json({ error: "Invalid format. Use svg, png, or pdf" });
      }

      // Spawn Python process to generate diagram
      const { spawn } = await import('child_process');
      const python = spawn('python3', ['server/services/classDiagramGenerator.py']);

      const inputData = JSON.stringify({
        analysisData: project.analysisData,
        format,
        theme
      });

      let outputData = '';
      let errorData = '';

      python.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      python.on('close', async (code) => {
        if (code !== 0) {
          console.error('Python error:', errorData);
          return res.status(500).json({ error: 'Failed to generate diagram', details: errorData });
        }

        try {
          const result = JSON.parse(outputData);
          if (result.success) {
            const fs = await import('fs');
            const filePath = result.path;
            
            // Set appropriate content type
            const contentTypes: Record<string, string> = {
              svg: 'image/svg+xml',
              png: 'image/png',
              pdf: 'application/pdf'
            };
            
            res.setHeader('Content-Type', contentTypes[format]);
            res.setHeader('Content-Disposition', `inline; filename="class-diagram.${format}"`);
            
            // Stream the file
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
            
            // Clean up file after sending
            fileStream.on('end', () => {
              fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting temp file:', err);
              });
            });
          } else {
            res.status(500).json({ error: result.error });
          }
        } catch (parseError) {
          console.error('Parse error:', parseError, 'Output:', outputData);
          res.status(500).json({ error: 'Failed to parse diagram generation result' });
        }
      });

      // Send input data to Python process
      python.stdin.write(inputData);
      python.stdin.end();

    } catch (error) {
      console.error('Error generating class diagram:', error);
      res.status(500).json({ error: 'Failed to generate class diagram' });
    }
  });

  // Swagger UI endpoint
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(null, {
    swaggerOptions: {
      url: '/api/projects/swagger-spec'
    }
  }));

  // Admin statistics endpoint
  app.get("/api/admin/statistics", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || '24h';
      
      // Get real system metrics
      const uptime = process.uptime();
      const uptimeHours = Math.floor(uptime / 3600);
      const uptimeDays = Math.floor(uptimeHours / 24);
      const uptimeFormatted = uptimeDays > 0 
        ? `${uptimeDays} days, ${uptimeHours % 24} hours`
        : `${uptimeHours} hours, ${Math.floor((uptime % 3600) / 60)} minutes`;

      // Get memory usage
      const memoryUsage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

      // Get CPU load average
      const loadAverage = os.loadavg();
      const cpuPercentage = Math.round(Math.min(100, loadAverage[0] * 25)); // Approximate CPU usage

      // Get all projects from storage
      const allProjects = await storage.getProjects();
      const totalProjects = allProjects.length;
      
      // Calculate basic statistics from existing project data
      const analyses = allProjects;
      
      const successfulAnalyses = analyses.filter(project => project.status === 'completed');
      const failedAnalyses = analyses.filter(project => project.status === 'failed');
      const processingAnalyses = analyses.filter(project => project.status === 'processing');

      // Count project types from actual project data
      const projectTypes = {
        java: 0,
        python: 0,
        pyspark: 0,
        mainframe: 0
      };

      allProjects.forEach(project => {
        const projectType = project.projectType || 'java';
        if (projectType === 'java') {
          projectTypes.java++;
        } else if (projectType === 'python') {
          projectTypes.python++;
        } else if (projectType === 'pyspark') {
          projectTypes.pyspark++;
        } else if (projectType === 'mainframe') {
          projectTypes.mainframe++;
        }
      });

      // Recent activities from actual project data
      const recentActivities = allProjects
        .slice(-5)
        .reverse()
        .map((project, index) => ({
          id: project.id,
          type: 'analysis' as const,
          message: `${project.projectType || 'Project'} analysis ${
            project.status === 'completed' ? 'completed' : 'processed'
          } for project ${project.name}`,
          timestamp: `${(index + 1) * 5} minutes ago`,
          status: project.status === 'completed' ? 'success' as const : 'info' as const,
          user: 'system'
        }));

      const stats = {
        systemHealth: {
          status: cpuPercentage > 90 ? 'critical' : cpuPercentage > 70 ? 'warning' : 'healthy',
          uptime: uptimeFormatted,
          responseTime: Math.round(Math.random() * 100 + 200), // Would need actual response time tracking
          errorRate: Math.round((failedAnalyses.length / Math.max(totalProjects, 1)) * 100 * 100) / 100
        },
        userActivity: {
          activeUsers: 1, // Current session
          totalUsers: 1,
          newUsersToday: 0,
          sessionDuration: Math.round(uptime / 60)
        },
        agentUsage: {
          totalAnalyses: totalProjects,
          successfulAnalyses: successfulAnalyses.length,
          failedAnalyses: failedAnalyses.length,
          averageProcessingTime: totalProjects > 0 ? 3.2 : 0, // Based on typical processing time
          projectTypes: projectTypes
        },
        llmUsage: getGlobalUsageStats(),
        resourceUsage: {
          cpuUsage: cpuPercentage,
          memoryUsage: memoryPercentage,
          diskUsage: 45, // Would need actual disk usage monitoring
          bandwidth: Math.round(Math.random() * 30 + 40) // Would need network monitoring
        },
        recentActivities: recentActivities.length > 0 ? recentActivities : [{
          id: 'system-init',
          type: 'user_login' as const,
          message: 'System initialized and ready for analysis',
          timestamp: 'system start',
          status: 'success' as const,
          user: 'system'
        }]
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin statistics:", error);
      res.status(500).json({ error: "Failed to fetch admin statistics" });
    }
  });

  // Demographic Field Scanning API
  app.get('/api/demographic/patterns', requireAuth, async (req, res) => {
    try {
      const fields = demographicScanner.getFieldDefinitions();
      const documentation = demographicScanner.generatePatternDocumentation();
      
      res.json({
        success: true,
        totalFields: fields.length,
        fields: fields.map(f => ({
          category: f.category,
          fieldName: f.fieldName,
          description: f.description,
          examples: f.examples,
          patternCount: f.patterns.length
        })),
        documentation
      });
    } catch (error) {
      console.error('Error getting demographic patterns:', error);
      res.status(500).json({ error: 'Failed to get demographic patterns' });
    }
  });

  app.get('/api/projects/:id/demographics', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Get actual source files from database
      const sourceFiles = await storage.getProjectSourceFiles(id);
      
      if (sourceFiles.length === 0) {
        return res.json({
          success: true,
          projectId: id,
          projectName: project.name,
          report: {
            summary: {
              totalFiles: 0,
              totalMatches: 0,
              fieldsFound: 0,
              scanDate: new Date().toISOString()
            },
            fieldResults: {},
            coverage: {
              foundFields: [],
              missingFields: demographicScanner.getFieldDefinitions().map(f => f.fieldName)
            }
          }
        });
      }

      // Convert to format expected by scanner
      const files = sourceFiles.map(sf => ({
        path: sf.relativePath,
        content: sf.content
      }));

      console.log(`[GET demographics] Scanning ${files.length} source files for project ${id}`);
      const scanReport = await demographicScanner.scanRepository(files);
      
      // Include Excel Field Mapping information if available
      const excelMappings = await storage.getExcelMappings(id);
      const latestMapping = excelMappings && excelMappings.length > 0 ? excelMappings[0] : null;
      
      res.json({
        success: true,
        projectId: id,
        projectName: project.name,
        report: scanReport,
        excelMapping: latestMapping ? {
          fileName: latestMapping.fileName,
          uploadedAt: latestMapping.uploadedAt,
          totalFields: latestMapping.totalFields,
          matchedFields: latestMapping.matchedFields,
          unmatchedFields: latestMapping.totalFields - latestMapping.matchedFields,
          matchPercentage: Math.round((latestMapping.matchedFields / latestMapping.totalFields) * 100),
          scanResults: latestMapping.scanResults
        } : null
      });
    } catch (error) {
      console.error('Error scanning demographics:', error);
      res.status(500).json({ error: 'Failed to scan demographics' });
    }
  });

  app.post('/api/projects/:id/scan-demographics', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Get actual source files from database
      const sourceFiles = await storage.getProjectSourceFiles(id);
      
      if (sourceFiles.length === 0) {
        return res.json({
          success: true,
          projectId: id,
          projectName: project.name,
          report: {
            summary: {
              totalFiles: 0,
              totalMatches: 0,
              fieldsFound: 0,
              scanDate: new Date().toISOString()
            },
            fieldResults: {},
            coverage: {
              foundFields: [],
              missingFields: demographicScanner.getFieldDefinitions().map(f => f.fieldName)
            }
          }
        });
      }

      // Convert to format expected by scanner
      const files = sourceFiles.map(sf => ({
        path: sf.relativePath,
        content: sf.content
      }));

      console.log(`[POST demographics] Scanning ${files.length} source files for project ${id}`);
      const scanReport = await demographicScanner.scanRepository(files);
      
      res.json({
        success: true,
        projectId: id,
        projectName: project.name,
        report: scanReport
      });
    } catch (error) {
      console.error('Error scanning demographics:', error);
      res.status(500).json({ error: 'Failed to scan demographics' });
    }
  });

  // Custom Demographic Patterns API
  app.get('/api/demographic/custom-patterns', requireAuth, async (req, res) => {
    try {
      const patterns = await storage.getCustomPatterns();
      res.json({
        success: true,
        patterns: patterns.map(p => ({
          id: p.id,
          category: p.category,
          fieldName: p.fieldName,
          description: p.description,
          examples: p.examples,
          patternCount: Array.isArray(p.patterns) ? p.patterns.length : 0,
          isCustom: true
        }))
      });
    } catch (error) {
      console.error('Error getting custom patterns:', error);
      res.status(500).json({ error: 'Failed to get custom patterns' });
    }
  });

  app.post('/api/demographic/custom-patterns', requireAuth, async (req, res) => {
    try {
      const { category, fieldName, patterns, description, examples } = req.body;

      if (!category || !fieldName || !patterns || !description || !examples) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!Array.isArray(patterns) || patterns.length === 0) {
        return res.status(400).json({ error: 'Patterns must be a non-empty array' });
      }

      if (!Array.isArray(examples) || examples.length === 0) {
        return res.status(400).json({ error: 'Examples must be a non-empty array' });
      }

      // Validate regex patterns
      const validRegexPatterns: RegExp[] = [];
      for (const pattern of patterns) {
        try {
          validRegexPatterns.push(new RegExp(pattern, 'i'));
        } catch (regexError) {
          return res.status(400).json({ 
            error: `Invalid regex pattern: ${pattern}`,
            details: regexError.message 
          });
        }
      }

      const newPattern = await storage.createCustomPattern({
        category,
        fieldName,
        patterns,
        description,
        examples
      });

      // Add to demographic scanner with ID
      demographicScanner.addCustomPattern({
        id: newPattern.id,
        category: newPattern.category,
        fieldName: newPattern.fieldName,
        patterns: validRegexPatterns,
        description: newPattern.description,
        examples: newPattern.examples as string[]
      });

      res.json({
        success: true,
        pattern: newPattern
      });
    } catch (error) {
      console.error('Error creating custom pattern:', error);
      res.status(500).json({ error: 'Failed to create custom pattern' });
    }
  });

  app.delete('/api/demographic/custom-patterns/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCustomPattern(id);
      
      if (success) {
        // Remove from demographic scanner
        demographicScanner.removeCustomPattern(id);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Pattern not found' });
      }
    } catch (error) {
      console.error('Error deleting custom pattern:', error);
      res.status(500).json({ error: 'Failed to delete custom pattern' });
    }
  });

  // Excel Field Mapping and Scanning API
  app.post('/api/projects/:id/excel-mapping', requireAuth, uploadExcel.single('excelFile'), async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No Excel file uploaded' });
      }

      const fs = await import('fs');
      const path = await import('path');
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execPromise = promisify(exec);

      // Save Excel file temporarily
      const tempDir = os.tmpdir();
      const excelPath = path.join(tempDir, `excel_${Date.now()}_${req.file.originalname}`);
      const sourceFilesPath = path.join(tempDir, `source_files_${Date.now()}.json`);
      fs.writeFileSync(excelPath, req.file.buffer);

      try {
        // Get source files from project
        const sourceFiles = await storage.getSourceFilesByProject(id);
        const sourceFilesData = sourceFiles.map(sf => ({
          relativePath: sf.relativePath,
          content: sf.content
        }));

        // Save source files to temporary JSON file
        fs.writeFileSync(sourceFilesPath, JSON.stringify(sourceFilesData));

        // Call Python scanner
        const pythonScript = path.join(process.cwd(), 'server/python/excel_field_scanner.py');
        
        const { stdout } = await execPromise(
          `python3 "${pythonScript}" "${excelPath}" "${sourceFilesPath}"`,
          { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
        );

        const result = JSON.parse(stdout);

        if (!result.success) {
          throw new Error(result.error || 'Scanner failed');
        }

        // Save mapping to database
        const mapping = await storage.saveExcelMapping({
          projectId: id,
          fileName: req.file.originalname,
          mappingData: result.mappings,
          scanResults: result.results,
          totalFields: result.results.totalFields,
          matchedFields: result.results.matchedFields,
          status: 'completed'
        });

        // Clean up temp files
        fs.unlinkSync(excelPath);
        if (fs.existsSync(sourceFilesPath)) {
          fs.unlinkSync(sourceFilesPath);
        }

        res.json({
          success: true,
          mapping,
          results: result.results
        });

      } catch (scanError) {
        // Clean up on error
        if (fs.existsSync(excelPath)) {
          fs.unlinkSync(excelPath);
        }
        if (fs.existsSync(sourceFilesPath)) {
          fs.unlinkSync(sourceFilesPath);
        }
        throw scanError;
      }

    } catch (error) {
      console.error('Error processing Excel mapping:', error);
      res.status(500).json({ error: 'Failed to process Excel file' });
    }
  });

  // Get Excel mappings for a project
  app.get('/api/projects/:id/excel-mappings', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const mappings = await storage.getExcelMappings(id);
      
      res.json({
        success: true,
        mappings
      });
    } catch (error) {
      console.error('Error getting Excel mappings:', error);
      res.status(500).json({ error: 'Failed to get Excel mappings' });
    }
  });

  // Get ML suggestions for unmatched Excel fields
  app.post('/api/projects/:projectId/excel-mapping/:mappingId/ml-suggestions', requireAuth, async (req, res) => {
    try {
      const { projectId, mappingId } = req.params;

      // Get the Excel mapping
      const mappings = await storage.getExcelMappings(projectId);
      const mapping = mappings.find(m => m.id === mappingId);

      if (!mapping || !mapping.scanResults) {
        return res.status(404).json({ error: 'Mapping not found or not scanned yet' });
      }

      // Get unmatched fields
      const unmatchedFields = mapping.scanResults.unmatchedFields || [];
      if (unmatchedFields.length === 0) {
        return res.json({
          success: true,
          suggestions: {}
        });
      }

      // Extract just the field names for ML matching
      const excelFields = unmatchedFields.map(f => f.combined);

      // Get source files and extract field names from codebase
      const sourceFiles = await storage.getSourceFilesByProject(projectId);
      const codebaseFields: string[] = [];

      sourceFiles.forEach(sf => {
        const content = sf.content;
        // Extract field names from different patterns
        const patterns = [
          /(?:@Column|private|public|protected)\s+\w+\s+(\w+)/g,
          /(\w+)\s*[:=]\s*\{/g,
          /(?:const|let|var)\s+(\w+)\s*=/g,
          /\.(\w+)\s*\(/g
        ];
        
        patterns.forEach(pattern => {
          const matches = content.matchAll(pattern);
          for (const match of matches) {
            if (match[1] && match[1].length > 2) {
              codebaseFields.push(match[1]);
            }
          }
        });
      });

      // Remove duplicates
      const uniqueCodebaseFields = [...new Set(codebaseFields)];

      const path = await import('path');
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execPromise = promisify(exec);

      // Call ML matcher
      const pythonScript = path.join(process.cwd(), 'server/python/field_matcher_ml.py');
      const excelFieldsJson = JSON.stringify(excelFields).replace(/'/g, "\\'");
      const codebaseFieldsJson = JSON.stringify(uniqueCodebaseFields).replace(/'/g, "\\'");

      const { stdout } = await execPromise(
        `python3 "${pythonScript}" '${excelFieldsJson}' '${codebaseFieldsJson}'`,
        { maxBuffer: 10 * 1024 * 1024 }
      );

      const result = JSON.parse(stdout);

      if (!result.success) {
        throw new Error(result.error || 'ML matcher failed');
      }

      res.json({
        success: true,
        suggestions: result.results
      });

    } catch (error) {
      console.error('Error generating ML suggestions for Excel mapping:', error);
      res.status(500).json({ error: 'Failed to generate ML suggestions' });
    }
  });

  // Get ML-based field suggestions
  app.post('/api/projects/:id/field-suggestions', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { excelFields } = req.body;

      if (!excelFields || !Array.isArray(excelFields)) {
        return res.status(400).json({ error: 'Excel fields array required' });
      }

      // Get source files and extract field names
      const sourceFiles = await storage.getSourceFilesByProject(id);
      const codebaseFields: string[] = [];

      // Extract field names from source code
      sourceFiles.forEach(sf => {
        const content = sf.content;
        // Simple regex to find potential field references
        const fieldMatches = content.matchAll(/(?:@Column|private|public|protected)\s+\w+\s+(\w+)/g);
        for (const match of fieldMatches) {
          codebaseFields.push(match[1]);
        }
      });

      const path = await import('path');
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execPromise = promisify(exec);

      // Call ML matcher
      const pythonScript = path.join(process.cwd(), 'server/python/field_matcher_ml.py');
      const excelFieldsJson = JSON.stringify(excelFields).replace(/'/g, "\\'");
      const codebaseFieldsJson = JSON.stringify(codebaseFields).replace(/'/g, "\\'");

      const { stdout } = await execPromise(
        `python3 "${pythonScript}" '${excelFieldsJson}' '${codebaseFieldsJson}'`,
        { maxBuffer: 10 * 1024 * 1024 }
      );

      const result = JSON.parse(stdout);

      if (!result.success) {
        throw new Error(result.error || 'ML matcher failed');
      }

      res.json({
        success: true,
        suggestions: result.results
      });

    } catch (error) {
      console.error('Error generating field suggestions:', error);
      res.status(500).json({ error: 'Failed to generate suggestions' });
    }
  });

  // Excel Field Mapping Report Generation
  app.get('/api/projects/:id/excel-mapping/:mappingId/report-html', requireAuth, async (req, res) => {
    try {
      const { id, mappingId } = req.params;
      
      // Get mapping data
      const mappings = await storage.getExcelMappings(id);
      const mapping = mappings.find(m => m.id === mappingId);
      
      if (!mapping) {
        return res.status(404).json({ error: 'Mapping not found' });
      }

      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Generate HTML report
      const html = generateExcelMappingHTML(project, mapping);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);

    } catch (error) {
      console.error('Error generating Excel mapping HTML report:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  });

  app.get('/api/projects/:id/excel-mapping/:mappingId/report-download', requireAuth, async (req, res) => {
    try {
      const { id, mappingId } = req.params;
      const { format } = req.query;
      
      if (!format || !['html', 'pdf', 'docx'].includes(format as string)) {
        return res.status(400).json({ error: 'Invalid format. Use html, pdf, or docx' });
      }

      // Get mapping data
      const mappings = await storage.getExcelMappings(id);
      const mapping = mappings.find(m => m.id === mappingId);
      
      if (!mapping) {
        return res.status(404).json({ error: 'Mapping not found' });
      }

      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Generate HTML first
      const html = generateExcelMappingHTML(project, mapping);

      if (format === 'html') {
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="Excel_Field_Mapping_Report_${new Date().toISOString().split('T')[0]}.html"`);
        res.send(html);
        return;
      }

      // For PDF and DOCX, we'll use Python to convert
      const fs = await import('fs');
      const path = await import('path');
      const os = await import('os');
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execPromise = promisify(exec);

      const tempDir = os.tmpdir();
      const htmlPath = path.join(tempDir, `report_${Date.now()}.html`);
      const outputPath = path.join(tempDir, `report_${Date.now()}.${format === 'pdf' ? 'pdf' : 'docx'}`);

      // Write HTML to temp file
      fs.writeFileSync(htmlPath, html);

      try {
        const pythonScript = path.join(process.cwd(), 'server/python/report_generator.py');
        await execPromise(
          `python3 "${pythonScript}" "${htmlPath}" "${outputPath}" "${format}"`,
          { maxBuffer: 10 * 1024 * 1024 }
        );

        // Send file
        const fileBuffer = fs.readFileSync(outputPath);
        const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const extension = format === 'pdf' ? 'pdf' : 'docx';
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="Excel_Field_Mapping_Report_${new Date().toISOString().split('T')[0]}.${extension}"`);
        res.send(fileBuffer);

        // Cleanup
        fs.unlinkSync(htmlPath);
        fs.unlinkSync(outputPath);

      } catch (conversionError) {
        // Cleanup on error
        if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        throw conversionError;
      }

    } catch (error) {
      console.error('Error downloading Excel mapping report:', error);
      res.status(500).json({ error: 'Failed to download report' });
    }
  });

  // ZenVector Agent routes
  app.use('/api/zenvector', zenVectorRoutes);

  // Knowledge Agent routes
  app.use('/api/knowledge', knowledgeAgentRoutes);

  // Initialize custom demographic patterns on server start
  (async () => {
    try {
      const customPatterns = await storage.getCustomPatterns();
      await demographicScanner.initializeCustomPatterns(customPatterns);
      console.log(`✓ Loaded ${customPatterns.length} custom demographic patterns`);
    } catch (error) {
      console.error('Failed to load custom demographic patterns:', error);
    }
  })();

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for module analysis
function getModuleDescription(classData: any): string {
  const type = classData.type;
  const name = classData.name;
  
  switch (type) {
    case 'controller':
      return `${name} handles HTTP requests and manages web layer interactions for ${extractDomainFromClassName(name)} operations. It processes incoming requests, validates input, and coordinates with service layer components.`;
    case 'service':
      return `${name} encapsulates business rules and orchestrates complex operations for ${extractDomainFromClassName(name)}. It provides a clean interface for business operations and manages transactional boundaries.`;
    case 'repository':
      return `${name} provides data access abstraction for ${extractDomainFromClassName(name)} entities. It handles CRUD operations, custom queries, and database interactions.`;
    case 'entity':
      return `${name} represents a core domain object that encapsulates ${extractDomainFromClassName(name)} data and business rules. It defines the structure and relationships of persistent data.`;
    default:
      return `${name} is a ${type} component that provides specific functionality within the application architecture.`;
  }
}

function getModuleResponsibilities(type: string): string[] {
  switch (type) {
    case 'controller':
      return [
        'Process incoming HTTP requests',
        'Validate request parameters and data',
        'Delegate business logic to service layer',
        'Format and return HTTP responses',
        'Handle web-specific concerns (sessions, cookies, etc.)'
      ];
    case 'service':
      return [
        'Implement business rules and logic',
        'Coordinate multiple repository operations',
        'Manage transaction boundaries',
        'Enforce business constraints and validations',
        'Provide reusable business operations'
      ];
    case 'repository':
      return [
        'Perform CRUD operations on entities',
        'Execute custom database queries',
        'Manage database connections and transactions',
        'Handle data mapping and conversion',
        'Provide data access abstraction'
      ];
    case 'entity':
      return [
        'Define data structure and constraints',
        'Encapsulate domain-specific data',
        'Maintain data integrity and relationships',
        'Provide data validation rules',
        'Support object-relational mapping'
      ];
    default:
      return [
        'Provide specific application functionality',
        'Support overall system architecture',
        'Maintain code organization and modularity'
      ];
  }
}

function getBusinessLogic(classData: any): string {
  const type = classData.type;
  const name = classData.name;
  const domain = extractDomainFromClassName(name);
  
  switch (type) {
    case 'controller':
      return `Orchestrates ${domain} business processes through service layer delegation and handles web layer concerns including request validation, response formatting, and error handling.`;
    case 'service':
      return `Manages ${domain} business processes including validation, calculation, coordination of data operations, and enforcement of business rules and constraints.`;
    case 'repository':
      return `Manages persistence and retrieval of ${domain} data with optimized queries, data integrity enforcement, and abstraction of database operations.`;
    case 'entity':
      return `Represents ${domain} domain concept with encapsulated data, business rules, validation constraints, and relationship definitions for persistent storage.`;
    default:
      return `Provides specialized functionality for ${domain} operations within the overall application architecture.`;
  }
}

function extractDomainFromClassName(className: string): string {
  // Remove common suffixes
  let domain = className
    .replace(/Controller$/, '')
    .replace(/Service$/, '')
    .replace(/Repository$/, '')
    .replace(/Entity$/, '')
    .replace(/Impl$/, '');
  
  // Convert from PascalCase to readable format
  domain = domain.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
  
  return domain || 'application';
}
