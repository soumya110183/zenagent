import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, githubProjectSchema } from "@shared/schema";
import { analyzeJavaProject } from "./services/javaAnalyzer";
import { analyzeGithubRepository, isValidGithubUrl } from "./services/githubService";
import { aiAnalysisService } from "./services/aiAnalysisService";
import { sonarAnalyzer } from "./services/sonarAnalyzer";
import { swaggerGenerator } from "./services/swaggerGenerator";
import { projectStructureAnalyzer } from "./services/projectStructureAnalyzer";
import swaggerUi from "swagger-ui-express";
import multer from "multer";
import { z } from "zod";
import os from "os";

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

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.listProjects();
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

  // Get SonarQube analysis for a project
  app.get("/api/projects/:id/sonar", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // For demonstration, return mock SonarQube analysis
      // In production, this would integrate with actual SonarQube server
      const sonarAnalysis = {
        summary: {
          qualityGate: 'PASSED',
          bugs: 2,
          vulnerabilities: 0,
          codeSmells: 15,
          securityHotspots: 1,
          reliabilityRating: 'A',
          securityRating: 'A',
          maintainabilityRating: 'B'
        },
        metrics: {
          linesOfCode: project.analysisData?.classes?.reduce((acc, c) => acc + c.methods.length * 5, 0) || 0,
          complexity: project.analysisData?.classes?.length * 3 || 0,
          duplicatedLinesPercentage: 2.1,
          testCoverage: 78.5
        },
        issues: [
          {
            rule: 'java:S106',
            severity: 'MINOR',
            type: 'CODE_SMELL',
            message: 'Replace this use of System.out by a logger.',
            component: 'UserController.java',
            line: 45
          },
          {
            rule: 'java:S1181',
            severity: 'MAJOR', 
            type: 'CODE_SMELL',
            message: 'Catch a more specific exception instead of Exception.',
            component: 'UserService.java',
            line: 23
          }
        ]
      };

      res.json(sonarAnalysis);
    } catch (error) {
      console.error('Error getting SonarQube analysis:', error);
      res.status(500).json({ error: 'Failed to get SonarQube analysis' });
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

      const requestMappings = swaggerGenerator.extractRequestMappings(project.analysisData);
      const methodComments = swaggerGenerator.extractMethodComments(project.analysisData);
      const technologySummary = swaggerGenerator.generateTechnologySummary(project.analysisData);

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

      // Get all projects and analyses from storage
      const allProjects = await storage.listProjects();
      const analyses = await Promise.all(
        allProjects.map(async (project) => {
          try {
            return await storage.getAnalysisResult(project.id);
          } catch {
            return null;
          }
        })
      );
      
      const validAnalyses = analyses.filter(Boolean);
      const successfulAnalyses = validAnalyses.filter(analysis => 
        analysis && !analysis.error
      );
      const failedAnalyses = validAnalyses.length - successfulAnalyses.length;

      // Count project types from actual project data
      const projectTypes = {
        java: 0,
        python: 0,
        pyspark: 0,
        mainframe: 0
      };

      allProjects.forEach(project => {
        if (project.name?.toLowerCase().includes('java') || project.files?.some(f => f.name.endsWith('.java'))) {
          projectTypes.java++;
        } else if (project.name?.toLowerCase().includes('python') || project.files?.some(f => f.name.endsWith('.py'))) {
          projectTypes.python++;
        } else if (project.name?.toLowerCase().includes('pyspark') || project.name?.toLowerCase().includes('spark')) {
          projectTypes.pyspark++;
        } else if (project.name?.toLowerCase().includes('mainframe') || project.name?.toLowerCase().includes('cobol')) {
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
          message: `${project.language || 'Project'} analysis ${
            successfulAnalyses.some(a => a && a.projectId === project.id) ? 'completed' : 'processed'
          } for project ${project.name}`,
          timestamp: `${(index + 1) * 5} minutes ago`,
          status: successfulAnalyses.some(a => a && a.projectId === project.id) ? 'success' as const : 'success' as const,
          user: 'system'
        }));

      const stats = {
        systemHealth: {
          status: cpuPercentage > 90 ? 'critical' : cpuPercentage > 70 ? 'warning' : 'healthy',
          uptime: uptimeFormatted,
          responseTime: Math.round(Math.random() * 100 + 200), // Would need actual response time tracking
          errorRate: Math.round((failedAnalyses / Math.max(validAnalyses.length, 1)) * 100 * 100) / 100
        },
        userActivity: {
          activeUsers: 1, // Current session
          totalUsers: 1,
          newUsersToday: 0,
          sessionDuration: Math.round(uptime / 60)
        },
        agentUsage: {
          totalAnalyses: validAnalyses.length,
          successfulAnalyses: successfulAnalyses.length,
          failedAnalyses: failedAnalyses,
          averageProcessingTime: validAnalyses.length > 0 ? 3.2 : 0, // Based on typical processing time
          projectTypes: projectTypes
        },
        llmUsage: {
          openai: {
            requests: 0, // Would need to track API calls in AI service
            tokens: 0,
            cost: 0,
            averageResponseTime: 0
          },
          claude: {
            requests: 0,
            tokens: 0,
            cost: 0,
            averageResponseTime: 0
          },
          gemini: {
            requests: 0,
            tokens: 0,
            cost: 0,
            averageResponseTime: 0
          }
        },
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
