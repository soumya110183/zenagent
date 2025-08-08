import { type AnalysisData } from '@shared/schema';

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

interface AIAnalysisResult {
  projectOverview: string;
  architectureInsights: string[];
  moduleInsights: Map<string, AIInsight>;
  suggestions: string[];
  qualityScore: number;
}

export class AIAnalysisService {
  private mistralEndpoint: string = 'http://localhost:11434'; // Ollama default endpoint
  private isOllamaAvailable: boolean = false;

  constructor() {
    this.checkOllamaAvailability();
  }

  private async checkOllamaAvailability(): Promise<void> {
    try {
      const response = await fetch(`${this.mistralEndpoint}/api/tags`);
      this.isOllamaAvailable = response.ok;
    } catch (error) {
      this.isOllamaAvailable = false;
    }
  }

  async analyzeProject(analysisData: AnalysisData): Promise<AIAnalysisResult> {
    const moduleInsights = new Map<string, AIInsight>();
    
    // Generate project overview
    const projectOverview = await this.generateProjectOverview(analysisData);
    
    // Analyze each module/class
    for (const javaClass of analysisData.classes) {
      const insight = await this.analyzeModule(javaClass, analysisData);
      moduleInsights.set(javaClass.name, insight);
    }
    
    // Generate architecture insights
    const architectureInsights = await this.generateArchitectureInsights(analysisData);
    
    // Generate improvement suggestions
    const suggestions = await this.generateSuggestions(analysisData);
    
    // Calculate quality score
    const qualityScore = this.calculateQualityScore(analysisData);
    
    return {
      projectOverview,
      architectureInsights,
      moduleInsights,
      suggestions,
      qualityScore
    };
  }

  private async generateProjectOverview(analysisData: AnalysisData): Promise<string> {
    const prompt = this.buildProjectOverviewPrompt(analysisData);
    
    if (this.isOllamaAvailable) {
      return await this.queryOllama(prompt);
    }
    
    // Fallback to rule-based analysis
    return this.generateRuleBasedOverview(analysisData);
  }

  private async analyzeModule(javaClass: JavaClass, context: AnalysisData): Promise<AIInsight> {
    const prompt = this.buildModuleAnalysisPrompt(javaClass, context);
    
    let content: string;
    if (this.isOllamaAvailable) {
      content = await this.queryOllama(prompt);
    } else {
      content = this.generateRuleBasedModuleAnalysis(javaClass);
    }
    
    return {
      id: `module_${javaClass.name}`,
      type: 'module_description',
      title: `Analysis: ${javaClass.name}`,
      content,
      confidence: this.isOllamaAvailable ? 0.8 : 0.6,
      tags: this.extractTags(javaClass),
      relatedComponents: this.findRelatedComponents(javaClass, context)
    };
  }

  private async generateArchitectureInsights(analysisData: AnalysisData): Promise<string[]> {
    const insights: string[] = [];
    
    // Analyze Spring architecture patterns
    const springPatterns = this.analyzeSpringPatterns(analysisData);
    insights.push(...springPatterns);
    
    // Analyze data flow patterns
    const dataFlowPatterns = this.analyzeDataFlowPatterns(analysisData);
    insights.push(...dataFlowPatterns);
    
    // Analyze dependency patterns
    const dependencyPatterns = this.analyzeDependencyPatterns(analysisData);
    insights.push(...dependencyPatterns);
    
    return insights;
  }

  private async generateSuggestions(analysisData: AnalysisData): Promise<string[]> {
    const suggestions: string[] = [];
    
    // Check for common anti-patterns
    if (this.hasCircularDependencies(analysisData)) {
      suggestions.push("Consider breaking circular dependencies to improve maintainability");
    }
    
    // Check for missing layers
    const hasControllers = analysisData.classes.some(c => c.type === 'controller');
    const hasServices = analysisData.classes.some(c => c.type === 'service');
    const hasRepositories = analysisData.classes.some(c => c.type === 'repository');
    
    if (hasControllers && !hasServices) {
      suggestions.push("Consider adding a service layer to separate business logic from controllers");
    }
    
    if (hasServices && !hasRepositories) {
      suggestions.push("Consider adding repository layer for better data access abstraction");
    }
    
    // Check for large classes
    const largeClasses = analysisData.classes.filter(c => c.methods.length > 20);
    if (largeClasses.length > 0) {
      suggestions.push(`Consider refactoring large classes: ${largeClasses.map(c => c.name).join(', ')}`);
    }
    
    return suggestions;
  }

