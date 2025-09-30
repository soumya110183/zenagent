import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileText, X } from "lucide-react";
import type { Project, AnalysisData } from "@shared/schema";
import { pdfExportService } from "@/services/pdfExportService";
import { docExportService } from "@/services/docExportService";

interface ReportPreviewProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  analysisData: AnalysisData;
  sonarData?: any;
  swaggerData?: any;
  comprehensiveData?: any;
  structureData?: any;
}

export default function ReportPreview({
  open,
  onClose,
  project,
  analysisData,
  sonarData,
  swaggerData,
  comprehensiveData,
  structureData,
}: ReportPreviewProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingDOC, setIsExportingDOC] = useState(false);

  const aiInsights = analysisData.aiAnalysis;
  const projectDetails = aiInsights?.projectDetails;
  
  const controllers = analysisData.classes.filter(c => c.type === 'controller');
  const services = analysisData.classes.filter(c => c.type === 'service');
  const repositories = analysisData.classes.filter(c => c.type === 'repository');
  const entities = analysisData.classes.filter(c => c.type === 'entity');

  const annotations = analysisData.classes
    .flatMap((c: any) => c.annotations || [])
    .filter((a: string, i: number, arr: string[]) => arr.indexOf(a) === i);

  const handlePDFExport = async () => {
    setIsExportingPDF(true);
    try {
      await pdfExportService.exportProjectAnalysis({
        project,
        analysisData,
        sonarAnalysis: sonarData,
        swaggerData,
        comprehensiveData,
        structureData
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleDOCExport = async () => {
    setIsExportingDOC(true);
    try {
      await docExportService.exportProjectAnalysis({
        project,
        analysisData,
        sonarAnalysis: sonarData,
        swaggerData,
        comprehensiveData,
        structureData
      });
    } catch (error) {
      console.error('DOC export failed:', error);
      alert('DOC export failed. Please try again.');
    } finally {
      setIsExportingDOC(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Project Analysis Report</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDOCExport}
                disabled={isExportingDOC}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
                data-testid="button-save-docx"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isExportingDOC ? 'Saving...' : 'Save as DOCX'}
              </Button>
              <Button
                onClick={handlePDFExport}
                disabled={isExportingPDF}
                className="bg-red-600 hover:bg-red-700"
                size="sm"
                data-testid="button-save-pdf"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExportingPDF ? 'Saving...' : 'Save as PDF'}
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                data-testid="button-close-report"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="prose prose-sm dark:prose-invert max-w-none py-6">
            {/* Cover Section */}
            <div className="text-center mb-12 pb-12 border-b">
              <h1 className="text-4xl font-bold mb-4">{project.name}</h1>
              <p className="text-xl text-muted-foreground mb-2">Comprehensive Multi-Language Architecture Analysis</p>
              <p className="text-sm text-muted-foreground">
                Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Powered by Zengent AI - Enterprise Application Intelligence Platform
              </p>
            </div>

            {/* 1. Executive Summary */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Executive Summary</h2>
              <p className="mb-4">
                This document provides a comprehensive analysis of the <strong>{project.name}</strong> project. 
                The analysis includes architectural patterns, code structure, quality metrics, and visual diagrams 
                to facilitate understanding and decision-making.
              </p>

              <h3 className="text-xl font-semibold mb-3">Project Statistics</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Source Files</div>
                  <div className="text-2xl font-bold">{analysisData.structure?.sourceFiles?.length || 0}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Controllers</div>
                  <div className="text-2xl font-bold">{controllers.length}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Services</div>
                  <div className="text-2xl font-bold">{services.length}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Repositories</div>
                  <div className="text-2xl font-bold">{repositories.length}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Entities</div>
                  <div className="text-2xl font-bold">{entities.length}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Dependencies</div>
                  <div className="text-2xl font-bold">{analysisData.dependencies?.length || 0}</div>
                </div>
              </div>
            </section>

            {/* 2. Project Analysis Details */}
            {projectDetails && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">2. Project Analysis Details</h2>
                
                <h3 className="text-xl font-semibold mb-2">Project Description</h3>
                <p className="mb-4">{projectDetails.projectDescription}</p>
                
                <h3 className="text-xl font-semibold mb-2">Project Type</h3>
                <p className="mb-4">{projectDetails.projectType}</p>
                
                <h3 className="text-xl font-semibold mb-2">Implemented Features</h3>
                <ul className="list-disc pl-6 mb-4">
                  {projectDetails.implementedFeatures && projectDetails.implementedFeatures.length > 0 ? (
                    projectDetails.implementedFeatures.map((feature: string, idx: number) => (
                      <li key={idx}>{feature}</li>
                    ))
                  ) : (
                    <li>No features listed</li>
                  )}
                </ul>
                
                <h3 className="text-xl font-semibold mb-2">Modules or Services Covered</h3>
                <ul className="list-disc pl-6 mb-4">
                  {projectDetails.modulesServices && projectDetails.modulesServices.length > 0 ? (
                    projectDetails.modulesServices.map((module: string, idx: number) => (
                      <li key={idx}>{module}</li>
                    ))
                  ) : (
                    <li>No modules listed</li>
                  )}
                </ul>
              </section>
            )}

            {/* 3. Architecture Analysis */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Architecture Analysis</h2>
              
              <h3 className="text-xl font-semibold mb-2">Detected Patterns</h3>
              <div className="mb-4">
                {analysisData.patterns && analysisData.patterns.length > 0 ? (
                  analysisData.patterns.map((pattern: any, idx: number) => (
                    <div key={idx} className="mb-2">
                      <strong>{pattern.name}:</strong> {pattern.description} ({pattern.classes?.length || 0} classes)
                    </div>
                  ))
                ) : (
                  <p>No architectural patterns detected</p>
                )}
              </div>

              <h3 className="text-xl font-semibold mb-2">Annotations Found</h3>
              <div className="mb-4">
                {annotations.length > 0 ? (
                  <ul className="list-disc pl-6">
                    {annotations.map((annotation: string, idx: number) => (
                      <li key={idx}>{annotation}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No annotations found</p>
                )}
              </div>

              <h3 className="text-xl font-semibold mb-2">Components by Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Controllers</h4>
                  <ul className="list-disc pl-6 text-sm">
                    {controllers.slice(0, 10).map((ctrl: any, idx: number) => (
                      <li key={idx}>{ctrl.name}</li>
                    ))}
                    {controllers.length > 10 && <li>... and {controllers.length - 10} more</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Services</h4>
                  <ul className="list-disc pl-6 text-sm">
                    {services.slice(0, 10).map((svc: any, idx: number) => (
                      <li key={idx}>{svc.name}</li>
                    ))}
                    {services.length > 10 && <li>... and {services.length - 10} more</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Repositories</h4>
                  <ul className="list-disc pl-6 text-sm">
                    {repositories.slice(0, 10).map((repo: any, idx: number) => (
                      <li key={idx}>{repo.name}</li>
                    ))}
                    {repositories.length > 10 && <li>... and {repositories.length - 10} more</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Entities</h4>
                  <ul className="list-disc pl-6 text-sm">
                    {entities.slice(0, 10).map((entity: any, idx: number) => (
                      <li key={idx}>{entity.name}</li>
                    ))}
                    {entities.length > 10 && <li>... and {entities.length - 10} more</li>}
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. Project Structure */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Project Structure</h2>
              <p className="mb-4">Overview of the project directory organization:</p>
              {structureData && structureData.structure ? (
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <ProjectStructureTree item={structureData.structure} level={0} maxItems={50} />
                </div>
              ) : (
                <p>No structure data available</p>
              )}
            </section>

            {/* 5. Comprehensive Analysis */}
            {comprehensiveData && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">5. Comprehensive Analysis</h2>
                
                {comprehensiveData.projectOverview && (
                  <>
                    <h3 className="text-xl font-semibold mb-2">Project Overview</h3>
                    <p className="mb-2"><strong>File Count:</strong> {comprehensiveData.projectOverview.fileCount || 'N/A'}</p>
                    <p className="mb-4"><strong>Description:</strong> {comprehensiveData.projectOverview.description || 'No description available'}</p>
                  </>
                )}

                {comprehensiveData.modules && comprehensiveData.modules.length > 0 && (
                  <>
                    <h3 className="text-xl font-semibold mb-2">Identified Modules</h3>
                    <ul className="list-disc pl-6 mb-4">
                      {comprehensiveData.modules.map((module: any, idx: number) => (
                        <li key={idx}>
                          <strong>{module.name}:</strong> {module.description || 'No description'}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            )}

            {/* 6. Code Quality Analysis */}
            {sonarData && sonarData.issues && sonarData.issues.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">6. Code Quality Analysis</h2>
                <p className="mb-4">
                  This section contains automated code quality metrics and issue detection results 
                  from static code analysis.
                </p>
                
                <h3 className="text-xl font-semibold mb-2">Identified Issues</h3>
                <div className="space-y-2">
                  {sonarData.issues.slice(0, 20).map((issue: any, idx: number) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg text-sm">
                      <span className="font-bold">[{issue.severity}]</span> {issue.message} - {issue.component}
                    </div>
                  ))}
                  {sonarData.issues.length > 20 && (
                    <p className="text-sm text-muted-foreground">... and {sonarData.issues.length - 20} more issues</p>
                  )}
                </div>
              </section>
            )}

            {/* 7. API Documentation */}
            {swaggerData && swaggerData.paths && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">7. API Documentation</h2>
                
                <h3 className="text-xl font-semibold mb-2">API Endpoints</h3>
                <div className="space-y-4">
                  {Object.entries(swaggerData.paths).slice(0, 20).map(([path, methods]: [string, any], idx: number) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg">
                      <div className="font-bold mb-2">{path}</div>
                      {Object.entries(methods).map(([method, details]: [string, any], midx: number) => (
                        <div key={midx} className="ml-4 text-sm">
                          <span className="font-semibold uppercase">{method}:</span> {details.summary || 'No description'}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function ProjectStructureTree({ item, level, maxItems, currentCount = { count: 0 } }: { 
  item: any; 
  level: number; 
  maxItems: number;
  currentCount?: { count: number };
}) {
  if (currentCount.count >= maxItems) {
    return null;
  }

  const indent = '\u00A0\u00A0'.repeat(level);
  const icon = item.type === 'directory' ? '📁' : '📄';
  const suffix = item.type === 'directory' ? '/' : '';

  currentCount.count++;

  return (
    <>
      <div>{indent}{icon} {item.name}{suffix}</div>
      {item.children && item.children.length > 0 && currentCount.count < maxItems && (
        <>
          {item.children.map((child: any, idx: number) => (
            <ProjectStructureTree 
              key={idx} 
              item={child} 
              level={level + 1} 
              maxItems={maxItems}
              currentCount={currentCount}
            />
          ))}
        </>
      )}
    </>
  );
}
