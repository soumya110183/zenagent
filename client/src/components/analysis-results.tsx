import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Project, type AnalysisData } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DiagramCanvasX6 from "@/components/diagram-canvas-x6";
import MermaidClassDiagram from "@/components/mermaid-class-diagram";
import MermaidFlowDiagram from "@/components/mermaid-flow-diagram";
import MermaidSequenceDiagram from "@/components/mermaid-sequence-diagram";
import DemographicScanTab from "@/components/demographic-scan-tab";
import ComprehensiveAnalysis from "@/components/comprehensive-analysis";
import ReportPreview from "@/components/report-preview";
import APIDocumentation from "@/pages/api-documentation";
import { 
  FolderOpen, 
  Download, 
  Share2, 
  Settings,
  Podcast,
  Boxes,
  ListOrdered,
  Network,
  Database,
  Search,
  Code,
  FolderTree,
  Tags,
  FileCode,
  Image,
  FileText,
  Shield,
  Leaf,
  Cog,
  GitBranch,
  Activity,
  BookOpen
} from "lucide-react";
import type { DiagramType } from "@/types/analysis";

interface AnalysisResultsProps {
  project: Project;
  onNewAnalysis: () => void;
}

export default function AnalysisResults({ project, onNewAnalysis }: AnalysisResultsProps) {
  const [activeDiagram, setActiveDiagram] = useState<DiagramType>('flow');
  const [showReportPreview, setShowReportPreview] = useState(false);
  const analysisData = project.analysisData as AnalysisData | null;

  // Fetch comprehensive analysis data
  const { data: sonarData } = useQuery({
    queryKey: ['/api/projects', project.id, 'sonar'],
    enabled: !!project.id,
  });

  const { data: swaggerData } = useQuery({
    queryKey: ['/api/projects', project.id, 'swagger'],
    enabled: !!project.id,
  });

  const { data: structureData } = useQuery({
    queryKey: ['/api/projects', project.id, 'structure'],
    enabled: !!project.id,
  });

  const { data: comprehensiveData } = useQuery({
    queryKey: ['/api/projects', project.id, 'comprehensive'],
    enabled: !!project.id,
  });

  if (!analysisData) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No analysis data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const controllers = analysisData.classes.filter(c => c.type === 'controller');
  const services = analysisData.classes.filter(c => c.type === 'service');
  const repositories = analysisData.classes.filter(c => c.type === 'repository');
  const entities = analysisData.classes.filter(c => c.type === 'entity');

  // Extract AI insights if available
  const aiInsights = analysisData.aiAnalysis;
  const projectDetails = aiInsights?.projectDetails;

  return (
    <div>
      {/* Project Summary */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FolderOpen className="text-primary text-xl w-6 h-6" />
              <div>
                <h2 className="text-xl font-medium">{project.name}</h2>
                <p className="text-muted-foreground text-sm">
                  Analyzed {analysisData.structure.sourceFiles.length} Java files • 
                  Found {controllers.length} controllers, {services.length} services, {repositories.length} repositories
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setShowReportPreview(true)}
                className="bg-primary hover:bg-primary/90 text-white"
                data-testid="button-view-report"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Report
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{controllers.length}</div>
              <div className="text-sm text-muted-foreground">Controllers</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-accent">{services.length}</div>
              <div className="text-sm text-muted-foreground">Services</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{repositories.length}</div>
              <div className="text-sm text-muted-foreground">Repositories</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{entities.length}</div>
              <div className="text-sm text-muted-foreground">JPA Entities</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details Section */}
      {projectDetails && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Project Description</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{projectDetails.projectDescription}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold">Business Problem Addressed</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{projectDetails.businessProblem}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Key Objective</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{projectDetails.keyObjective}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Cog className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Summary of Functionality</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{projectDetails.functionalitySummary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Tags className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold">List of Implemented Features</h3>
              </div>
              <div className="space-y-2">
                {projectDetails.implementedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-600 rounded-full" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Boxes className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold">Modules or Services Covered</h3>
              </div>
              <div className="space-y-2">
                {projectDetails.modulesServices.map((module, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                    <span className="text-sm text-muted-foreground">{module}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Diagram Section */}
      <Card className="mb-6">
        <div className="border-b border-border p-4">
          <div className="flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Architecture Diagrams</h3>
          </div>
        </div>

        <Tabs defaultValue="flow" className="w-full">
          <div className="border-b border-border bg-muted px-4">
            <TabsList className="bg-transparent">
              <TabsTrigger value="flow" className="data-[state=active]:bg-background">
                <GitBranch className="w-4 h-4 mr-2" />
                Flow Diagram
              </TabsTrigger>
              <TabsTrigger value="component" className="data-[state=active]:bg-background">
                <Boxes className="w-4 h-4 mr-2" />
                Component Diagram
              </TabsTrigger>
              <TabsTrigger value="sequence" className="data-[state=active]:bg-background">
                <Activity className="w-4 h-4 mr-2" />
                Sequence Diagram
              </TabsTrigger>
              <TabsTrigger value="class" className="data-[state=active]:bg-background">
                <FileCode className="w-4 h-4 mr-2" />
                Class Diagram
              </TabsTrigger>
              <TabsTrigger value="demographic" className="data-[state=active]:bg-background">
                <Database className="w-4 h-4 mr-2" />
                Demographic Scan
              </TabsTrigger>
              <TabsTrigger value="api-docs" className="data-[state=active]:bg-background">
                <BookOpen className="w-4 h-4 mr-2" />
                API Documentation
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="flow">
            <div className="p-4 border-b border-border bg-muted">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Flow Diagram (Flowchart) - Shows application request flow and data processing
                </div>
              </div>
            </div>

            <MermaidFlowDiagram analysisData={analysisData} />
          </TabsContent>

          <TabsContent value="component">
            {/* Diagram Controls */}
            <div className="p-4 border-b border-border bg-muted">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </Button>
                    <div className="text-sm text-muted-foreground px-2">
                      Zoom: 100%
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const event = new CustomEvent('exportDiagram', { detail: { format: 'png' } });
                      window.dispatchEvent(event);
                    }}
                  >
                    <Download className="mr-1 w-4 h-4" />
                    Export PNG
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const event = new CustomEvent('exportDiagram', { detail: { format: 'svg' } });
                      window.dispatchEvent(event);
                    }}
                  >
                    <Code className="mr-1 w-4 h-4" />
                    Export SVG
                  </Button>
                </div>
              </div>
            </div>

            <DiagramCanvasX6 
              type="component" 
              analysisData={analysisData} 
            />
          </TabsContent>

          <TabsContent value="sequence">
            <div className="p-4 border-b border-border bg-muted">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Sequence Diagram - Shows interaction flow between components over time
                </div>
              </div>
            </div>

            <MermaidSequenceDiagram analysisData={analysisData} />
          </TabsContent>

          <TabsContent value="class">
            <div className="p-4 border-b border-border bg-muted">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  UML Class Diagram generated with Mermaid.js - Professional UML notation
                </div>
              </div>
            </div>

            <MermaidClassDiagram analysisData={analysisData} />
          </TabsContent>

          <TabsContent value="demographic">
            <DemographicScanTab projectId={project.id} />
          </TabsContent>

          <TabsContent value="api-docs">
            <div className="p-6">
              <APIDocumentation projectId={project.id} />
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Analysis Details */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Detected Patterns Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium flex items-center mb-4">
                <Search className="text-primary mr-2 w-5 h-5" />
                Detected Patterns
              </h3>
              <div className="space-y-4">
                {analysisData.patterns.map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      {pattern.name.includes('Spring') && <Shield className="text-primary w-5 h-5" />}
                      {pattern.name.includes('JPA') && <Database className="text-purple-600 w-5 h-5" />}
                      {pattern.name.includes('Dependency') && <Leaf className="text-accent w-5 h-5" />}
                      <div>
                        <div className="font-medium text-sm">{pattern.name}</div>
                        <div className="text-xs text-muted-foreground">{pattern.description}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">{pattern.classes.length} classes</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Method Analysis Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium flex items-center mb-4">
                <Code className="text-primary mr-2 w-5 h-5" />
                Method Call Analysis
              </h3>
              <div className="space-y-3">
                {analysisData.relationships
                  .filter(rel => rel.type === 'calls' && rel.method)
                  .slice(0, 5)
                  .map((rel, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="font-mono text-sm">
                        {rel.from} → {rel.to}.{rel.method}()
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {rel.type}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Project Structure */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium flex items-center text-sm mb-4">
                <FolderTree className="text-primary mr-2 w-4 h-4" />
                Project Structure
              </h3>
              <div className="space-y-2 text-sm">
                {analysisData.structure.packages.slice(0, 6).map((pkg, index) => (
                  <div key={index} className="flex items-center text-muted-foreground">
                    <svg className="mr-2 w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    <span className="truncate">{pkg}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Annotations Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium flex items-center text-sm mb-4">
                <Tags className="text-primary mr-2 w-4 h-4" />
                Annotations Found
              </h3>
              <div className="space-y-3">
                {Object.entries(
                  analysisData.classes.reduce((acc, cls) => {
                    cls.annotations.forEach(annotation => {
                      acc[annotation] = (acc[annotation] || 0) + 1;
                    });
                    return acc;
                  }, {} as Record<string, number>)
                ).slice(0, 5).map(([annotation, count]) => (
                  <div key={annotation} className="flex items-center justify-between">
                    <span className="text-sm font-mono text-primary">{annotation}</span>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium flex items-center text-sm mb-4">
                <Download className="text-primary mr-2 w-4 h-4" />
                Export Options
              </h3>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                  <FileCode className="text-blue-500 mr-2 w-4 h-4" />
                  Export as JSON
                </Button>
                <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                  <Image className="text-green-500 mr-2 w-4 h-4" />
                  Export All Diagrams
                </Button>
                <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                  <FileText className="text-red-500 mr-2 w-4 h-4" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comprehensive Analysis Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <FileText className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold">Comprehensive Project Analysis</h3>
          </div>
          <ComprehensiveAnalysis project={project} />
        </CardContent>
      </Card>

      {/* Report Preview Dialog */}
      <ReportPreview
        open={showReportPreview}
        onClose={() => setShowReportPreview(false)}
        project={project}
        analysisData={analysisData}
        sonarData={sonarData}
        swaggerData={swaggerData}
        comprehensiveData={comprehensiveData}
        structureData={structureData}
      />
    </div>
  );
}
