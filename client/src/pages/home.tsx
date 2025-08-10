import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Project } from "@shared/schema";
import UploadSection from "@/components/upload-section";
import ProcessingSection from "@/components/processing-section";
import AnalysisResults from "@/components/analysis-results";
import Dashboard from "@/components/dashboard";
import AIModelSelector, { type AIModelConfig } from "@/components/ai-model-selector";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
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
import zensarLogo from "@assets/Zensar_composite_logo_whit_ai_1754732936523.png";
import zenagentBanner from "@assets/zenagent_1754759778955.png";
import agentLogo from "@assets/agent_1754754612491.png";
import pythonLogo from "@assets/pyth_1754703124415.png";
import pysparkLogo from "@assets/pyspark-lang_1754703714412.png";
import ibmLogo from "@assets/ibm_1754703124415.png";

type AppState = 'upload' | 'processing' | 'results';
type ProjectType = 'java' | 'pyspark' | 'mainframe' | 'python' | 'code-lens' | 'match-lens' | 'validator' | 'zenvector' | 'knowledge' | 'datalens' | 'codeshift';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType | null>(null);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIModelConfig>({ type: 'openai' });

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
    }
  ];

  // AI Agent types (ZenVector Agent removed, Validator moved to Language Project Analysis)
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
      id: 'match-lens' as ProjectType,
      name: 'Match Lens Agent',
      description: 'Intelligent field matching between demographic data and C360 customer fields with automated relationship discovery',
      logoSrc: agentLogo,
      borderColor: 'border-chart-4',
      bgColor: 'bg-chart-4/5',
      hoverBgColor: 'hover:bg-chart-4/10',
      features: [
        'Demographic field to C360 field matching',
        'Automated relationship discovery and mapping',
        'Data quality and consistency analysis',
        'Field transformation rule identification',
        'Customer data model alignment verification',
        'Integration gap analysis and recommendations'
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
      id: 'datalens' as ProjectType,
      name: 'Data Lens Agent',
      description: 'Big Data intelligence agent for analyzing large-scale datasets, data lakes, and distributed computing environments',
      logoSrc: agentLogo,
      borderColor: 'border-cyan-500',
      bgColor: 'bg-cyan-50',
      hoverBgColor: 'hover:bg-cyan-100',
      features: [
        'Petabyte-scale data analysis',
        'Apache Spark optimization',
        'Real-time streaming analytics',
        'Data quality monitoring',
        'ETL pipeline optimization',
        'ML pipeline integration'
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



      {/* Zenagent Banner */}
      <div className="flex justify-center py-4 bg-white">
        <div className="w-[60%] h-[30vw] max-h-60">
          <img 
            src={zenagentBanner} 
            alt="Zengent AI Agents" 
            className="w-full h-full object-contain rounded-lg"
          />
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
                  <h3 className="text-lg font-semibold text-gray-900">Project AI Agents</h3>
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
                    Transform your codebase understanding with 9 specialized AI agents covering multi-language analysis, 
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
                      onClick={() => setSelectedProjectType(type.id)}
                      className={`relative group cursor-pointer bg-card rounded-lg border-2 ${type.borderColor} ${type.hoverBgColor} shadow-md hover:shadow-lg transition-all duration-300 p-4`}
                    >
                      <div>
                        {/* Compact header with logo and name */}
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`inline-flex items-center justify-center bg-background rounded-lg p-1.5 ${type.id === 'pyspark' ? 'w-10 h-6' : 'w-8 h-8'}`}>
                            <img 
                              src={type.logoSrc} 
                              alt={`${type.name} logo`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground leading-tight">
                            {type.name}
                          </h3>
                        </div>
                        
                        {/* Compact description */}
                        <p className="text-muted-foreground text-xs mb-2 line-clamp-2">
                          {type.description}
                        </p>
                        
                        {/* Compact feature list - show only first 3 features */}
                        <div className={`${type.bgColor} rounded-lg p-2`}>
                          <ul className="space-y-0.5">
                            {type.features.slice(0, 3).map((feature, index) => (
                              <li key={index} className="text-xs text-foreground/70 flex items-start">
                                <div className="w-1 h-1 bg-primary rounded-full mr-1.5 mt-1 flex-shrink-0"></div>
                                <span className="line-clamp-1">{feature}</span>
                              </li>
                            ))}
                            {type.features.length > 3 && (
                              <li className="text-xs text-muted-foreground/60 italic">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help hover:text-muted-foreground underline decoration-dotted">
                                      +{type.features.length - 3} more features
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <div className="space-y-1">
                                      <p className="font-semibold text-sm">All {type.name} Features:</p>
                                      <ul className="space-y-0.5">
                                        {type.features.slice(3).map((feature, index) => (
                                          <li key={index} className="text-xs flex items-start">
                                            <div className="w-1 h-1 bg-primary rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                                            <span>{feature}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </li>
                            )}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {aiAgents.map((type) => {
                  return (
                    <div
                      key={type.id}
                      onClick={() => setSelectedProjectType(type.id)}
                      className={`relative group cursor-pointer bg-card rounded-lg border-2 ${type.borderColor} ${type.hoverBgColor} shadow-md hover:shadow-lg transition-all duration-300 p-4`}
                    >
                      <div>
                        {/* Compact header with logo and name */}
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="inline-flex items-center justify-center bg-background rounded-lg p-1.5 w-8 h-8">
                            <img 
                              src={type.logoSrc} 
                              alt={`${type.name} logo`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground leading-tight">
                            {type.name}
                          </h3>
                        </div>
                        
                        {/* Compact description */}
                        <p className="text-muted-foreground text-xs mb-2 line-clamp-2">
                          {type.description}
                        </p>
                        
                        {/* Compact feature list - show only first 3 features */}
                        <div className={`${type.bgColor} rounded-lg p-2`}>
                          <ul className="space-y-0.5">
                            {type.features.slice(0, 3).map((feature, index) => (
                              <li key={index} className="text-xs text-foreground/70 flex items-start">
                                <div className="w-1 h-1 bg-primary rounded-full mr-1.5 mt-1 flex-shrink-0"></div>
                                <span className="line-clamp-1">{feature}</span>
                              </li>
                            ))}
                            {type.features.length > 3 && (
                              <li className="text-xs text-muted-foreground/60 italic">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help hover:text-muted-foreground underline decoration-dotted">
                                      +{type.features.length - 3} more features
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <div className="space-y-1">
                                      <p className="font-semibold text-sm">All {type.name} Features:</p>
                                      <ul className="space-y-0.5">
                                        {type.features.slice(3).map((feature, index) => (
                                          <li key={index} className="text-xs flex items-start">
                                            <div className="w-1 h-1 bg-primary rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                                            <span>{feature}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </li>
                            )}
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
            <UploadSection onFileUploaded={handleFileUploaded} />
          </div>
        )}

        {appState === 'upload' && selectedProjectType && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setSelectedProjectType(null)}
                className="text-primary hover:text-primary/80 flex items-center space-x-2 mb-4"
              >
                <span>← Back to project types</span>
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
                          {selectedType.name} Analysis
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
            <UploadSection onFileUploaded={handleFileUploaded} />
          </div>
        )}
        
        {appState === 'processing' && currentProject && (
          <ProcessingSection project={currentProject} />
        )}
        
        {appState === 'results' && currentProject && currentProject.analysisData && (
          <div className="space-y-8">
            {currentProject.analysisData && typeof currentProject.analysisData === 'object' && (
              <>
                <Dashboard analysisData={currentProject.analysisData} />
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
        </div>
      </Layout>
    </TooltipProvider>
  );
}
