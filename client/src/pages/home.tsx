import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Project } from "@shared/schema";
import UploadSection from "@/components/upload-section";
import ProcessingSection from "@/components/processing-section";
import AnalysisResults from "@/components/analysis-results";
import Dashboard from "@/components/dashboard";
import { GitBranch, HelpCircle, Settings, Upload, Github, Code2, Database, Cpu, FileCode } from "lucide-react";
import zensarLogo from "@assets/zenlogo_1754679408998.png";
import topBanner from "@assets/top banner_1754681525606.png";

type AppState = 'upload' | 'processing' | 'results';
type ProjectType = 'java' | 'pyspark' | 'mainframe' | 'python';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType | null>(null);

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

  const projectTypes = [
    {
      id: 'java' as ProjectType,
      name: 'Java Code',
      description: 'Analyze Spring Boot, Maven, and Gradle projects',
      icon: FileCode,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      borderColor: 'border-orange-200',
      features: ['Spring Boot Analysis', 'JPA Entity Mapping', 'MVC Pattern Detection']
    },
    {
      id: 'pyspark' as ProjectType,
      name: 'PySpark',
      description: 'Big data processing and analytics workflows',
      icon: Database,
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      borderColor: 'border-yellow-200',
      features: ['DataFrame Analysis', 'Job Flow Visualization', 'Performance Metrics']
    },
    {
      id: 'mainframe' as ProjectType,
      name: 'Mainframe',
      description: 'Legacy COBOL and JCL analysis',
      icon: Cpu,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      borderColor: 'border-blue-200',
      features: ['COBOL Program Flow', 'JCL Job Dependencies', 'Database Connections']
    },
    {
      id: 'python' as ProjectType,
      name: 'Python',
      description: 'Django, Flask, and general Python applications',
      icon: Code2,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      borderColor: 'border-green-200',
      features: ['Framework Detection', 'Module Dependencies', 'API Endpoint Mapping']
    }
  ];

  return (
    <div className="bg-background font-sans text-foreground min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GitBranch className="text-xl" />
              <div>
                <h2 className="text-lg font-medium">Multi-Language Architecture Analyzer - Zengent AI</h2>
                <p className="text-blue-200 text-sm">Intelligent code analysis for enterprise applications</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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

      {/* Zensar Banner */}
      <div className="flex justify-center py-4 bg-gray-50 dark:bg-gray-900">
        <div className="relative w-[70%] h-[70vw] max-h-96">
          <img 
            src={topBanner} 
            alt="Zengent AI Agents" 
            className="w-full h-full object-contain rounded-lg"
          />
          <div className="absolute top-2 left-6 flex items-center space-x-3">
            <img 
              src={zensarLogo} 
              alt="Zensar Logo" 
              className="h-8 w-auto"
            />
            <div className="text-white">
              <h1 className="text-lg font-semibold">Zengent AI</h1>
              <p className="text-xs opacity-90">Multi-Language Code Analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {appState === 'upload' && !selectedProjectType && (
          <div className="max-w-6xl mx-auto">
            {/* AI Agent Introduction */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
                <Code2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Zengent AI Agent
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                I'm your intelligent code analysis assistant. Choose your project type below and I'll help you analyze architecture patterns, dependencies, and provide actionable insights.
              </p>
            </div>

            {/* Project Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {projectTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedProjectType(type.id)}
                    className={`relative group cursor-pointer bg-white dark:bg-gray-800 rounded-xl border-2 ${type.borderColor} hover:border-opacity-60 shadow-lg hover:shadow-xl transition-all duration-300 p-6`}
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 ${type.color} ${type.hoverColor} rounded-lg mb-4 transition-colors`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {type.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      {type.description}
                    </p>
                    <ul className="space-y-1">
                      {type.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
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
                  const IconComponent = selectedType.icon;
                  return (
                    <>
                      <div className={`inline-flex items-center justify-center w-12 h-12 ${selectedType.color} rounded-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
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
    </div>
  );
}
