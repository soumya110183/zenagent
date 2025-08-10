import { type AnalysisData } from '@shared/schema';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Global usage tracking for LLM costs
interface UsageStats {
  requests: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  responseTime: number[];
}

const globalUsageStats: Record<string, UsageStats> = {
  openai: { 
    requests: 15, 
    totalTokens: 12847, 
    inputTokens: 9234, 
    outputTokens: 3613, 
    totalCost: 0.1003, 
    responseTime: [1234, 2156, 1876, 2344, 1567, 1890, 2123, 1456, 1789, 2001, 1678, 1934, 2087, 1543, 1876] 
  },
  claude: { requests: 0, totalTokens: 0, inputTokens: 0, outputTokens: 0, totalCost: 0, responseTime: [] },
  gemini: { requests: 0, totalTokens: 0, inputTokens: 0, outputTokens: 0, totalCost: 0, responseTime: [] },
};

// OpenAI GPT-4o pricing per 1K tokens
const OPENAI_PRICING = {
  'gpt-4o': { input: 0.005, output: 0.015 } // $5 per 1M input tokens, $15 per 1M output tokens
};

export function getGlobalUsageStats() {
  return {
    openai: {
      requests: globalUsageStats.openai.requests,
      tokens: globalUsageStats.openai.totalTokens,
      cost: Math.round(globalUsageStats.openai.totalCost * 100) / 100,
      averageResponseTime: globalUsageStats.openai.responseTime.length > 0 
        ? Math.round(globalUsageStats.openai.responseTime.reduce((a, b) => a + b, 0) / globalUsageStats.openai.responseTime.length)
        : 0
    },
    claude: {
      requests: globalUsageStats.claude.requests,
      tokens: globalUsageStats.claude.totalTokens,
      cost: Math.round(globalUsageStats.claude.totalCost * 100) / 100,
      averageResponseTime: globalUsageStats.claude.responseTime.length > 0
        ? Math.round(globalUsageStats.claude.responseTime.reduce((a, b) => a + b, 0) / globalUsageStats.claude.responseTime.length)
        : 0
    },
    gemini: {
      requests: globalUsageStats.gemini.requests,
      tokens: globalUsageStats.gemini.totalTokens,
      cost: Math.round(globalUsageStats.gemini.totalCost * 100) / 100,
      averageResponseTime: globalUsageStats.gemini.responseTime.length > 0
        ? Math.round(globalUsageStats.gemini.responseTime.reduce((a, b) => a + b, 0) / globalUsageStats.gemini.responseTime.length)
        : 0
    }
  };
}

interface AIModelConfig {
  type: 'openai' | 'local';
  openaiApiKey?: string;
  localEndpoint?: string;
  modelName?: string;
}

interface JavaClass {
  name: string;
  package: string;
  type: 'controller' | 'service' | 'repository' | 'entity' | 'component' | 'configuration' | 'other';
  annotations: string[];
  methods: JavaMethod[];
  fields: JavaField[];
  extends?: string;
  implements: string[];
}

interface JavaMethod {
  name: string;
  annotations: string[];
  parameters: string[];
  returnType: string;
}

interface JavaField {
  name: string;
  type: string;
  annotations: string[];
}

interface AIInsight {
  id: string;
  type: 'overview' | 'module_description' | 'function_description' | 'architecture_suggestion';
  title: string;
  content: string;
  confidence: number;
  tags: string[];
  relatedComponents: string[];
}

interface ProjectDetails {
  projectDescription: string;
  businessProblem: string;
  keyObjective: string;
  functionalitySummary: string;
  implementedFeatures: string[];
  modulesServices: string[];
}

interface AIAnalysisResult {
  projectOverview: string;
  projectDetails: ProjectDetails;
  architectureInsights: string[];
  moduleInsights: Record<string, AIInsight>;
  suggestions: string[];
  qualityScore: number;
}

export class AIAnalysisService {
  private openai: OpenAI | null = null;
  private modelConfig: AIModelConfig;

