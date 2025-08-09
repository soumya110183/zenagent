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
  MessageSquareText
} from 'lucide-react';
import { type AnalysisData, type AIAnalysisResult } from '@shared/schema';
import AIProgressModal, { type AIProgressStep } from './ai-progress-modal';

interface DashboardProps {
  analysisData: AnalysisData;
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
  title: string;
  content: string;
  confidence: number;
  tags: string[];
  type: string;
}

function AIInsightCard({ title, content, confidence, tags, type }: AIInsightCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'overview': return <Brain className="w-4 h-4" />;
      case 'architecture_suggestion': return <Lightbulb className="w-4 h-4" />;
      case 'module_description': return <Code className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTypeIcon(type)}
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${getConfidenceColor(confidence)}`}>
              {Math.round(confidence * 100)}% confidence
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-3">{content}</p>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard({ analysisData }: DashboardProps) {
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
        description: 'Creating actionable improvement suggestions',
        status: 'pending',
        details: 'Analyzing code quality, performance, and best practices'
      },
      {
        id: 'finalizing',
        label: 'Finalizing Results',
        description: 'Compiling and formatting analysis results',
        status: 'pending',
        details: 'Preparing comprehensive insights and quality scores'
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
    totalMethods: analysisData.classes.reduce((sum, c) => sum + c.methods.length, 0),
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
      { step: 6, delay: 6000, details: 'Creating improvement recommendations' },
      { step: 7, delay: 7000, details: 'Compiling final analysis report' }
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
        setCurrentStep(7); // Final step index
        
        // Close modal after a brief delay
        setTimeout(() => {
          setShowProgressModal(false);
          setAiAnalysis(result);
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
                className="min-h-[100px] resize-vertical"
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
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Architecture Quality Score
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
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Architecture Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiAnalysis?.architectureInsights.map((insight, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">{insight}</span>
                  </div>
                )) || (
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
                  {aiAnalysis?.projectOverview || (
                    <div className="text-center py-8 text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Generate AI analysis to see project overview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Module Insights</h3>
              <ScrollArea className="h-96">
                {aiAnalysis?.moduleInsights ? Object.values(aiAnalysis.moduleInsights).map((insight, index) => (
                  <AIInsightCard
                    key={index}
                    title={insight.title}
                    content={insight.content}
                    confidence={insight.confidence}
                    tags={insight.tags}
                    type={insight.type}
                  />
                )) : (
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
                {aiAnalysis?.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Improvement Suggestion</p>
                      <p className="text-sm text-yellow-700 mt-1">{suggestion}</p>
                    </div>
                  </div>
                )) || (
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