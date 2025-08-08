import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Project } from "@shared/schema";
import UploadSection from "@/components/upload-section";
import ProcessingSection from "@/components/processing-section";
import AnalysisResults from "@/components/analysis-results";
import Dashboard from "@/components/dashboard";
import { GitBranch, HelpCircle, Settings } from "lucide-react";

type AppState = 'upload' | 'processing' | 'results';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

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

  return (
    <div className="bg-background font-sans text-foreground min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GitBranch className="text-2xl" />
              <div>
                <h1 className="text-xl font-medium">Zengent</h1>
                <p className="text-blue-200 text-sm">Java Project Architecture Analyzer</p>
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

      <div className="container mx-auto px-6 py-8">
        {appState === 'upload' && (
          <UploadSection onFileUploaded={handleFileUploaded} />
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