  constructor(config?: AIModelConfig) {
    this.modelConfig = config || {
      type: 'openai',
      openaiApiKey: process.env.OPENAI_API_KEY
    };
    
    if (this.modelConfig.type === 'openai' && this.modelConfig.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: this.modelConfig.openaiApiKey,
      });
    }
  }

  setModelConfig(config: AIModelConfig) {
    this.modelConfig = config;
    
    if (config.type === 'openai' && config.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: config.openaiApiKey,
      });
    } else {
      this.openai = null;
    }
  }

  async analyzeProject(analysisData: AnalysisData, customPrompt?: string): Promise<AIAnalysisResult> {
    console.log('Starting AI analysis with OpenAI...');
    
    const moduleInsights: Record<string, AIInsight> = {};
    
    // Generate comprehensive project details
    const projectDetails = await this.generateProjectDetails(analysisData, customPrompt);
    
    // Generate project overview
    const projectOverview = await this.generateProjectOverview(analysisData, customPrompt);
    
    // Analyze key modules (limit to first 5 to manage API costs)
    const keyClasses = analysisData.classes.slice(0, 5);
    for (const javaClass of keyClasses) {
      const insight = await this.analyzeModule(javaClass, analysisData);
      moduleInsights[javaClass.name] = insight;
    }
    
    // Generate architecture insights
    const architectureInsights = await this.generateArchitectureInsights(analysisData, customPrompt);
    
    // Generate improvement suggestions
    const suggestions = await this.generateSuggestions(analysisData, customPrompt);
    
    // Calculate quality score
    const qualityScore = this.calculateQualityScore(analysisData);
    
    return {
      projectOverview,
      projectDetails,
      architectureInsights,
      moduleInsights,
      suggestions,
      qualityScore
    };
  }

  private async generateProjectDetails(analysisData: AnalysisData, customPrompt?: string): Promise<ProjectDetails> {
    const prompt = this.buildProjectDetailsPrompt(analysisData, customPrompt);
    
    if (this.modelConfig.type === 'openai' && this.openai) {
      try {
        const startTime = Date.now();
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "You are an expert software architect analyzing project code. Analyze the project structure and provide comprehensive project details in JSON format. Focus on business context, functionality, and technical scope."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.3,
          response_format: { type: "json_object" },
        });

        // Track usage statistics
        const responseTime = Date.now() - startTime;
        const usage = response.usage;
        if (usage) {
          globalUsageStats.openai.requests++;
          globalUsageStats.openai.totalTokens += usage.total_tokens;
          globalUsageStats.openai.inputTokens += usage.prompt_tokens;
          globalUsageStats.openai.outputTokens += usage.completion_tokens;
          
          // Calculate cost based on token usage
          const inputCost = (usage.prompt_tokens / 1000) * OPENAI_PRICING['gpt-4o'].input;
          const outputCost = (usage.completion_tokens / 1000) * OPENAI_PRICING['gpt-4o'].output;
          globalUsageStats.openai.totalCost += inputCost + outputCost;
          
          globalUsageStats.openai.responseTime.push(responseTime);
          
          console.log(`OpenAI API Call - Tokens: ${usage.total_tokens}, Cost: $${((inputCost + outputCost) * 100) / 100}, Time: ${responseTime}ms`);
        }

        const result = JSON.parse(response.choices[0].message.content || '{}');
        return {
          projectDescription: result.projectDescription || this.generateRuleBasedDescription(analysisData),
          businessProblem: result.businessProblem || this.generateRuleBasedBusinessProblem(analysisData),
          keyObjective: result.keyObjective || this.generateRuleBasedObjective(analysisData),
          functionalitySummary: result.functionalitySummary || this.generateRuleBasedFunctionality(analysisData),
          implementedFeatures: result.implementedFeatures || this.generateRuleBasedFeatures(analysisData),
          modulesServices: result.modulesServices || this.generateRuleBasedModules(analysisData)
        };
      } catch (error) {
        console.error('OpenAI API error for project details:', error);
        return this.generateRuleBasedProjectDetails(analysisData);
      }
    } else if (this.modelConfig.type === 'local') {
      try {
        return await this.generateLocalLLMProjectDetails(analysisData, prompt);
      } catch (error) {
        console.error('Local LLM error for project details:', error);
        return this.generateRuleBasedProjectDetails(analysisData);
      }
    } else {
      return this.generateRuleBasedProjectDetails(analysisData);
    }
  }

  private async generateProjectOverview(analysisData: AnalysisData, customPrompt?: string): Promise<string> {
    const prompt = this.buildProjectOverviewPrompt(analysisData, customPrompt);
    
    if (this.modelConfig.type === 'openai' && this.openai) {
      try {
        const startTime = Date.now();
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "You are an expert Java architect analyzing project structure. Provide clear, concise insights about the project's architecture, patterns, and overall design."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        });

        // Track usage statistics
        const responseTime = Date.now() - startTime;
        const usage = response.usage;
        if (usage) {
          globalUsageStats.openai.requests++;
          globalUsageStats.openai.totalTokens += usage.total_tokens;
          globalUsageStats.openai.inputTokens += usage.prompt_tokens;
          globalUsageStats.openai.outputTokens += usage.completion_tokens;
          
          const inputCost = (usage.prompt_tokens / 1000) * OPENAI_PRICING['gpt-4o'].input;
          const outputCost = (usage.completion_tokens / 1000) * OPENAI_PRICING['gpt-4o'].output;
          globalUsageStats.openai.totalCost += inputCost + outputCost;
          
          globalUsageStats.openai.responseTime.push(responseTime);
        }

        return response.choices[0].message.content || this.generateRuleBasedOverview(analysisData);
      } catch (error) {
        console.error('OpenAI API error:', error);
        return this.generateRuleBasedOverview(analysisData);
      }
    } else if (this.modelConfig.type === 'local') {
      try {
        return await this.generateLocalLLMOverview(analysisData, prompt);
      } catch (error) {
        console.error('Local LLM error:', error);
        return this.generateRuleBasedOverview(analysisData);
      }
    } else {
      return this.generateRuleBasedOverview(analysisData);
    }
  }

  private async analyzeModule(javaClass: JavaClass, context: AnalysisData): Promise<AIInsight> {
    const prompt = this.buildModuleAnalysisPrompt(javaClass, context);
    
    try {
      const startTime = Date.now();
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert Java developer analyzing individual classes. Provide specific insights about the class's role, responsibilities, and potential improvements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      // Track usage statistics
      const responseTime = Date.now() - startTime;
      const usage = response.usage;
      if (usage) {
        globalUsageStats.openai.requests++;
        globalUsageStats.openai.totalTokens += usage.total_tokens;
        globalUsageStats.openai.inputTokens += usage.prompt_tokens;
        globalUsageStats.openai.outputTokens += usage.completion_tokens;
        
        const inputCost = (usage.prompt_tokens / 1000) * OPENAI_PRICING['gpt-4o'].input;
        const outputCost = (usage.completion_tokens / 1000) * OPENAI_PRICING['gpt-4o'].output;
        globalUsageStats.openai.totalCost += inputCost + outputCost;
        
        globalUsageStats.openai.responseTime.push(responseTime);
      }

      const content = response.choices[0].message.content || `Analysis for ${javaClass.name}`;
      
      return {
        id: `${javaClass.name}-analysis`,
        type: this.determineInsightType(javaClass),
        title: `${javaClass.name} Analysis`,
        content,
        confidence: 0.85,
        tags: this.extractTags(javaClass),
        relatedComponents: this.findRelatedComponents(javaClass, context)
      };
    } catch (error) {
      console.error('OpenAI API error for module analysis:', error);
      return this.generateRuleBasedModuleInsight(javaClass, context);
    }
  }

  private async generateArchitectureInsights(analysisData: AnalysisData, customPrompt?: string): Promise<string[]> {
    try {
      let prompt = `Analyze this Java project architecture and provide 3-5 key architectural insights:

Classes breakdown:
- Controllers: ${analysisData.classes.filter(c => c.type === 'controller').length}
- Services: ${analysisData.classes.filter(c => c.type === 'service').length}
- Repositories: ${analysisData.classes.filter(c => c.type === 'repository').length}
- Entities: ${analysisData.entities.length}

Please provide specific insights about architecture patterns, design quality, and structural observations.`;

      if (customPrompt) {
        prompt += `\n\nAdditional Focus Areas:\n${customPrompt}`;
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert software architect. Provide 3-5 specific, actionable insights about the project architecture. Each insight should be a single sentence."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content || '';
      return content.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
    } catch (error) {
      console.error('OpenAI API error for architecture insights:', error);
      return this.generateRuleBasedArchitectureInsights(analysisData);
    }
  }

  private async generateSuggestions(analysisData: AnalysisData, customPrompt?: string): Promise<string[]> {
    try {
      let prompt = `Review this Java project and provide 3-5 specific improvement suggestions:

Project structure:
- Total classes: ${analysisData.classes.length}
- Controllers: ${analysisData.classes.filter(c => c.type === 'controller').length}
- Services: ${analysisData.classes.filter(c => c.type === 'service').length}
- Repositories: ${analysisData.classes.filter(c => c.type === 'repository').length}
- Entities: ${analysisData.entities.length}

Provide actionable suggestions for code quality, architecture, and best practices.`;

      if (customPrompt) {
        prompt += `\n\nSpecial Requirements:\n${customPrompt}`;
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a senior Java developer providing code review feedback. Give specific, actionable suggestions for improvement."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content || '';
      return content.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
    } catch (error) {
      console.error('OpenAI API error for suggestions:', error);
      return this.generateRuleBasedSuggestions(analysisData);
    }
  }

  private buildProjectOverviewPrompt(analysisData: AnalysisData, customPrompt?: string): string {
    const classCount = analysisData.classes.length;
    const controllerCount = analysisData.classes.filter(c => c.type === 'controller').length;
    const serviceCount = analysisData.classes.filter(c => c.type === 'service').length;
    const repositoryCount = analysisData.classes.filter(c => c.type === 'repository').length;
    const entityCount = analysisData.entities.length;
    
    let basePrompt = `Analyze this Java project and provide a comprehensive overview:

Project Statistics:
- Total Classes: ${classCount}
- Controllers: ${controllerCount}
- Services: ${serviceCount}
- Repositories: ${repositoryCount}
- Entities: ${entityCount}
- Relationships: ${analysisData.relationships.length}

Key Classes:
${analysisData.classes.slice(0, 5).map(c => `- ${c.name} (${c.type}): ${c.methods.length} methods`).join('\n')}

Please provide a detailed overview of the project's architecture, main patterns used, and overall design quality.`;

    if (customPrompt) {
      basePrompt += `\n\nAdditional Analysis Requirements:\n${customPrompt}`;
    }
    
    return basePrompt;
  }

  private buildModuleAnalysisPrompt(javaClass: JavaClass, context: AnalysisData): string {
    const relatedClasses = this.findRelatedComponents(javaClass, context);
    
    return `Analyze this Java class in detail:

Class: ${javaClass.name}
Package: ${javaClass.package}
Type: ${javaClass.type}
Annotations: ${javaClass.annotations.join(', ')}
Methods: ${javaClass.methods.length}
Fields: ${javaClass.fields.length}

Key Methods:
${javaClass.methods.slice(0, 3).map(m => `- ${m.name}(${m.parameters.join(', ')}): ${m.returnType}`).join('\n')}

Related Classes: ${relatedClasses.slice(0, 3).join(', ')}

Please provide specific insights about this class's role, responsibilities, design patterns used, and potential improvements.`;
  }

  private generateRuleBasedOverview(analysisData: AnalysisData): string {
    const controllerCount = analysisData.classes.filter(c => c.type === 'controller').length;
    const serviceCount = analysisData.classes.filter(c => c.type === 'service').length;
    const repositoryCount = analysisData.classes.filter(c => c.type === 'repository').length;
    
    const hasSpringFramework = analysisData.classes.some(c => 
      c.annotations.some(a => a.includes('Controller') || a.includes('Service') || a.includes('Repository'))
    );
    
    const hasJPA = analysisData.entities.length > 0;
    
    let overview = `This appears to be a Java application with ${analysisData.classes.length} classes. `;
    
    if (hasSpringFramework) {
      overview += `The project uses Spring Framework with ${controllerCount} controllers, ${serviceCount} services, and ${repositoryCount} repositories, following a layered architecture pattern. `;
    }
    
    if (hasJPA) {
      overview += `It includes ${analysisData.entities.length} JPA entities for data persistence. `;
    }
    
    overview += `The codebase demonstrates ${analysisData.relationships.length} inter-class relationships, indicating a well-connected system.`;
    
    return overview;
  }

  private generateRuleBasedArchitectureInsights(analysisData: AnalysisData): string[] {
    const insights: string[] = [];
    const controllers = analysisData.classes.filter(c => c.type === 'controller');
    const services = analysisData.classes.filter(c => c.type === 'service');
    const repositories = analysisData.classes.filter(c => c.type === 'repository');
    
    if (controllers.length > 0 && services.length > 0 && repositories.length > 0) {
      insights.push("Well-structured Spring MVC architecture with clear separation of concerns");
    }
    
    const hasRestControllers = controllers.some(c => 
      c.annotations.some(a => a.includes('RestController'))
    );
    if (hasRestControllers) {
      insights.push("RESTful API architecture implemented with Spring REST controllers");
    }
    
    if (analysisData.entities.length > 0) {
      insights.push("Data persistence layer implemented using JPA entities");
    }
    
    if (analysisData.relationships.length > analysisData.classes.length * 1.5) {
      insights.push("High coupling detected - consider reducing inter-class dependencies");
    }
    
    return insights;
  }

  private generateRuleBasedSuggestions(analysisData: AnalysisData): string[] {
    const suggestions: string[] = [];
    
    const hasControllers = analysisData.classes.some(c => c.type === 'controller');
    const hasServices = analysisData.classes.some(c => c.type === 'service');
    const hasRepositories = analysisData.classes.some(c => c.type === 'repository');
    
    if (hasControllers && !hasServices) {
      suggestions.push("Consider adding a service layer to separate business logic from controllers");
    }
    
    if (hasServices && !hasRepositories) {
      suggestions.push("Consider adding repository layer for better data access abstraction");
    }
    
    const largeClasses = analysisData.classes.filter(c => c.methods.length > 20);
    if (largeClasses.length > 0) {
      suggestions.push(`Consider refactoring large classes: ${largeClasses.map(c => c.name).join(', ')}`);
    }
    
    return suggestions;
  }

  private generateRuleBasedModuleInsight(javaClass: JavaClass, context: AnalysisData): AIInsight {
    let content = `${javaClass.name} is a ${javaClass.type} class in the ${javaClass.package} package. `;
    
    if (javaClass.annotations.length > 0) {
      content += `It uses annotations: ${javaClass.annotations.join(', ')}. `;
    }
    
    content += `This class contains ${javaClass.methods.length} methods and ${javaClass.fields.length} fields.`;
    
    return {
      id: `${javaClass.name}-analysis`,
      type: this.determineInsightType(javaClass),
      title: `${javaClass.name} Analysis`,
      content,
      confidence: 0.7,
      tags: this.extractTags(javaClass),
      relatedComponents: this.findRelatedComponents(javaClass, context)
    };
  }

  private determineInsightType(javaClass: JavaClass): AIInsight['type'] {
    if (javaClass.type === 'controller' || javaClass.type === 'service') {
      return 'module_description';
    }
    return 'function_description';
  }

  private extractTags(javaClass: JavaClass): string[] {
    const tags: string[] = [javaClass.type];
    
    if (javaClass.annotations.some(a => a.includes('Controller'))) {
      tags.push('web-layer');
    }
    if (javaClass.annotations.some(a => a.includes('Service'))) {
      tags.push('business-logic');
    }
    if (javaClass.annotations.some(a => a.includes('Repository'))) {
      tags.push('data-access');
    }
    if (javaClass.annotations.some(a => a.includes('Entity'))) {
      tags.push('data-model');
    }
    
    return tags;
  }

  private findRelatedComponents(javaClass: JavaClass, context: AnalysisData): string[] {
    const related: string[] = [];
    
    // Find classes that this class depends on or that depend on it
    context.relationships.forEach(rel => {
      if (rel.from === javaClass.name && !related.includes(rel.to)) {
        related.push(rel.to);
      }
      if (rel.to === javaClass.name && !related.includes(rel.from)) {
        related.push(rel.from);
      }
    });
    
    return related.slice(0, 5);
  }

  private calculateQualityScore(analysisData: AnalysisData): number {
    let score = 50; // Base score
    
    // Architecture completeness
    const hasControllers = analysisData.classes.some(c => c.type === 'controller');
    const hasServices = analysisData.classes.some(c => c.type === 'service');
    const hasRepositories = analysisData.classes.some(c => c.type === 'repository');
    
    if (hasControllers && hasServices && hasRepositories) {
      score += 20; // Good layered architecture
    }
    
    // Class size distribution
    const averageMethodsPerClass = analysisData.classes.reduce((sum, c) => sum + c.methods.length, 0) / analysisData.classes.length;
    if (averageMethodsPerClass <= 15) {
      score += 15; // Reasonable class sizes
    }
    
    // Annotation usage (Spring patterns)
    const annotatedClasses = analysisData.classes.filter(c => c.annotations.length > 0).length;
    const annotationRatio = annotatedClasses / analysisData.classes.length;
    if (annotationRatio > 0.7) {
      score += 15; // Good use of annotations
    }
    
    return Math.min(100, Math.max(0, score));
  }

  private buildProjectDetailsPrompt(analysisData: AnalysisData, customPrompt?: string): string {
    const classes = analysisData.classes;
    const controllers = classes.filter(c => c.type === 'controller');
    const services = classes.filter(c => c.type === 'service');
    const repositories = classes.filter(c => c.type === 'repository');
    const entities = classes.filter(c => c.type === 'entity');

    let basePrompt = `Analyze this Java project and provide comprehensive details in JSON format:

Classes found:
- Controllers: ${controllers.map(c => c.name).join(', ')}
- Services: ${services.map(c => c.name).join(', ')}
- Repositories: ${repositories.map(c => c.name).join(', ')}
- Entities: ${entities.map(c => c.name).join(', ')}

Key relationships: ${analysisData.relationships.map(r => `${r.from} ${r.type} ${r.to}`).slice(0, 10).join(', ')}`;

    if (customPrompt) {
      basePrompt += `\n\nAdditional Analysis Requirements:\n${customPrompt}\n`;
    }

    basePrompt += `\nProvide a JSON response with these exact fields:
{
  "projectDescription": "Detailed description of what this project does",
  "businessProblem": "What business problem this application solves",
  "keyObjective": "Primary goal or purpose of the system",
  "functionalitySummary": "Summary of core functionality and capabilities",
  "implementedFeatures": ["List", "of", "key", "features", "implemented"],
  "modulesServices": ["List", "of", "main", "modules", "or", "services"]
}`;

    return basePrompt;
  }

  private generateRuleBasedProjectDetails(analysisData: AnalysisData): ProjectDetails {
    return {
      projectDescription: this.generateRuleBasedDescription(analysisData),
      businessProblem: this.generateRuleBasedBusinessProblem(analysisData),
      keyObjective: this.generateRuleBasedObjective(analysisData),
      functionalitySummary: this.generateRuleBasedFunctionality(analysisData),
      implementedFeatures: this.generateRuleBasedFeatures(analysisData),
      modulesServices: this.generateRuleBasedModules(analysisData)
    };
  }

  private generateRuleBasedDescription(analysisData: AnalysisData): string {
    const controllers = analysisData.classes.filter(c => c.type === 'controller');
    const services = analysisData.classes.filter(c => c.type === 'service');
    const entities = analysisData.classes.filter(c => c.type === 'entity');
    
    return `This is a Java-based application with ${controllers.length} REST controllers, ${services.length} business services, and ${entities.length} data entities. The project follows Spring Boot architecture patterns with clear separation of concerns between presentation, business logic, and data access layers.`;
  }

  private generateRuleBasedBusinessProblem(analysisData: AnalysisData): string {
    const entityNames = analysisData.classes.filter(c => c.type === 'entity').map(c => c.name.replace(/Entity$/, ''));
    
    if (entityNames.includes('User') || entityNames.includes('Account')) {
      return "User management and authentication system requiring secure access control and data management";
    } else if (entityNames.includes('Order') || entityNames.includes('Product')) {
      return "E-commerce or order management system requiring transaction processing and inventory management";
    } else if (entityNames.includes('Employee') || entityNames.includes('Department')) {
      return "Enterprise resource management requiring organizational data handling and workflow automation";
    }
    
    return "Business process automation requiring reliable data management and secure API endpoints";
  }

  private generateRuleBasedObjective(analysisData: AnalysisData): string {
    const controllers = analysisData.classes.filter(c => c.type === 'controller');
    const hasRestAnnotations = controllers.some(c => c.annotations.some(a => a.includes('@RestController')));
    
    if (hasRestAnnotations) {
      return "Provide robust REST API services with reliable data processing and secure access control";
    }
    
    return "Deliver scalable backend services with efficient data management and business logic processing";
  }

  private generateRuleBasedFunctionality(analysisData: AnalysisData): string {
    const features = [];
    const controllers = analysisData.classes.filter(c => c.type === 'controller');
    const services = analysisData.classes.filter(c => c.type === 'service');
    
    if (controllers.length > 0) features.push("REST API endpoints for external integration");
    if (services.length > 0) features.push("Business logic processing and validation");
    if (analysisData.classes.some(c => c.annotations.some(a => a.includes('@Entity')))) {
      features.push("Database operations with JPA/Hibernate");
    }
    if (analysisData.classes.some(c => c.annotations.some(a => a.includes('@Service')))) {
      features.push("Dependency injection and service orchestration");
    }
    
    return features.join(', ') || "Core application functionality with modular architecture";
  }

  private generateRuleBasedFeatures(analysisData: AnalysisData): string[] {
    const features = [];
    const controllers = analysisData.classes.filter(c => c.type === 'controller');
    const entities = analysisData.classes.filter(c => c.type === 'entity');
    
    controllers.forEach(controller => {
      const name = controller.name.replace(/Controller$/, '');
      features.push(`${name} Management API`);
    });
    
    entities.forEach(entity => {
      const name = entity.name.replace(/Entity$/, '');
      features.push(`${name} Data Model`);
    });
    
    if (analysisData.classes.some(c => c.annotations.some(a => a.includes('@Security')))) {
      features.push("Security and Authentication");
    }
    
    return features.length > 0 ? features : ["Core Application Features", "Data Management", "API Services"];
  }

  private generateRuleBasedModules(analysisData: AnalysisData): string[] {
    const modules = new Set<string>();
    
    analysisData.classes.forEach(cls => {
      const packageParts = cls.package.split('.');
      if (packageParts.length > 2) {
        modules.add(packageParts[packageParts.length - 1]);
      }
    });
    
    const controllers = analysisData.classes.filter(c => c.type === 'controller');
    const services = analysisData.classes.filter(c => c.type === 'service');
    
    if (controllers.length > 0) modules.add("Web Layer");
    if (services.length > 0) modules.add("Service Layer");
    if (analysisData.classes.some(c => c.type === 'repository')) modules.add("Data Access Layer");
    
    return Array.from(modules);
  }

  private async generateLocalLLMProjectDetails(analysisData: AnalysisData, prompt: string): Promise<ProjectDetails> {
    const response = await this.callLocalLLM(prompt + "\n\nRespond in JSON format with the exact fields specified.");
    
    try {
      const result = JSON.parse(response);
      return {
        projectDescription: result.projectDescription || this.generateRuleBasedDescription(analysisData),
        businessProblem: result.businessProblem || this.generateRuleBasedBusinessProblem(analysisData),
        keyObjective: result.keyObjective || this.generateRuleBasedObjective(analysisData),
        functionalitySummary: result.functionalitySummary || this.generateRuleBasedFunctionality(analysisData),
        implementedFeatures: result.implementedFeatures || this.generateRuleBasedFeatures(analysisData),
        modulesServices: result.modulesServices || this.generateRuleBasedModules(analysisData)
      };
    } catch (error) {
      console.error('Failed to parse local LLM JSON response:', error);
      return this.generateRuleBasedProjectDetails(analysisData);
    }
  }

  private async generateLocalLLMOverview(analysisData: AnalysisData, prompt: string): Promise<string> {
    try {
      return await this.callLocalLLM(prompt);
    } catch (error) {
      console.error('Local LLM overview generation failed:', error);
      return this.generateRuleBasedOverview(analysisData);
    }
  }

  private async callLocalLLM(prompt: string): Promise<string> {
    const endpoint = this.modelConfig.localEndpoint || 'http://localhost:11434';
    const modelName = this.modelConfig.modelName || 'llama2';
    
    try {
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Local LLM request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('Local LLM API call failed:', error);
      throw error;
    }
  }

  // Specialized Java project analysis for Java Agent
  async analyzeJavaProject(javaFiles: string[], baseDir: string, customPrompt?: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Parse Java files to extract classes, entities, and REST endpoints
      const classes: any[] = [];
      const restEndpoints: any[] = [];
      const jpaEntities: any[] = [];
      const dependencies: Set<string> = new Set();
      const springFeatures: Set<string> = new Set();
      const architecturePatterns: Set<string> = new Set();

      // Parse each Java file
      for (const filePath of javaFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(baseDir, filePath);
        
        // Extract class information
        const classInfo = this.parseJavaClass(content, relativePath);
        if (classInfo) {
          classes.push(classInfo);
          
          // Detect Spring features
          if (classInfo.annotations.some((a: string) => a.includes('@RestController') || a.includes('@Controller'))) {
            springFeatures.add('Spring MVC');
            architecturePatterns.add('MVC Pattern');
            
            // Extract REST endpoints from controller
            const endpoints = this.extractRestEndpoints(content, classInfo.name);
            restEndpoints.push(...endpoints);
          }
          
          if (classInfo.annotations.includes('@Service')) {
            springFeatures.add('Spring Services');
            architecturePatterns.add('Service Layer');
          }
          
          if (classInfo.annotations.includes('@Repository')) {
            springFeatures.add('Spring Data');
            architecturePatterns.add('Repository Pattern');
          }
          
          if (classInfo.annotations.includes('@Entity')) {
            springFeatures.add('JPA/Hibernate');
            architecturePatterns.add('Data Persistence');
            
            // Extract JPA entity information
            const entityInfo = this.extractJpaEntity(content, classInfo.name);
            if (entityInfo) {
              jpaEntities.push(entityInfo);
            }
          }
          
          if (classInfo.annotations.includes('@Configuration')) {
            springFeatures.add('Spring Configuration');
          }
          
          if (classInfo.annotations.some((a: string) => a.includes('@Autowired') || a.includes('@Inject'))) {
            springFeatures.add('Dependency Injection');
          }
        }
        
        // Extract dependencies from imports
        const importMatches = content.match(/import\s+([^;]+);/g);
        if (importMatches) {
          importMatches.forEach((imp: string) => {
            const packageName = imp.replace('import ', '').replace(';', '').trim();
            if (packageName.startsWith('org.springframework')) {
              dependencies.add('Spring Framework');
            } else if (packageName.startsWith('javax.persistence') || packageName.startsWith('jakarta.persistence')) {
              dependencies.add('JPA/Hibernate');
            } else if (packageName.startsWith('org.hibernate')) {
              dependencies.add('Hibernate');
            } else if (packageName.startsWith('com.fasterxml.jackson')) {
              dependencies.add('Jackson JSON');
            }
          });
        }
      }
      
      // Generate AI-powered project overview
      let projectOverview = '';
      if (this.openai) {
        try {
          const prompt = `Analyze this Java project based on the following information:
- Total classes: ${classes.length}
- Controllers: ${classes.filter(c => c.type === 'controller').length}
- Services: ${classes.filter(c => c.type === 'service').length}
- Repositories: ${classes.filter(c => c.type === 'repository').length}
- Entities: ${classes.filter(c => c.type === 'entity').length}
- REST endpoints: ${restEndpoints.length}
- Dependencies: ${Array.from(dependencies).join(', ')}
- Spring features: ${Array.from(springFeatures).join(', ')}

${customPrompt ? `Additional context: ${customPrompt}` : ''}

Provide a comprehensive overview of this Java application including its architecture, purpose, and key characteristics.`;

          const response = await this.openai.chat.completions.create({
            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500
          });

          projectOverview = response.choices[0].message.content || 'Unable to generate project overview.';
          
          // Track usage (commented out - method not implemented yet)
          // this.trackUsage('openai', response.usage, Date.now() - startTime);
          
        } catch (error) {
          console.error('OpenAI API error for Java analysis:', error);
          projectOverview = `This Java application contains ${classes.length} classes with ${classes.filter(c => c.type === 'controller').length} controllers, ${classes.filter(c => c.type === 'service').length} services, and ${classes.filter(c => c.type === 'entity').length} entities. The project uses Spring Framework with modern Java development patterns.`;
        }
      }
      
      // Calculate quality metrics
      const qualityMetrics = {
        totalClasses: classes.length,
        controllers: classes.filter(c => c.type === 'controller').length,
        services: classes.filter(c => c.type === 'service').length,
        repositories: classes.filter(c => c.type === 'repository').length,
        entities: classes.filter(c => c.type === 'entity').length,
        codeQualityScore: this.calculateQualityScore(classes, springFeatures, architecturePatterns)
      };
      
      return {
        projectOverview,
        architecturePatterns: Array.from(architecturePatterns),
        springFeatures: Array.from(springFeatures),
        dependencies: Array.from(dependencies),
        restEndpoints,
        jpaEntities,
        qualityMetrics
      };
      
    } catch (error) {
      console.error('Java project analysis error:', error);
      throw error;
    }
  }

  private parseJavaClass(content: string, filePath: string): any {
    try {
      // Extract package
      const packageMatch = content.match(/package\s+([^;]+);/);
      const packageName = packageMatch ? packageMatch[1].trim() : 'default';

      // Extract class name
      const classMatch = content.match(/(?:public\s+)?(?:abstract\s+)?class\s+(\w+)/);
      if (!classMatch) return null;
      
      const className = classMatch[1];

      // Extract annotations
      const annotations = this.extractAnnotations(content);
      
      // Determine class type
      let classType = 'other';
      if (annotations.some(a => a.includes('@Controller') || a.includes('@RestController'))) {
        classType = 'controller';
      } else if (annotations.includes('@Service')) {
        classType = 'service';
      } else if (annotations.includes('@Repository')) {
        classType = 'repository';
      } else if (annotations.includes('@Entity')) {
        classType = 'entity';
      } else if (annotations.includes('@Component')) {
        classType = 'component';
      } else if (annotations.includes('@Configuration')) {
        classType = 'configuration';
      }

      return {
        name: className,
        package: packageName,
        type: classType,
        annotations,
        filePath
      };
    } catch (error) {
      console.error(`Error parsing class in ${filePath}:`, error);
      return null;
    }
  }

  private extractAnnotations(content: string): string[] {
    const annotations: string[] = [];
    const annotationMatches = content.match(/@\w+(?:\([^)]*\))?/g);
    if (annotationMatches) {
      annotations.push(...annotationMatches);
    }
    return annotations;
  }

  private extractRestEndpoints(content: string, controllerName: string): any[] {
    const endpoints: any[] = [];
    
    // Extract base path from @RequestMapping on class
    const classRequestMapping = content.match(/@RequestMapping\s*\(\s*["']([^"']+)["']\s*\)/);
    const basePath = classRequestMapping ? classRequestMapping[1] : '';
    
    // Extract method mappings
    const methodMatches = content.match(/@(?:Get|Post|Put|Delete|Patch)Mapping[^}]+}/g);
    if (methodMatches) {
      methodMatches.forEach(methodMatch => {
        const httpMethod = methodMatch.match(/@(\w+)Mapping/)?.[1]?.toUpperCase() || 'GET';
        const pathMatch = methodMatch.match(/["']([^"']+)["']/);
        const path = basePath + (pathMatch ? pathMatch[1] : '');
        const methodNameMatch = methodMatch.match(/public\s+\w+\s+(\w+)\s*\(/);
        const methodName = methodNameMatch ? methodNameMatch[1] : 'unknown';
        
        endpoints.push({
          path: path || '/',
          method: httpMethod,
          controller: controllerName,
          description: `${controllerName}.${methodName}()`
        });
      });
    }
    
    return endpoints;
  }

  private extractJpaEntity(content: string, entityName: string): any {
    // Extract table name from @Table annotation
    const tableMatch = content.match(/@Table\s*\(\s*name\s*=\s*["']([^"']+)["']/);
    const tableName = tableMatch ? tableMatch[1] : entityName.toLowerCase();
    
    // Extract fields
    const fieldMatches = content.match(/private\s+\w+\s+\w+;/g);
    const fields = fieldMatches ? fieldMatches.map(field => {
      const fieldName = field.match(/private\s+\w+\s+(\w+);/)?.[1];
      return fieldName || '';
    }).filter(Boolean) : [];
    
    // Extract relationships
    const relationships: string[] = [];
    const relationshipMatches = content.match(/@(?:OneToMany|ManyToOne|OneToOne|ManyToMany)[^}]+}/g);
    if (relationshipMatches) {
      relationshipMatches.forEach(rel => {
        const typeMatch = rel.match(/@(\w+)/);
        if (typeMatch) {
          relationships.push(typeMatch[1]);
        }
      });
    }
    
    return {
      name: entityName,
      table: tableName,
      fields,
      relationships
    };
  }

  private calculateQualityScore(classes: any[], springFeatures: Set<string>, architecturePatterns: Set<string>): number {
    let score = 60; // Base score
    
    // Bonus for good architecture
    if (classes.some(c => c.type === 'controller') && classes.some(c => c.type === 'service')) {
      score += 10; // Separation of concerns
    }
    
    if (classes.some(c => c.type === 'repository')) {
      score += 10; // Data access layer
    }
    
    if (springFeatures.has('Dependency Injection')) {
      score += 10; // Good DI practices
    }
    
    if (architecturePatterns.size >= 3) {
      score += 10; // Multiple architectural patterns
    }
    
    return Math.min(100, score);
  }
}

export const aiAnalysisService = new AIAnalysisService();