  private async queryOllama(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.mistralEndpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral:7b',
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 500
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.response || 'Analysis completed.';
    } catch (error) {
      console.error('Error querying Ollama:', error);
      return 'AI analysis unavailable. Using rule-based analysis.';
    }
  }

  private buildProjectOverviewPrompt(analysisData: AnalysisData): string {
    const classCount = analysisData.classes.length;
    const controllerCount = analysisData.classes.filter(c => c.type === 'controller').length;
    const serviceCount = analysisData.classes.filter(c => c.type === 'service').length;
    const repositoryCount = analysisData.classes.filter(c => c.type === 'repository').length;
    const entityCount = analysisData.entities.length;
    
    return `Analyze this Java project and provide a comprehensive overview:

Project Statistics:
- Total Classes: ${classCount}
- Controllers: ${controllerCount}
- Services: ${serviceCount}
- Repositories: ${repositoryCount}
- Entities: ${entityCount}
- Relationships: ${analysisData.relationships.length}

Key Classes:
${analysisData.classes.slice(0, 5).map(c => `- ${c.name} (${c.type}): ${c.methods.length} methods`).join('\n')}

Please provide:
1. A brief description of what this application does
2. The architectural pattern used (MVC, layered, etc.)
3. Key technologies and frameworks identified
4. Overall code organization assessment

Keep the response concise and focused on architectural insights.`;
  }

  private buildModuleAnalysisPrompt(javaClass: JavaClass, context: AnalysisData): string {
    const relatedClasses = context.relationships
      .filter(r => r.from === javaClass.name || r.to === javaClass.name)
      .map(r => r.from === javaClass.name ? r.to : r.from);
    
    return `Analyze this Java class and provide insights:

Class: ${javaClass.name}
Type: ${javaClass.type}
Annotations: ${javaClass.annotations.join(', ')}
Methods: ${javaClass.methods.length}
Fields: ${javaClass.fields.length}

Key Methods:
${javaClass.methods.slice(0, 3).map((m: any) => `- ${m.name}(${m.parameters.map((p: any) => p.type).join(', ')}): ${m.returnType}`).join('\n')}

Related Classes: ${relatedClasses.slice(0, 3).join(', ')}

Please provide:
1. Purpose and responsibility of this class
2. Role in the overall architecture
3. Key functionality provided
4. Potential improvements or concerns

Keep the response concise and technical.`;
  }

  private generateRuleBasedOverview(analysisData: AnalysisData): string {
    const hasSpring = analysisData.classes.some(c => 
      c.annotations.some(a => a.includes('Controller') || a.includes('Service') || a.includes('Repository'))
    );
    
    const hasJPA = analysisData.entities.length > 0;
    const hasRestAPI = analysisData.classes.some(c => 
      c.annotations.some((a: any) => a.includes('RestController'))
    );
    
    let overview = `This appears to be a Java application with ${analysisData.classes.length} classes. `;
    
    if (hasSpring) {
      overview += "The project uses Spring Framework with a layered architecture. ";
    }
    
    if (hasJPA) {
      overview += `It includes ${analysisData.entities.length} JPA entities for data persistence. `;
    }
    
    if (hasRestAPI) {
      overview += "The application exposes REST APIs through Spring controllers. ";
    }
    
    overview += `The codebase shows ${analysisData.relationships.length} relationships between components, indicating a well-structured modular design.`;
    
    return overview;
  }

  private generateRuleBasedModuleAnalysis(javaClass: JavaClass): string {
    let analysis = `${javaClass.name} is a ${javaClass.type} class`;
    
    if (javaClass.annotations.length > 0) {
      analysis += ` annotated with ${javaClass.annotations.join(', ')}`;
    }
    
    analysis += `. It contains ${javaClass.methods.length} methods and ${javaClass.fields.length} fields. `;
    
    switch (javaClass.type) {
      case 'controller':
        analysis += "This controller handles HTTP requests and manages the presentation layer.";
        break;
      case 'service':
        analysis += "This service contains business logic and coordinates between controllers and repositories.";
        break;
      case 'repository':
        analysis += "This repository manages data access and persistence operations.";
        break;
      case 'entity':
        analysis += "This entity represents a data model mapped to database tables.";
        break;
      default:
        analysis += "This class provides core functionality to the application.";
    }
    
    return analysis;
  }

  private analyzeSpringPatterns(analysisData: AnalysisData): string[] {
    const insights: string[] = [];
    
    const controllers = analysisData.classes.filter(c => c.type === 'controller');
    const services = analysisData.classes.filter(c => c.type === 'service');
    const repositories = analysisData.classes.filter(c => c.type === 'repository');
    
    if (controllers.length > 0 && services.length > 0 && repositories.length > 0) {
      insights.push("Well-structured Spring MVC architecture with clear separation of concerns");
    }
    
    const hasRestControllers = controllers.some(c => 
      c.annotations.some((a: any) => a.includes('RestController'))
    );
    if (hasRestControllers) {
      insights.push("RESTful API architecture implemented with Spring REST controllers");
    }
    
    const hasDependencyInjection = analysisData.relationships.some(r => r.type === 'injects');
    if (hasDependencyInjection) {
      insights.push("Dependency injection pattern properly implemented");
    }
    
    return insights;
  }

  private analyzeDataFlowPatterns(analysisData: AnalysisData): string[] {
    const insights: string[] = [];
    
    // Check for typical Spring data flow
    const hasControllerToService = analysisData.relationships.some(r => 
      r.type === 'calls' && 
      analysisData.classes.find(c => c.name === r.from)?.type === 'controller' &&
      analysisData.classes.find(c => c.name === r.to)?.type === 'service'
    );
    
    if (hasControllerToService) {
      insights.push("Standard MVC data flow: Controllers → Services → Repositories");
    }
    
    return insights;
  }

  private analyzeDependencyPatterns(analysisData: AnalysisData): string[] {
    const insights: string[] = [];
    
    // Calculate dependency metrics
    const dependencyCount = new Map<string, number>();
    analysisData.relationships.forEach(rel => {
      dependencyCount.set(rel.from, (dependencyCount.get(rel.from) || 0) + 1);
    });
    
    const highDependencyClasses = Array.from(dependencyCount.entries())
      .filter(([_, count]) => count > 5)
      .map(([className, _]) => className);
    
    if (highDependencyClasses.length > 0) {
      insights.push(`High-dependency classes detected: ${highDependencyClasses.join(', ')}`);
    }
    
    return insights;
  }

  private extractTags(javaClass: JavaClass): string[] {
    const tags: string[] = [javaClass.type];
    
    // Add framework tags
    if (javaClass.annotations.some((a: any) => a.includes('Controller'))) {
      tags.push('web-layer');
    }
    if (javaClass.annotations.some((a: any) => a.includes('Service'))) {
      tags.push('business-logic');
    }
    if (javaClass.annotations.some((a: any) => a.includes('Repository'))) {
      tags.push('data-access');
    }
    if (javaClass.annotations.some((a: any) => a.includes('Entity'))) {
      tags.push('data-model');
    }
    
    // Add complexity tags
    if (javaClass.methods.length > 10) {
      tags.push('complex');
    }
    if (javaClass.methods.length < 3) {
      tags.push('simple');
    }
    
    return tags;
  }

  private findRelatedComponents(javaClass: JavaClass, context: AnalysisData): string[] {
    return context.relationships
      .filter(r => r.from === javaClass.name || r.to === javaClass.name)
      .map(r => r.from === javaClass.name ? r.to : r.from)
      .slice(0, 5); // Limit to 5 most related components
  }

  private hasCircularDependencies(analysisData: AnalysisData): boolean {
    // Simple cycle detection
    const graph = new Map<string, string[]>();
    
    analysisData.relationships.forEach(rel => {
      if (!graph.has(rel.from)) {
        graph.set(rel.from, []);
      }
      graph.get(rel.from)!.push(rel.to);
    });
    
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    function hasCycle(node: string): boolean {
      if (recursionStack.has(node)) return true;
      if (visited.has(node)) return false;
      
      visited.add(node);
      recursionStack.add(node);
      
      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (hasCycle(neighbor)) return true;
      }
      
      recursionStack.delete(node);
      return false;
    }
    
    for (const node of Array.from(graph.keys())) {
      if (hasCycle(node)) return true;
    }
    
    return false;
  }

  private calculateQualityScore(analysisData: AnalysisData): number {
    let score = 70; // Base score
    
    // Bonus for good architecture
    const hasLayers = ['controller', 'service', 'repository'].every(type =>
      analysisData.classes.some(c => c.type === type)
    );
    if (hasLayers) score += 15;
    
    // Bonus for entities
    if (analysisData.entities.length > 0) score += 10;
    
    // Penalty for large classes
    const largeClasses = analysisData.classes.filter(c => c.methods.length > 20);
    score -= largeClasses.length * 5;
    
    // Penalty for circular dependencies
    if (this.hasCircularDependencies(analysisData)) score -= 15;
    
    return Math.max(0, Math.min(100, score));
  }
}

export const aiAnalysisService = new AIAnalysisService();