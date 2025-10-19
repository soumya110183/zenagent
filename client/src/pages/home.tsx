import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Project } from "@shared/schema";
import UploadSection from "@/components/upload-section";
import ProcessingSection from "@/components/processing-section";
import AnalysisResults from "@/components/analysis-results";
import Dashboard from "@/components/dashboard";
import AIModelSelector, { type AIModelConfig } from "@/components/ai-model-selector";
import AnalysisFlowDiagram from "@/components/analysis-flow-diagram";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AIAnalysisResult } from "@shared/schema";
import { GitBranch, HelpCircle, Settings, Upload, Github, Code2, Database, Cpu, FileCode, Eye, GitMerge, Shield, Bot, Brain, Zap, Info, Search, BarChart4, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import Layout from "@/components/layout";
import { SiPython, SiApachespark } from "react-icons/si";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import zensarLogo from "@assets/Zensar_composite_logo_whit_ai_1754732936523.png";
import zenagentBanner from "@assets/zenagent_1754759778955.png";
import agentLogo from "@assets/agent_1754854183020.png";
import pythonLogo from "@assets/pyth_1754703124415.png";
import pysparkLogo from "@assets/pyspark-lang_1754703714412.png";
import ibmLogo from "@assets/ibm_1754703124415.png";

type AppState = 'upload' | 'processing' | 'results';
type ProjectType = 'java' | 'pyspark' | 'mainframe' | 'python' | 'csharp' | 'kotlin' | 'responsible-ai' | 'code-lens' | 'match-lens' | 'validator' | 'zenvector' | 'knowledge' | 'datalens' | 'codeshift';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType | null>(null);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIModelConfig>({ type: 'openai' });
  const [showDevelopmentModal, setShowDevelopmentModal] = useState(false);
  const [selectedAgentName, setSelectedAgentName] = useState<string>('');
  const { toast } = useToast();

  const { data: currentProject, refetch: refetchProject } = useQuery<Project>({
    queryKey: ['/api/projects', currentProjectId],
    enabled: !!currentProjectId,
  });

  const handleFileUploaded = (project: Project) => {
    setCurrentProjectId(project.id);
    setAppState('processing');
    
    // Poll for completion
    const pollInterval = setInterval(async () => {
      const { data: updatedProject } = await refetchProject();
      if (updatedProject && updatedProject.status !== 'processing') {
        clearInterval(pollInterval);
        if (updatedProject.status === 'completed') {
          setAppState('results');
        } else {
          setAppState('upload');
          setCurrentProjectId(null);
        }
      }
    }, 2000);
  };

  const handleGitHubAnalyzed = (project: Project) => {
    setCurrentProjectId(project.id);
    setAppState('processing');
    
    // Poll for completion with longer interval for GitHub repos
    const pollInterval = setInterval(async () => {
      const { data: updatedProject } = await refetchProject();
      if (updatedProject && updatedProject.status !== 'processing') {
        clearInterval(pollInterval);
        if (updatedProject.status === 'completed') {
          setAppState('results');
        } else if (updatedProject.status === 'failed') {
          toast({
            title: "Analysis Failed",
            description: "GitHub repository analysis failed. Please try again.",
            variant: "destructive",
          });
          setAppState('upload');
          setCurrentProjectId(null);
        }
      }
    }, 3000); // Longer interval for GitHub repos
  };

  const handleNewAnalysis = () => {
    setAppState('upload');
    setCurrentProjectId(null);
  };

  const handleAIModelConfig = async (config: AIModelConfig) => {
    try {
      await apiRequest('/api/ai-config', 'POST', config);
      setAiConfig(config);
      setShowAIConfig(false);
    } catch (error) {
      console.error('Failed to configure AI model:', error);
    }
  };

  const handleAIAnalysisComplete = (analysis: AIAnalysisResult) => {
    if (currentProject && currentProject.analysisData) {
      // Update the project's analysisData with AI analysis
      const updatedAnalysisData = {
        ...currentProject.analysisData,
        aiAnalysis: analysis
      };
      
      // Update the query cache
      queryClient.setQueryData(
        ['/api/projects', currentProjectId],
        {
          ...currentProject,
          analysisData: updatedAnalysisData
        }
      );
    }
  };

  const handleAgentClick = (agentId: ProjectType) => {
    if (agentId === 'code-lens' || agentId === 'java') {
      // Java Agent and Code Lens Agent navigate to analysis pages
      setSelectedProjectType(agentId);
    } else {
      // All other agents show development mode modal
      const agentNames: Record<ProjectType, string> = {
        'java': 'Java Agent',
        'pyspark': 'PySpark Agent',
        'mainframe': 'Mainframe Agent', 
        'python': 'Python Agent',
        'csharp': 'C# Agent',
        'kotlin': 'Kotlin Agent',
        'responsible-ai': 'Responsible AI Agent',
        'code-lens': 'Code Lens Agent',
        'match-lens': 'Match Lens Agent',
        'validator': 'Validator Agent',
        'zenvector': 'ZenVector Agent',
        'knowledge': 'Knowledge Agent',
        'datalens': 'Data Lens Agent',
        'codeshift': 'Codeshift Lens Agent'
      };
      
      setSelectedAgentName(agentNames[agentId]);
      setShowDevelopmentModal(true);
    }
  };

  // Original language project types with Validator Agent moved here
  const languageProjects = [
    {
      id: 'java' as ProjectType,
      name: 'Java',
      description: 'Comprehensive analysis of Java applications including Spring Boot frameworks, Maven/Gradle builds, and enterprise patterns',
      logoSrc: agentLogo,
      borderColor: 'border-primary',
      bgColor: 'bg-primary/5',
      hoverBgColor: 'hover:bg-primary/10',
      features: [
        'Spring Boot & Spring Framework analysis',
        'JPA/Hibernate entity relationship mapping', 
        'MVC architecture pattern detection',
        'Maven/Gradle dependency analysis',
        'RESTful API endpoint documentation',
        'Database connection and configuration review'
      ]
    },
    {
      id: 'pyspark' as ProjectType,
      name: 'PySpark',
      description: 'Advanced big data processing pipeline analysis with Apache Spark ecosystem integration and performance optimization insights',
      logoSrc: pysparkLogo,
      borderColor: 'border-warning',
      bgColor: 'bg-warning/10',
      hoverBgColor: 'hover:bg-warning/20',
      features: [
        'DataFrame operations and transformations',
        'Spark job execution flow visualization',
        'Performance bottleneck identification',
        'Data pipeline architecture mapping',
        'Cluster resource utilization analysis',
        'SQL query optimization recommendations'
      ]
    },
    {
      id: 'mainframe' as ProjectType,
      name: 'Mainframe',
      description: 'Legacy system analysis for COBOL programs, JCL job scheduling, and mainframe database integrations with modernization insights',
      logoSrc: ibmLogo,
      borderColor: 'border-secondary',
      bgColor: 'bg-secondary/5',
      hoverBgColor: 'hover:bg-secondary/10',
      features: [
        'COBOL program structure and flow analysis',
        'JCL job dependency mapping',
        'DB2/IMS database connection analysis',
        'CICS transaction processing review',
        'Copybook and include file relationships',
        'Modernization readiness assessment'
      ]
    },
    {
      id: 'python' as ProjectType,
      name: 'Python',
      description: 'Deep analysis of Python applications with Django/Flask framework detection, package dependencies, and API architecture insights',
      logoSrc: pythonLogo,
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-50',
      hoverBgColor: 'hover:bg-blue-100',
      features: [
        'Django/Flask framework pattern analysis',
        'Package dependency mapping (pip, conda)',
        'API endpoint documentation and routing',
        'Database ORM relationship analysis',
        'Virtual environment configuration review',
        'Code quality and PEP compliance checking'
      ]
    },
    {
      id: 'csharp' as ProjectType,
      name: 'C#',
      description: 'Comprehensive analysis of C# applications including .NET Core, ASP.NET, Entity Framework, and enterprise patterns',
      logoSrc: agentLogo,
      borderColor: 'border-purple-600',
      bgColor: 'bg-purple-50',
      hoverBgColor: 'hover:bg-purple-100',
      features: [
        '.NET Core & ASP.NET framework analysis',
        'Entity Framework ORM mapping',
        'MVC/MVVM architecture detection',
        'NuGet dependency analysis',
        'Web API and REST endpoint documentation',
        'LINQ query optimization'
      ]
    },
    {
      id: 'kotlin' as ProjectType,
      name: 'Kotlin',
      description: 'Advanced analysis of Kotlin applications with Android frameworks, coroutines, and JVM ecosystem integration',
      logoSrc: agentLogo,
      borderColor: 'border-orange-600',
      bgColor: 'bg-orange-50',
      hoverBgColor: 'hover:bg-orange-100',
      features: [
        'Kotlin coroutines and flow analysis',
        'Android framework pattern detection',
        'Gradle dependency mapping',
        'Spring Boot Kotlin integration',
        'Jetpack Compose UI analysis',
        'Multiplatform project support'
      ]
    }
  ];

  // AI Agent types for Diamond Project
  const aiAgents = [
    {
      id: 'code-lens' as ProjectType,
      name: 'Code Lens Agent',
      description: 'Advanced demographic field analysis and integration pattern detection for comprehensive application understanding',
      logoSrc: agentLogo,
      borderColor: 'border-chart-3',
      bgColor: 'bg-chart-3/5',
      hoverBgColor: 'hover:bg-chart-3/10',
      features: [
        'Demographic field identification and analysis',
        'Integration pattern detection and mapping',
        'Data flow and transformation analysis',
        'Cross-system dependency identification',
        'API endpoint and service interaction mapping',
        'Business logic and workflow documentation'
      ]
    },
    {
      id: 'knowledge' as ProjectType,
      name: 'Knowledge Agent',
      description: 'Document intelligence and Q&A system with Confluence integration, PDF processing, and intelligent knowledge extraction',
      logoSrc: agentLogo,
      borderColor: 'border-teal-500',
      bgColor: 'bg-teal-50',
      hoverBgColor: 'hover:bg-teal-100',
      features: [
        'Confluence web scraping integration',
        'IBM Doclinq PDF processing',
        'LangChain document processing',
        'Redis caching for performance',
        'Intelligent Q&A chat interface',
        'Multi-source knowledge aggregation'
      ]
    },
    {
      id: 'codeshift' as ProjectType,
      name: 'Codeshift Lens Agent',
      description: 'Multi-language code conversion agent for transforming source code between programming languages while preserving logic',
      logoSrc: agentLogo,
      borderColor: 'border-indigo-500',
      bgColor: 'bg-indigo-50',
      hoverBgColor: 'hover:bg-indigo-100',
      features: [
        'Multi-language code translation',
        'Framework migration support',
        'AST-based syntax conversion',
        'Code quality preservation',
        'Bulk project processing',
        'Language ecosystem mapping'
      ]
    },
    {
      id: 'validator' as ProjectType,
      name: 'Validator Agent',
      description: 'Comprehensive code validation covering security vulnerabilities, privacy compliance, and quality assessment',
      logoSrc: agentLogo,
      borderColor: 'border-chart-5',
      bgColor: 'bg-chart-5/5',
      hoverBgColor: 'hover:bg-chart-5/10',
      features: [
        'Security vulnerability detection and assessment',
        'Privacy compliance and data protection validation',
        'Code quality metrics and best practices review',
        'Performance bottleneck identification',
        'Regulatory compliance verification (GDPR, CCPA)',
        'Security risk scoring and remediation guidance'
      ]
    },
    {
      id: 'responsible-ai' as ProjectType,
      name: 'Responsible AI Agent',
      description: 'Ethics and bias detection in code analysis with comprehensive AI governance and fairness assessment',
      logoSrc: agentLogo,
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-50',
      hoverBgColor: 'hover:bg-purple-100',
      features: [
        'AI ethics and bias detection in algorithms',
        'Fairness assessment across demographic groups',
        'Algorithmic transparency and explainability',
        'Compliance with AI governance frameworks',
        'Ethical code review and recommendations',
        'Responsible AI deployment validation'
      ]
    }
  ];

  const projectTypes = [...languageProjects, ...aiAgents];

  const aiConfigButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowAIConfig(true)}
      className="text-primary bg-white border-primary hover:bg-primary hover:text-white font-medium transition-colors"
    >
      <Settings className="w-4 h-4 mr-2" />
      AI Settings
    </Button>
  );

  return (
    <TooltipProvider>
      <Layout aiConfigButton={aiConfigButton}>
        <div className="bg-white font-sans text-foreground min-h-screen">

      {/* Analysis Workflow Diagram */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              AMEX Diamond Project Discovery Analysis
            </h2>
            <p className="text-gray-600 text-sm">
              End-to-end automated analysis process powered by AI
            </p>
          </div>
          <div className="max-w-6xl mx-auto mb-8">
            <AnalysisFlowDiagram />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {appState === 'upload' && !selectedProjectType && (
          <div className="max-w-6xl mx-auto">

            {/* Language Project Types */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Zengent AI - Code Scan utilities</h3>
                  <p className="text-sm text-gray-600">Multi-language codebase analysis supporting enterprise frameworks</p>
                </div>
              </div>
              
              {/* Enterprise AI Platform Summary */}
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-6 mb-8 border border-blue-600">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Enterprise Application Agents
                  </h2>
                  <p className="text-blue-100 text-sm mb-3">
                    Transform your codebase understanding with 11 specialized AI agents covering multi-language analysis, 
                    vector database intelligence, and enterprise-grade document processing. Each agent provides unique 
                    capabilities for comprehensive application intelligence and code analysis.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs text-emerald-300 border-emerald-300 bg-emerald-900/20">Java & Spring Boot</Badge>
                    <Badge variant="outline" className="text-xs text-blue-300 border-blue-300 bg-blue-800/30">Python & Django</Badge>
                    <Badge variant="outline" className="text-xs text-orange-300 border-orange-300 bg-orange-900/20">PySpark & Big Data</Badge>
                    <Badge variant="outline" className="text-xs text-purple-300 border-purple-300 bg-purple-900/20">Mainframe & COBOL</Badge>
                    <Badge variant="outline" className="text-xs text-cyan-300 border-cyan-300 bg-cyan-900/20">AI/ML Analysis</Badge>
                    <Badge variant="outline" className="text-xs text-pink-300 border-pink-300 bg-pink-900/20">Generative AI</Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {languageProjects.map((type) => {
                  return (
                    <div
                      key={type.id}
                      onClick={() => handleAgentClick(type.id)}
                      className={`relative group cursor-pointer bg-card rounded-lg border-2 ${type.borderColor} ${type.hoverBgColor} shadow-md hover:shadow-lg transition-all duration-300 p-3`}
                    >
                      <div>
                        {/* Enhanced header with smaller logo and name */}
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`inline-flex items-center justify-center bg-background rounded-lg p-1.5 shadow-sm ${type.id === 'pyspark' ? 'w-20 h-14' : 'w-20 h-20'}`}>
                            <img 
                              src={type.logoSrc} 
                              alt={`${type.name} logo`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <h3 className="text-sm font-bold text-foreground leading-tight">
                            {type.name}
                          </h3>
                        </div>
                        
                        {/* Compact description */}
                        <p className="text-muted-foreground text-xs mb-1.5 line-clamp-2">
                          {type.description}
                        </p>
                        
                        {/* Complete feature list - show all features */}
                        <div className={`${type.bgColor} rounded-md p-1.5`}>
                          <ul className="space-y-0.5">
                            {type.features.map((feature, index) => (
                              <li key={index} className="text-xs text-foreground/70 flex items-start">
                                <div className="w-1 h-1 bg-primary rounded-full mr-1.5 mt-1 flex-shrink-0"></div>
                                <span className="line-clamp-1">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agents for Amex Diamond */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Agents for Diamond Project</h3>
                  <p className="text-sm text-gray-600">Specialized AI agents for advanced analysis and processing</p>
                </div>
              </div>
              
              {/* Diamond Project AI Platform Summary */}
              <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 rounded-xl p-6 mb-8 border border-emerald-600">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Diamond Project Intelligence
                  </h2>
                  <p className="text-emerald-100 text-sm mb-3">
                    Advanced AI-powered agents designed for specialized analysis tasks including code matching, knowledge extraction, 
                    data analysis, and intelligent code transformation. Each agent leverages cutting-edge AI models for precise 
                    and efficient processing of complex enterprise data and code patterns.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs text-blue-300 border-blue-300 bg-blue-900/20">Code Analysis</Badge>
                    <Badge variant="outline" className="text-xs text-purple-300 border-purple-300 bg-purple-900/20">Pattern Matching</Badge>
                    <Badge variant="outline" className="text-xs text-yellow-300 border-yellow-300 bg-yellow-900/20">Knowledge Mining</Badge>
                    <Badge variant="outline" className="text-xs text-red-300 border-red-300 bg-red-900/20">Data Intelligence</Badge>
                    <Badge variant="outline" className="text-xs text-indigo-300 border-indigo-300 bg-indigo-900/20">Code Transformation</Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {aiAgents.map((type) => {
                  return (
                    <div
                      key={type.id}
                      onClick={() => handleAgentClick(type.id)}
                      className={`relative group cursor-pointer bg-card rounded-lg border-2 ${type.borderColor} ${type.hoverBgColor} shadow-md hover:shadow-lg transition-all duration-300 p-3`}
                    >
                      <div>
                        {/* Enhanced header with smaller logo and name */}
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="inline-flex items-center justify-center bg-background rounded-lg p-1.5 shadow-sm w-20 h-20">
                            <img 
                              src={type.logoSrc} 
                              alt={`${type.name} logo`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <h3 className="text-sm font-bold text-foreground leading-tight">
                            {type.name}
                          </h3>
                        </div>
                        
                        {/* Compact description */}
                        <p className="text-muted-foreground text-xs mb-1.5 line-clamp-2">
                          {type.description}
                        </p>
                        
                        {/* Complete feature list - show all features */}
                        <div className={`${type.bgColor} rounded-md p-1.5`}>
                          <ul className="space-y-0.5">
                            {type.features.map((feature, index) => (
                              <li key={index} className="text-xs text-foreground/70 flex items-start">
                                <div className="w-1 h-1 bg-primary rounded-full mr-1.5 mt-1 flex-shrink-0"></div>
                                <span className="line-clamp-1">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {appState === 'upload' && selectedProjectType && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setSelectedProjectType(null)}
                className="text-primary hover:text-primary/80 flex items-center space-x-2 mb-4"
              >
                <span>← Back to AI agents</span>
              </button>
              <div className="flex items-center space-x-4">
                {(() => {
                  const selectedType = projectTypes.find(t => t.id === selectedProjectType);
                  if (!selectedType) return null;
                  return (
                    <>
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-lg p-3">
                        <img 
                          src={selectedType.logoSrc} 
                          alt={`${selectedType.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-foreground">
                          {selectedType.name}
                        </h1>
                        <p className="text-muted-foreground">
                          {selectedType.description}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            <UploadSection onFileUploaded={handleFileUploaded} onGitHubAnalyzed={handleGitHubAnalyzed} />
          </div>
        )}
        
        {appState === 'processing' && currentProject && (
          <ProcessingSection project={currentProject} />
        )}
        
        {appState === 'results' && currentProject && currentProject.analysisData && (
          <div className="space-y-8">
            {currentProject.analysisData && typeof currentProject.analysisData === 'object' && (
              <>
                <Dashboard 
                  analysisData={currentProject.analysisData as any} 
                  onAIAnalysisComplete={handleAIAnalysisComplete}
                />
                <AnalysisResults 
                  project={currentProject} 
                  onNewAnalysis={handleNewAnalysis}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button - only show in results view */}
      {appState === 'results' && (
        <button
          onClick={handleNewAnalysis}
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* AI Model Configuration Modal */}
      {showAIConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI Model Configuration</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIConfig(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-4">
              <AIModelSelector
                onModelSelect={handleAIModelConfig}
                currentConfig={aiConfig}
              />
            </div>
          </div>
        </div>
      )}

      {/* Development Mode Modal */}
      {showDevelopmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="text-center p-8">
              {/* Icon */}
              <div className="mx-auto flex items-center justify-center w-32 h-32 mb-4">
                <img 
                  src={agentLogo} 
                  alt="Agent" 
                  className="w-32 h-32 object-contain"
                />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {selectedAgentName}
              </h3>
              
              {/* Application Name */}
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Zengent AI
              </h4>
              
              {/* Subtitle */}
              <h4 className="text-lg font-medium text-blue-600 mb-3">
                Coming Soon!
              </h4>
              
              {/* Description */}
              <p className="text-gray-600 text-sm mb-6">
                This agent is currently under development and will be available in our next update. 
                Stay tuned for exciting new features!
              </p>
              
              {/* Button */}
              <Button
                onClick={() => setShowDevelopmentModal(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg font-medium transition-colors"
              >
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}
        </div>
      </Layout>
      <Toaster />
    </TooltipProvider>
  );
}
