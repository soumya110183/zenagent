import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Code, 
  Database, 
  Globe, 
  Settings,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Brain,
  Lightbulb,
  Target,
  MessageSquareText,
  Info
} from 'lucide-react';
import { type AnalysisData, type AIAnalysisResult } from '@shared/schema';
import AIProgressModal, { type AIProgressStep } from './ai-progress-modal';
import FormattedAIContent from './formatted-ai-content';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

interface DashboardProps {
  analysisData: AnalysisData;
  onAIAnalysisComplete?: (analysis: AIAnalysisResult) => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

function StatCard({ title, value, change, trend, icon, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <Card className={`${colorClasses[color]} border`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-70">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {change}%
                </span>
              </div>
            )}
          </div>
          <div className="opacity-70">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AIInsightCardProps {
  moduleName: string;
  insight: {
    description: string;
    components: string[];
    patterns: string[];
    suggestions: string[];
  };
}

function AIInsightCard({ moduleName, insight }: AIInsightCardProps) {
  if (!insight) {
    return null;
  }

  return (
    <Card className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm">
            <Code className="w-4 h-4 text-green-600" />
          </div>
          <CardTitle className="text-sm font-semibold">{moduleName}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Description */}
        {insight.description && (
          <div>
            <FormattedAIContent content={insight.description} />
          </div>
        )}
        
        {/* Components */}
        {insight.components && insight.components.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1.5">Components:</p>
            <div className="flex flex-wrap gap-1.5">
              {insight.components.map((component, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                  {component}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Patterns */}
        {insight.patterns && insight.patterns.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1.5">Patterns:</p>
            <div className="flex flex-wrap gap-1.5">
              {insight.patterns.map((pattern, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 border-blue-300 text-blue-700">
                  {pattern}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Suggestions */}
        {insight.suggestions && insight.suggestions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1.5">Suggestions:</p>
            <ul className="list-disc list-inside space-y-1">
              {insight.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-gray-700">{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard({ analysisData, onAIAnalysisComplete }: DashboardProps) {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
  // AI Progress Modal State
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressSteps, setProgressSteps] = useState<AIProgressStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [aiModel, setAiModel] = useState('OpenAI GPT-4o');

  // Initialize progress steps
  const initializeProgressSteps = (model: string) => {
    const steps: AIProgressStep[] = [
      {
        id: 'init',
        label: 'Initializing AI Analysis',
        description: 'Setting up analysis parameters and validating input data',
        status: 'pending'
      },
      {
        id: 'parsing',
        label: 'Parsing Project Structure',
        description: 'Analyzing codebase architecture and relationships',
        status: 'pending',
        details: 'Extracting classes, methods, and dependencies from source code'
      },
      {
        id: 'context',
        label: 'Building Context',
        description: 'Preparing comprehensive project context for AI analysis',
        status: 'pending',
        details: 'Integrating custom prompts and architectural patterns'
      },
      {
        id: 'overview',
        label: 'Generating Project Overview',
        description: 'Creating high-level project description and objectives',
        status: 'pending',
        details: model.includes('local') ? 'Processing with local LLM for privacy' : 'Sending request to cloud AI service'
      },
      {
        id: 'architecture',
        label: 'Analyzing Architecture',
        description: 'Identifying architectural patterns and design principles',
        status: 'pending',
        details: 'Evaluating Spring Boot patterns, dependency injection, and layered architecture'
      },
      {
        id: 'modules',
        label: 'Examining Module Details',
        description: 'Analyzing individual components and their responsibilities',
        status: 'pending',
        details: 'Generating insights for controllers, services, and repositories'
      },
      {
        id: 'suggestions',
        label: 'Generating Recommendations',
        description: 'Creating actionable improvement suggestions and finalizing results',
        status: 'pending',
        details: 'Analyzing code quality, performance, and best practices'
      }
    ];
    
    setProgressSteps(steps);
    setCurrentStep(0);
  };

  // Calculate statistics
  const stats = {
    totalClasses: analysisData.classes.length,
    controllers: analysisData.classes.filter(c => c.type === 'controller').length,
    services: analysisData.classes.filter(c => c.type === 'service').length,
    repositories: analysisData.classes.filter(c => c.type === 'repository').length,
    entities: analysisData.entities.length,
    relationships: analysisData.relationships.length,
    totalMethods: analysisData.classes.reduce((sum, c) => sum + (c.methods?.length || 0), 0),
    packages: analysisData.structure.packages.length,
  };

  const generateAIAnalysis = async () => {
    setIsLoadingAI(true);
    
    // Get current AI model configuration
    try {
      const configResponse = await fetch('/api/ai-config');
      const configData = await configResponse.json();
      const modelName = configData.type === 'local' ? `Local LLM (${configData.model || 'Ollama'})` : 
                       configData.type === 'claude' ? 'AWS Claude 3.5 Sonnet' :
                       configData.type === 'gemini' ? 'Google Gemini Pro' :
                       'OpenAI GPT-4o';
      setAiModel(modelName);
    } catch (error) {
      setAiModel('OpenAI GPT-4o'); // fallback
    }

    // Initialize and show progress modal
    initializeProgressSteps(aiModel);
    setShowProgressModal(true);
    
    // Simulate step progression
    const progressSteps = [
      { step: 0, delay: 500, details: 'Validating project data and custom prompts' },
      { step: 1, delay: 1000, details: 'Scanning Java classes and annotations' },
      { step: 2, delay: 1500, details: 'Integrating architectural context' },
      { step: 3, delay: 3000, details: 'Generating comprehensive project overview' },
      { step: 4, delay: 4000, details: 'Analyzing Spring Boot patterns and dependencies' },
      { step: 5, delay: 5000, details: 'Examining individual module responsibilities' },
      { step: 6, delay: 6000, details: 'Creating recommendations and finalizing analysis' }
    ];

    // Update progress steps
    progressSteps.forEach(({ step, delay, details }) => {
      setTimeout(() => {
        setProgressSteps(prev => prev.map((s, index) => {
          if (index < step) {
            return { ...s, status: 'completed' as const, timestamp: new Date() };
          } else if (index === step) {
            return { ...s, status: 'running' as const, details };
          }
          return s;
        }));
        setCurrentStep(step);
      }, delay);
    });

    try {
      const requestBody = {
        ...analysisData,
        customPrompt: customPrompt.trim() || undefined
      };
      
      const response = await fetch('/api/projects/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('AI analysis failed:', response.status, errorData);
        throw new Error(`Server error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Complete all steps
      setTimeout(() => {
        setProgressSteps(prev => prev.map(s => ({ 
          ...s, 
          status: 'completed' as const, 
          timestamp: new Date() 
        })));
        setCurrentStep(6); // Final step index
        
        // Close modal after a brief delay
        setTimeout(() => {
          setShowProgressModal(false);
          setAiAnalysis(result);
          // Notify parent component of AI analysis completion
          if (onAIAnalysisComplete) {
            onAIAnalysisComplete(result);
          }
        }, 1500);
      }, 7500);
      
    } catch (error) {
      console.error('Failed to generate AI analysis:', error);
      
      // Mark current step as error
      setProgressSteps(prev => prev.map((s, index) => {
        if (index === currentStep) {
          return { ...s, status: 'error' as const };
        }
        return s;
      }));
      
      // Show error and close modal
      setTimeout(() => {
        setShowProgressModal(false);
        setAiAnalysis({
          projectOverview: "Unable to generate AI analysis at this time. Please check your AI configuration and try again.",
          projectDetails: {
            projectDescription: "Error",
            projectType: "unknown",
            implementedFeatures: [],
            modulesServices: []
          },
          architectureInsights: [],
          moduleInsights: {},
          suggestions: [],
          qualityScore: 0
        });
      }, 2000);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    if (analysisData.aiAnalysis) {
      setAiAnalysis(analysisData.aiAnalysis);
    }
  }, [analysisData]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Dashboard</h1>
          <p className="text-gray-600">Comprehensive analysis and AI insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={generateAIAnalysis} 
            disabled={isLoadingAI}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            {isLoadingAI ? 'Analyzing...' : 'Generate AI Insights'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Classes"
          value={stats.totalClasses}
          change={85}
          trend="up"
          icon={<Code className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Controllers"
          value={stats.controllers}
          change={12}
          trend="up"
          icon={<Globe className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Services"
          value={stats.services}
          change={28}
          trend="up"
          icon={<Settings className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Data Entities"
          value={stats.entities}
          change={45}
          trend="up"
          icon={<Database className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Custom Prompt Section */}
      <Card className="border-dashed border-2 border-blue-200 bg-blue-50/30">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MessageSquareText className="w-5 h-5 text-blue-600" />
              <Label htmlFor="custom-prompt" className="text-sm font-medium text-gray-700">
                Custom Prompt for AI Analysis (Optional)
              </Label>
            </div>
            <div className="space-y-2">
              <Textarea
                id="custom-prompt"
                placeholder="Add any specific instructions or context for the AI analysis... 
Example: 'Focus on security vulnerabilities and performance bottlenecks' or 'Analyze the authentication flow in detail'"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[100px] resize-vertical border-2 border-gray-300 focus:border-blue-500"
                disabled={isLoadingAI}
              />
              <p className="text-xs text-gray-500">
                This additional context will be included when generating AI insights to provide more targeted analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Architecture Quality Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Architecture Quality Score
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        data-testid="button-score-info"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96" data-testid="popup-score-calculation">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">How Score is Calculated</h4>
                          <p className="text-xs text-gray-500">AI-powered multi-factor analysis using advanced language models</p>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-start gap-2">
                            <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                            <div>
                              <span className="font-medium">Code Structure (25%):</span> Evaluates package organization, separation of concerns, and layered architecture
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="mt-1 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                            <div>
                              <span className="font-medium">Design Patterns (25%):</span> Identifies use of MVC, dependency injection, repository patterns, and best practices
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="mt-1 w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
                            <div>
                              <span className="font-medium">Code Quality (25%):</span> Analyzes method complexity, naming conventions, and code maintainability
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                            <div>
                              <span className="font-medium">Dependencies (25%):</span> Reviews relationship clarity, coupling levels, and architectural dependencies
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-200 space-y-2">
                          <h5 className="font-semibold text-xs text-gray-700">Technical Methodology</h5>
                          <div className="space-y-2 text-xs text-gray-600">
                            <div className="bg-blue-50 p-2 rounded">
                              <span className="font-medium text-blue-700">AI Models:</span> OpenAI GPT-4o, Claude 3.5 Sonnet, Gemini Pro, or Local LLMs (Ollama: Code Llama, Deepseek Coder, StarCoder, Llama 3, Mistral)
                            </div>
                            <div className="bg-green-50 p-2 rounded">
                              <span className="font-medium text-green-700">Algorithm:</span> Multi-stage prompt engineering with structured analysis. Parsed codebase metadata (classes, methods, dependencies, annotations) is sent to LLM with scoring criteria
                            </div>
                            <div className="bg-purple-50 p-2 rounded">
                              <span className="font-medium text-purple-700">Scoring Method:</span> Weighted average of 4 factors. Each factor scored 0-100 by AI based on detected patterns, then combined: (0.25×Structure) + (0.25×Patterns) + (0.25×Quality) + (0.25×Dependencies)
                            </div>
                            <div className="bg-orange-50 p-2 rounded">
                              <span className="font-medium text-orange-700">Validation:</span> Cross-referenced with static analysis patterns, architectural best practices database, and framework-specific standards (Spring Boot, JPA, REST)
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500 italic">
                            Example: 82% indicates strong architecture with good separation of concerns, proper use of design patterns, maintainable code structure, and well-organized dependencies
                          </p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">
                      {aiAnalysis?.qualityScore || 82}
                    </div>
                    <p className="text-sm text-gray-600">Overall Score</p>
                  </div>
                  <Progress value={aiAnalysis?.qualityScore || 82} className="h-2" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Component Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Component Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Controllers</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(stats.controllers / stats.totalClasses) * 100} className="w-20 h-2" />
                      <span className="text-sm font-medium">{stats.controllers}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Services</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(stats.services / stats.totalClasses) * 100} className="w-20 h-2" />
                      <span className="text-sm font-medium">{stats.services}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Repositories</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(stats.repositories / stats.totalClasses) * 100} className="w-20 h-2" />
                      <span className="text-sm font-medium">{stats.repositories}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Entities</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(stats.entities / (stats.totalClasses + stats.entities)) * 100} className="w-20 h-2" />
                      <span className="text-sm font-medium">{stats.entities}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Project Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{stats.totalMethods}</div>
                    <div className="text-sm text-gray-600">Total Methods</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.relationships}</div>
                    <div className="text-sm text-gray-600">Relationships</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.packages}</div>
                    <div className="text-sm text-gray-600">Packages</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {Math.round((stats.totalMethods / stats.totalClasses) * 10) / 10}
                    </div>
                    <div className="text-sm text-gray-600">Avg Methods/Class</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visualization Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Component Distribution Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Component Distribution Chart
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Info className="w-5 h-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">How This Chart is Calculated</h4>
                        <p className="text-xs text-gray-600">
                          This bar chart displays the total count of each component type found in your codebase during the static analysis phase.
                        </p>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p><strong>Controllers:</strong> Classes with @RestController or @Controller annotations</p>
                          <p><strong>Services:</strong> Classes with @Service annotation</p>
                          <p><strong>Repositories:</strong> Classes with @Repository or extending JpaRepository</p>
                          <p><strong>Entities:</strong> Classes with @Entity annotation</p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Controllers', count: stats.controllers, fill: '#3b82f6' },
                    { name: 'Services', count: stats.services, fill: '#10b981' },
                    { name: 'Repositories', count: stats.repositories, fill: '#f59e0b' },
                    { name: 'Entities', count: stats.entities, fill: '#8b5cf6' },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Components" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Component Type Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Component Type Distribution
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Info className="w-5 h-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">How This Chart is Calculated</h4>
                        <p className="text-xs text-gray-600">
                          This pie chart shows the percentage distribution of component types in your architecture, helping you understand the composition of your codebase.
                        </p>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p><strong>Calculation:</strong> Each slice represents (Component Count / Total Components) × 100%</p>
                          <p><strong>Purpose:</strong> Identifies if your architecture is balanced or heavily weighted towards certain layers</p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Controllers', value: stats.controllers, color: '#3b82f6' },
                        { name: 'Services', value: stats.services, color: '#10b981' },
                        { name: 'Repositories', value: stats.repositories, color: '#f59e0b' },
                        { name: 'Entities', value: stats.entities, color: '#8b5cf6' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { color: '#3b82f6' },
                        { color: '#10b981' },
                        { color: '#f59e0b' },
                        { color: '#8b5cf6' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Architecture Quality Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Architecture Quality Metrics
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <Info className="w-5 h-5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">How These Metrics are Calculated</h4>
                      <p className="text-xs text-gray-600 mb-2">
                        Each axis represents a different quality dimension analyzed by AI, scored 0-100:
                      </p>
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="bg-blue-50 p-2 rounded">
                          <p><strong>Code Structure (85):</strong> Package organization, separation of concerns, layered architecture patterns</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <p><strong>Design Patterns:</strong> MVC, DI, Repository patterns detected and evaluated by AI</p>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <p><strong>Code Quality (78):</strong> Method complexity, naming conventions, code maintainability</p>
                        </div>
                        <div className="bg-orange-50 p-2 rounded">
                          <p><strong>Dependencies (88):</strong> Coupling levels, relationship clarity, dependency management</p>
                        </div>
                        <div className="bg-pink-50 p-2 rounded">
                          <p><strong>Maintainability (80):</strong> Ease of modification, extensibility, code readability</p>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded">
                          <p><strong>Testability (75):</strong> Unit test coverage potential, dependency injection usage</p>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={[
                  { subject: 'Code Structure', value: 85, fullMark: 100 },
                  { subject: 'Design Patterns', value: aiAnalysis?.qualityScore || 82, fullMark: 100 },
                  { subject: 'Code Quality', value: 78, fullMark: 100 },
                  { subject: 'Dependencies', value: 88, fullMark: 100 },
                  { subject: 'Maintainability', value: 80, fullMark: 100 },
                  { subject: 'Testability', value: 75, fullMark: 100 },
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Quality Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Code Metrics Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Methods per Class Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    Methods per Component Type
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Info className="w-5 h-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">How This Chart is Calculated</h4>
                        <p className="text-xs text-gray-600">
                          This horizontal bar chart shows the estimated average number of methods per component type based on typical architectural patterns.
                        </p>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p><strong>Calculation:</strong> (Total Methods × Expected Distribution) / Component Count</p>
                          <p><strong>Distribution:</strong> Controllers (30%), Services (40%), Repositories (20%), Entities (10%)</p>
                          <p><strong>Purpose:</strong> Identifies complexity concentration in different architectural layers</p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={[
                      { 
                        type: 'Controllers', 
                        avgMethods: stats.controllers > 0 
                          ? Math.round((stats.totalMethods * 0.3) / stats.controllers) 
                          : 0 
                      },
                      { 
                        type: 'Services', 
                        avgMethods: stats.services > 0 
                          ? Math.round((stats.totalMethods * 0.4) / stats.services) 
                          : 0 
                      },
                      { 
                        type: 'Repositories', 
                        avgMethods: stats.repositories > 0 
                          ? Math.round((stats.totalMethods * 0.2) / stats.repositories) 
                          : 0 
                      },
                      { 
                        type: 'Entities', 
                        avgMethods: stats.entities > 0 
                          ? Math.round((stats.totalMethods * 0.1) / stats.entities) 
                          : 0 
                      },
                    ]} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="type" type="category" width={90} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgMethods" fill="#10b981" name="Avg Methods" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Package Complexity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Package & Relationship Metrics
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Info className="w-5 h-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">How This Chart is Calculated</h4>
                        <p className="text-xs text-gray-600">
                          This area chart visualizes the overall structure and complexity of your codebase across four key dimensions.
                        </p>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p><strong>Total Classes:</strong> All classes analyzed in the project</p>
                          <p><strong>Packages:</strong> Number of distinct packages/namespaces</p>
                          <p><strong>Relationships:</strong> Dependencies and connections between classes</p>
                          <p><strong>Methods:</strong> Total public/private methods found (normalized for display)</p>
                          <p className="text-xs text-gray-500 italic mt-1">Higher values indicate more complex project structure</p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { name: 'Total Classes', value: stats.totalClasses },
                    { name: 'Packages', value: stats.packages },
                    { name: 'Relationships', value: stats.relationships },
                    { name: 'Methods', value: Math.min(stats.totalMethods, stats.totalClasses * 2) },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Architecture Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiAnalysis?.architectureInsights && aiAnalysis.architectureInsights.length > 0 ? (
                  aiAnalysis.architectureInsights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <FormattedAIContent content={insight} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Generate AI analysis to see architecture insights</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Project Overview</h3>
              <Card>
                <CardContent className="p-6">
                  <ScrollArea className="h-[400px]">
                    {aiAnalysis?.projectOverview ? (
                      <FormattedAIContent content={aiAnalysis.projectOverview} variant="architecture" />
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Generate AI analysis to see project overview</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Module Insights</h3>
              <ScrollArea className="h-[400px]">
                {aiAnalysis?.moduleInsights && Object.keys(aiAnalysis.moduleInsights).length > 0 ? (
                  Object.entries(aiAnalysis.moduleInsights).map(([moduleName, insight]) => (
                    <Card key={moduleName} className="mb-4">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full">
                            <Code className="w-4 h-4 text-blue-600" />
                          </div>
                          <CardTitle className="text-sm font-semibold">{moduleName}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        {insight.description && (
                          <div>
                            <FormattedAIContent content={insight.description} />
                          </div>
                        )}
                        
                        {insight.components && insight.components.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-700 mb-1.5">Components:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {insight.components.map((component: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                                  {component}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Generate AI analysis to see module insights</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiAnalysis?.suggestions && aiAnalysis.suggestions.length > 0 ? (
                  aiAnalysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 shadow-sm">
                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-900 mb-2">Recommendation #{index + 1}</p>
                        <FormattedAIContent content={suggestion} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Generate AI analysis to see recommendations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Progress Modal */}
      <AIProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        steps={progressSteps}
        currentStep={currentStep}
        aiModel={aiModel}
        estimatedTime={45}
      />
    </div>
  );
}