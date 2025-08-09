import { useState } from "react";
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
import { SiPython, SiApachespark } from "react-icons/si";
import zensarLogo from "@assets/zenlogo_1754679408998.png";
import topBanner from "@assets/top banner_1754681525606.png";
import javaLogo from "@assets/226777_1754703124416.png";
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
      await apiRequest('/api/ai-config', {
        method: 'POST',
        body: JSON.stringify(config),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setAiConfig(config);
      setShowAIConfig(false);
    } catch (error) {
      console.error('Failed to configure AI model:', error);
    }
  };

  const projectTypes = [
    {
      id: 'java' as ProjectType,
      name: 'Java Code',
      description: 'Comprehensive analysis of Java applications including Spring Boot frameworks, Maven/Gradle builds, and enterprise patterns',
      logoSrc: javaLogo,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      borderColor: 'border-orange-200',
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
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      borderColor: 'border-yellow-200',
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
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      borderColor: 'border-blue-200',
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
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      borderColor: 'border-green-200',
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

  return (
    <div className="bg-background font-sans text-foreground min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Zensar Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src={zensarLogo} 
                alt="Zensar Logo" 
                className="h-8 w-auto"
              />
            </div>
            
            {/* Center - Zengent AI Text */}
            <div className="flex-1 text-center">
              <h2 className="text-lg font-medium">Zengent AI - Enterprise Application Intelligence Platform</h2>
              <p className="text-blue-200 text-sm">Comprehensive enterprise application analysis and intelligence platform</p>
            </div>
            
            {/* Right side - AI Settings */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIConfig(true)}
                className="text-blue-900 bg-white border-white hover:bg-gray-100 hover:text-primary font-medium"
              >
                <Settings className="w-4 h-4 mr-2" />
                AI Settings
              </Button>
              <button className="text-blue-200 hover:text-white transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="text-blue-200 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* AI Agent Introduction - Moved above banner */}
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Zengent AI Agent
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Amex Diamond Project Discovery's intelligent assistant — uncover patterns, map dependencies, gain insights
          </p>
        </div>
      </div>

      {/* Zensar Banner */}
      <div className="flex justify-center py-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-[60%] h-[60vw] max-h-96">
          <img 
            src={topBanner} 
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
                    className={`relative group cursor-pointer bg-white dark:bg-gray-800 rounded-xl border-2 ${type.borderColor} hover:border-opacity-60 shadow-lg hover:shadow-xl transition-all duration-300 p-6`}
                  >
                    <div>
                      {/* First line - Logo and Heading name */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`inline-flex items-center justify-center bg-white rounded-lg p-2 ${type.id === 'pyspark' ? 'w-20 h-12' : 'w-12 h-12'}`}>
                          <img 
                            src={type.logoSrc} 
                            alt={`${type.name} logo`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                          {type.name}
                        </h3>
                      </div>
                      
                      {/* Second line - Description text */}
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                          {type.description}
                        </p>
                        <ul className="space-y-1">
                          {type.features.map((feature, index) => (
                            <li key={index} className="text-xs text-gray-500 dark:text-gray-400 flex items-start">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Ready to analyze your code?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Select a project type above to get started with intelligent code analysis
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Upload className="w-4 h-4" />
                    <span>Upload ZIP files</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
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
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-2 mb-4"
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedType.name} Analysis
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
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
          className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
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
  );
}
