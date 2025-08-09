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
import { GitBranch, HelpCircle, Settings, Upload, Github, Code2, Database, Cpu, FileCode } from "lucide-react";
import Layout from "@/components/layout";
import { SiPython, SiApachespark } from "react-icons/si";
import zensarLogo from "@assets/Zensar_composite_logo_whit_ai_1754732936523.png";
import zenagentBanner from "@assets/zenagent_1754759778955.png";
import agentLogo from "@assets/agent_1754754612491.png";
import pythonLogo from "@assets/pyth_1754703124415.png";
import pysparkLogo from "@assets/pyspark-lang_1754703714412.png";
import ibmLogo from "@assets/ibm_1754703124415.png";

type AppState = 'upload' | 'processing' | 'results';
type ProjectType = 'java' | 'pyspark' | 'mainframe' | 'python';

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

  const projectTypes = [
    {
      id: 'java' as ProjectType,
      name: 'Java',
      description: 'Comprehensive analysis of Java applications including Spring Boot frameworks, Maven/Gradle builds, and enterprise patterns',
      logoSrc: agentLogo,
      borderColor: 'border-primary', // Myrtle Green
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
      borderColor: 'border-warning', // Peach Crayola
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
      borderColor: 'border-secondary', // Wintergreen Dream
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
      description: 'Full-stack Python application analysis covering Django/Flask frameworks, API architectures, and dependency management',
      logoSrc: pythonLogo,
      borderColor: 'border-destructive', // Red Pigment
      bgColor: 'bg-destructive/5',
      hoverBgColor: 'hover:bg-destructive/10',
      features: [
        'Django/Flask framework pattern detection',
        'Python package and module dependencies',
        'REST/GraphQL API endpoint mapping',
        'Database ORM relationship analysis',
        'Virtual environment and requirements review',
        'Code quality and security assessment'
      ]
    }
  ];

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
    <Layout aiConfigButton={aiConfigButton}>
      <div className="bg-background font-sans text-foreground min-h-screen">

      {/* Main Heading */}
      <div className="bg-gradient-to-b from-background to-muted py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Ready to Explore our Agents
          </h1>
        </div>
      </div>

      {/* Zenagent Banner */}
      <div className="flex justify-center py-4 bg-muted">
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

            {/* Project Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {projectTypes.map((type) => {
                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedProjectType(type.id)}
                    className={`relative group cursor-pointer bg-card rounded-xl border-2 ${type.borderColor} ${type.hoverBgColor} shadow-lg hover:shadow-xl transition-all duration-300 p-6`}
                  >
                    <div>
                      {/* First line - Logo and Heading name */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`inline-flex items-center justify-center bg-background rounded-lg p-2 ${type.id === 'pyspark' ? 'w-20 h-12' : 'w-12 h-12'}`}>
                          <img 
                            src={type.logoSrc} 
                            alt={`${type.name} logo`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground leading-tight">
                          {type.name}
                        </h3>
                      </div>
                      
                      {/* Second line - Description text */}
                      <div>
                        <p className="text-muted-foreground text-sm mb-3">
                          {type.description}
                        </p>
                        <div className={`${type.bgColor} rounded-lg p-3 mt-3`}>
                          <ul className="space-y-1">
                            {type.features.map((feature, index) => (
                              <li key={index} className="text-xs text-foreground/80 flex items-start">
                                <div className="w-1 h-1 bg-primary rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-muted to-muted/50 rounded-xl p-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Ready to analyze your code?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Select a project type above to get started with intelligent code analysis
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Upload className="w-4 h-4" />
                    <span>Upload ZIP files</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Github className="w-4 h-4" />
                    <span>Analyze GitHub repos</span>
                  </div>
                </div>
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
            <Dashboard analysisData={currentProject.analysisData} />
            <AnalysisResults 
              project={currentProject} 
              onNewAnalysis={handleNewAnalysis}
            />
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
  );
}
