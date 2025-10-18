import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileText, X, Code } from "lucide-react";
import type { Project, AnalysisData } from "@shared/schema";
import { htmlExportService } from "@/services/htmlExportService";
import { generateAllDiagramImages, type DiagramImages } from "@/services/diagramExportService";

interface ReportPreviewProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  analysisData: AnalysisData;
  swaggerData?: any;
  comprehensiveData?: any;
  structureData?: any;
}

export default function ReportPreview({
  open,
  onClose,
  project,
  analysisData,
  swaggerData,
  comprehensiveData,
  structureData,
}: ReportPreviewProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingDOC, setIsExportingDOC] = useState(false);
  const [isExportingHTML, setIsExportingHTML] = useState(false);
  const [diagramImages, setDiagramImages] = useState<DiagramImages>({
    flow: null,
    component: null,
    sequence: null,
    class: null
  });
  const [demographicData, setDemographicData] = useState<any>(null);

  const aiInsights = analysisData.aiAnalysis;
  const projectDetails = aiInsights?.projectDetails;
  
  const controllers = analysisData.classes.filter(c => c.type === 'controller');
  const services = analysisData.classes.filter(c => c.type === 'service');
  const repositories = analysisData.classes.filter(c => c.type === 'repository');
  const entities = analysisData.classes.filter(c => c.type === 'entity');

  const annotations = analysisData.classes
    .flatMap((c: any) => c.annotations || [])
    .filter((a: string, i: number, arr: string[]) => arr.indexOf(a) === i);

  // Capture diagrams and fetch demographic data when modal opens
  useEffect(() => {
    if (open) {
      captureDiagrams();
      fetchDemographicData();
    }
  }, [open]);

  const captureDiagrams = async () => {
    try {
      // Generate all diagram images using the diagram export service
      const images = await generateAllDiagramImages(analysisData);
      setDiagramImages(images);
    } catch (error) {
      console.error('Error capturing diagrams:', error);
    }
  };

  const fetchDemographicData = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/demographics`);
      if (response.ok) {
        const data = await response.json();
        setDemographicData(data);
      }
    } catch (error) {
      console.error('Error fetching demographic data:', error);
    }
  };

  const handlePDFExport = async () => {
    setIsExportingPDF(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      const filename = `${project.name.replace(/\s+/g, '-')}-Analysis-${timestamp}.pdf`;
      await htmlExportService.exportToPDF('report-content', filename);
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
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      const filename = `${project.name.replace(/\s+/g, '-')}-Analysis-${timestamp}.docx`;
      await htmlExportService.exportToDOCX('report-content', filename);
    } catch (error) {
      console.error('DOC export failed:', error);
      alert('DOC export failed. Please try again.');
    } finally {
      setIsExportingDOC(false);
    }
  };

  const handleHTMLExport = async () => {
    setIsExportingHTML(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      const filename = `${project.name.replace(/\s+/g, '-')}-Analysis-${timestamp}.html`;
      await htmlExportService.exportToHTML('report-content', filename);
    } catch (error) {
      console.error('HTML export failed:', error);
      alert('HTML export failed. Please try again.');
    } finally {
      setIsExportingHTML(false);
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
                onClick={handleHTMLExport}
                disabled={isExportingHTML}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
                data-testid="button-save-html"
              >
                <Code className="w-4 h-4 mr-2" />
                {isExportingHTML ? 'Saving...' : 'Save as HTML'}
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
          <div id="report-content" className="prose prose-sm dark:prose-invert max-w-none py-6">
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

            {/* 1. Project Description */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Project Description</h2>
              {projectDetails?.projectDescription ? (
                <p className="mb-4">{projectDetails.projectDescription}</p>
              ) : (
                <p className="mb-4 text-muted-foreground">
                  The {project.name} project is a {project.projectType || 'multi-language'} application analyzed for architectural 
                  patterns, dependencies, and code structure. This analysis provides comprehensive insights into the codebase.
                </p>
              )}
            </section>

            {/* 2. Business Problem Addressed */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Business Problem Addressed</h2>
              {projectDetails?.businessProblem ? (
                <p className="mb-4">{projectDetails.businessProblem}</p>
              ) : (
                <p className="mb-4 text-muted-foreground">
                  This project addresses enterprise application development needs with a focus on scalability, 
                  maintainability, and robust architecture patterns.
                </p>
              )}
            </section>

            {/* 3. Key Objective */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Key Objective</h2>
              {projectDetails?.keyObjective ? (
                <p className="mb-4">{projectDetails.keyObjective}</p>
              ) : (
                <p className="mb-4 text-muted-foreground">
                  The key objective is to provide a well-structured, maintainable solution that follows industry best practices 
                  and design patterns for enterprise application development.
                </p>
              )}
            </section>

            {/* 4. Summary of Functionality */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Summary of Functionality</h2>
              {projectDetails?.functionalitySummary ? (
                <p className="mb-4">{projectDetails.functionalitySummary}</p>
              ) : (
                <p className="mb-4 text-muted-foreground">
                  The application provides core business functionality through a layered architecture with 
                  {controllers.length > 0 && ` ${controllers.length} controllers,`}
                  {services.length > 0 && ` ${services.length} services,`}
                  {repositories.length > 0 && ` ${repositories.length} data repositories,`}
                  {entities.length > 0 && ` and ${entities.length} data entities`}.
                </p>
              )}
            </section>

            {/* 5. Initial Features */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Initial Features</h2>
              {projectDetails?.initialFeatures && projectDetails.initialFeatures.length > 0 ? (
                <ul className="list-disc pl-6 mb-4">
                  {projectDetails.initialFeatures.map((feature: string, idx: number) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              ) : (
                <p className="mb-4 text-muted-foreground">
                  Initial features are derived from the implemented patterns and components identified in the codebase.
                </p>
              )}
            </section>

            {/* 6. List of Implemented Features */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. List of Implemented Features</h2>
              {projectDetails?.implementedFeatures && projectDetails.implementedFeatures.length > 0 ? (
                <ul className="list-disc pl-6 mb-4">
                  {projectDetails.implementedFeatures.map((feature: string, idx: number) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              ) : (
                <ul className="list-disc pl-6 mb-4">
                  {analysisData.patterns?.map((pattern: any, idx: number) => (
                    <li key={idx}>{pattern.name} - {pattern.description}</li>
                  ))}
                  {(!analysisData.patterns || analysisData.patterns.length === 0) && (
                    <li className="text-muted-foreground">Features extracted from code analysis</li>
                  )}
                </ul>
              )}
            </section>

            {/* 7. Modules or Services Covered */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Modules or Services Covered</h2>
              {projectDetails?.modulesServices && projectDetails.modulesServices.length > 0 ? (
                <ul className="list-disc pl-6 mb-4">
                  {projectDetails.modulesServices.map((module: string, idx: number) => (
                    <li key={idx}>{module}</li>
                  ))}
                </ul>
              ) : (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Controllers ({controllers.length})</h4>
                  <ul className="list-disc pl-6 text-sm mb-3">
                    {controllers.slice(0, 10).map((ctrl: any, idx: number) => (
                      <li key={idx}>{ctrl.name}</li>
                    ))}
                    {controllers.length > 10 && <li>... and {controllers.length - 10} more</li>}
                  </ul>
                  
                  <h4 className="font-semibold mb-2">Services ({services.length})</h4>
                  <ul className="list-disc pl-6 text-sm">
                    {services.slice(0, 10).map((svc: any, idx: number) => (
                      <li key={idx}>{svc.name}</li>
                    ))}
                    {services.length > 10 && <li>... and {services.length - 10} more</li>}
                  </ul>
                </div>
              )}
            </section>

            {/* 8. Key Business Logic Highlights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Key Business Logic Highlights</h2>
              <div className="mb-4">
                {comprehensiveData?.modules && comprehensiveData.modules.length > 0 ? (
                  <ul className="list-disc pl-6">
                    {comprehensiveData.modules.map((module: any, idx: number) => (
                      <li key={idx}>
                        <strong>{module.name}:</strong> {module.businessLogic || module.description || 'Core business logic implementation'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <>
                    <p className="mb-2">The application implements the following key business logic patterns:</p>
                    <ul className="list-disc pl-6">
                      {analysisData.patterns?.map((pattern: any, idx: number) => (
                        <li key={idx}>
                          <strong>{pattern.name}:</strong> {pattern.description}
                        </li>
                      ))}
                      {(!analysisData.patterns || analysisData.patterns.length === 0) && (
                        <li className="text-muted-foreground">Business logic patterns identified from code structure</li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            </section>

            {/* 9. Architecture & Diagrams */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Architecture &amp; Diagrams</h2>
              
              <h3 className="text-xl font-semibold mb-3">9.1 Flow Diagram (Flowchart)</h3>
              <p className="mb-4 text-muted-foreground">
                The flow diagram illustrates the data and control flow through the application layers, showing how requests flow from controllers through services to repositories.
              </p>
              {diagramImages.flow ? (
                <div className="mb-6 border rounded-lg overflow-hidden bg-white p-4">
                  <img src={diagramImages.flow} alt="Flow Diagram" className="w-full" />
                </div>
              ) : (
                <p className="mb-6 text-muted-foreground">Capturing flow diagram...</p>
              )}
              
              <h3 className="text-xl font-semibold mb-3 mt-8">9.2 Component Diagram</h3>
              <p className="mb-4 text-muted-foreground">
                The component diagram shows the high-level architecture and relationships between system components, organized by architectural layers.
              </p>
              {diagramImages.component ? (
                <div className="mb-6 border rounded-lg overflow-hidden bg-white p-4">
                  <img src={diagramImages.component} alt="Component Diagram" className="w-full" />
                </div>
              ) : (
                <p className="mb-6 text-muted-foreground">Capturing component diagram...</p>
              )}

              <h3 className="text-xl font-semibold mb-3 mt-8">9.3 Sequence Diagram</h3>
              <p className="mb-4 text-muted-foreground">
                The sequence diagram shows the interaction flow between components over time, demonstrating how different parts of the system communicate.
              </p>
              {diagramImages.sequence ? (
                <div className="mb-6 border rounded-lg overflow-hidden bg-white p-4">
                  <img src={diagramImages.sequence} alt="Sequence Diagram" className="w-full" />
                </div>
              ) : (
                <p className="mb-6 text-muted-foreground">Capturing sequence diagram...</p>
              )}

              <h3 className="text-xl font-semibold mb-3 mt-8">9.4 UML Class Diagram</h3>
              <p className="mb-4 text-muted-foreground">
                The UML class diagram represents the static structure of the application, showing classes, their attributes, methods, and relationships.
              </p>
              {diagramImages.class ? (
                <div className="mb-6 border rounded-lg overflow-hidden bg-white p-4">
                  <img src={diagramImages.class} alt="UML Class Diagram" className="w-full" />
                </div>
              ) : (
                <p className="mb-6 text-muted-foreground">Capturing class diagram...</p>
              )}

            </section>

            {/* 10. API Documentation */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. API Documentation</h2>
              
              <h3 className="text-xl font-semibold mb-3">API Endpoints</h3>
              {comprehensiveData?.requestMappings && comprehensiveData.requestMappings.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {comprehensiveData.requestMappings.slice(0, 15).map((mapping: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-l-blue-500 pl-4 mb-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold text-sm">
                          {mapping.httpMethod}
                        </span>
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {mapping.endpoint}
                        </code>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Description: </span>
                          <span className="text-muted-foreground">{mapping.description}</span>
                        </div>
                        
                        <div>
                          <span className="font-medium">Controller: </span>
                          <code className="text-xs bg-muted px-1 rounded">{mapping.controllerClass}.{mapping.controllerMethod}()</code>
                        </div>
                        
                        {mapping.serviceCalled && (
                          <div>
                            <span className="font-medium">Service Called: </span>
                            <code className="text-xs bg-muted px-1 rounded">{mapping.serviceCalled}</code>
                          </div>
                        )}
                        
                        {mapping.returnType && (
                          <div>
                            <span className="font-medium">Return Type: </span>
                            <code className="text-xs bg-muted px-1 rounded">{mapping.returnType}</code>
                          </div>
                        )}
                        
                        {mapping.parameters && mapping.parameters.length > 0 && (
                          <div>
                            <span className="font-medium">Parameters:</span>
                            <table className="w-full mt-2 border-collapse border border-gray-300">
                              <thead>
                                <tr className="bg-muted">
                                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Name</th>
                                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Type</th>
                                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {mapping.parameters.map((param: any, pidx: number) => (
                                  <tr key={pidx}>
                                    <td className="border border-gray-300 px-3 py-2 text-xs">
                                      <code>{param.name}</code>
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-xs">
                                      <code className="text-blue-600">{param.type}</code>
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-xs text-muted-foreground">
                                      {param.description || 'No description'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {comprehensiveData.requestMappings.length > 15 && (
                    <p className="text-sm text-muted-foreground">... and {comprehensiveData.requestMappings.length - 15} more endpoints</p>
                  )}
                </div>
              ) : swaggerData && swaggerData.paths ? (
                <div className="space-y-4 mb-6">
                  {Object.entries(swaggerData.paths).slice(0, 15).map(([path, methods]: [string, any], idx: number) => (
                    <div key={idx} className="border-l-4 border-l-blue-500 pl-4 mb-4">
                      <code className="text-sm font-mono font-semibold mb-2 block">{path}</code>
                      {Object.entries(methods).map(([method, details]: [string, any], midx: number) => (
                        <div key={midx} className="ml-4 mb-3 text-sm">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold text-xs uppercase">
                              {method}
                            </span>
                            <span className="text-muted-foreground">{details.summary || details.description || 'No description'}</span>
                          </div>
                          
                          {details.parameters && details.parameters.length > 0 && (
                            <div className="mt-2">
                              <span className="font-medium text-xs">Parameters:</span>
                              <table className="w-full mt-1 border-collapse border border-gray-300">
                                <thead>
                                  <tr className="bg-muted">
                                    <th className="border border-gray-300 px-2 py-1 text-left text-xs font-semibold">Name</th>
                                    <th className="border border-gray-300 px-2 py-1 text-left text-xs font-semibold">Type</th>
                                    <th className="border border-gray-300 px-2 py-1 text-left text-xs font-semibold">In</th>
                                    <th className="border border-gray-300 px-2 py-1 text-left text-xs font-semibold">Required</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {details.parameters.map((param: any, pidx: number) => (
                                    <tr key={pidx}>
                                      <td className="border border-gray-300 px-2 py-1 text-xs"><code>{param.name}</code></td>
                                      <td className="border border-gray-300 px-2 py-1 text-xs"><code className="text-blue-600">{param.schema?.type || param.type || 'any'}</code></td>
                                      <td className="border border-gray-300 px-2 py-1 text-xs">{param.in}</td>
                                      <td className="border border-gray-300 px-2 py-1 text-xs">{param.required ? 'Yes' : 'No'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          
                          {details.responses && (
                            <div className="mt-2">
                              <span className="font-medium text-xs">Response: </span>
                              <code className="text-xs bg-muted px-1 rounded">
                                {Object.keys(details.responses)[0]} - {details.responses[Object.keys(details.responses)[0]]?.description || 'Success'}
                              </code>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                  {Object.keys(swaggerData.paths).length > 15 && (
                    <p className="text-sm text-muted-foreground">... and {Object.keys(swaggerData.paths).length - 15} more endpoints</p>
                  )}
                </div>
              ) : (
                <p className="mb-6 text-muted-foreground">No API endpoints detected in the analysis.</p>
              )}

              <h3 className="text-xl font-semibold mb-3 mt-6">Method Documentation</h3>
              {comprehensiveData?.methodComments && Array.isArray(comprehensiveData.methodComments) && comprehensiveData.methodComments.length > 0 ? (
                <div className="space-y-4">
                  {comprehensiveData.methodComments.slice(0, 15).map((comment: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="font-semibold mb-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {comment.className}.{comment.methodName}()
                        </code>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Description: </span>
                          <span className="text-muted-foreground">{comment.javadoc || comment.description || 'No description available'}</span>
                        </div>
                        
                        <div>
                          <span className="font-medium">Return Type: </span>
                          <code className="text-xs bg-muted px-1 rounded text-blue-600">{comment.returnType || 'void'}</code>
                        </div>
                        
                        {comment.parameters && comment.parameters.length > 0 && (
                          <div>
                            <span className="font-medium">Parameters:</span>
                            <table className="w-full mt-2 border-collapse border border-gray-300">
                              <thead>
                                <tr className="bg-muted">
                                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Name</th>
                                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Type</th>
                                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {comment.parameters.map((param: any, pidx: number) => (
                                  <tr key={pidx}>
                                    <td className="border border-gray-300 px-3 py-2 text-xs">
                                      <code>{param.name}</code>
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-xs">
                                      <code className="text-blue-600">{param.type}</code>
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-xs text-muted-foreground">
                                      {param.description || 'No description'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {comprehensiveData.methodComments.length > 15 && (
                    <p className="text-sm text-muted-foreground">... and {comprehensiveData.methodComments.length - 15} more methods</p>
                  )}
                </div>
              ) : comprehensiveData?.methodComments && Object.keys(comprehensiveData.methodComments).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(comprehensiveData.methodComments).slice(0, 10).map(([method, comment]: [string, any], idx: number) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg text-sm">
                      <div className="font-semibold">{method}</div>
                      <div className="text-muted-foreground mt-1">
                        {typeof comment === 'string' ? comment : comment?.javadoc || comment?.description || JSON.stringify(comment)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Method and class documentation extracted from source code comments and annotations.
                </p>
              )}
            </section>

            {/* 11. Codebase & Technology Summary */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Codebase &amp; Technology Summary</h2>
              
              <h3 className="text-xl font-semibold mb-3">Project Statistics</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Source Files</div>
                  <div className="text-2xl font-bold">{analysisData.structure?.sourceFiles?.length || 0}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Classes</div>
                  <div className="text-2xl font-bold">{analysisData.classes?.length || 0}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Dependencies</div>
                  <div className="text-2xl font-bold">{analysisData.dependencies?.length || 0}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Patterns Detected</div>
                  <div className="text-2xl font-bold">{analysisData.patterns?.length || 0}</div>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3">Technology Stack</h3>
              {analysisData.dependencies && analysisData.dependencies.length > 0 ? (
                <ul className="list-disc pl-6 mb-4">
                  {analysisData.dependencies.slice(0, 15).map((dep, idx) => (
                    <li key={idx} className="text-sm">{dep.from} → {dep.to} ({dep.type})</li>
                  ))}
                  {analysisData.dependencies.length > 15 && (
                    <li>... and {analysisData.dependencies.length - 15} more dependencies</li>
                  )}
                </ul>
              ) : (
                <p className="mb-4 text-muted-foreground">Technology stack information extracted from project analysis.</p>
              )}

              <h3 className="text-xl font-semibold mb-3">Annotations &amp; Framework Usage</h3>
              <div className="mb-4">
                {annotations.length > 0 ? (
                  <ul className="list-disc pl-6">
                    {annotations.map((annotation: string, idx: number) => (
                      <li key={idx} className="text-sm">{annotation}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No framework annotations detected</p>
                )}
              </div>
            </section>

            {/* 12. Module Analysis */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">12. Module Analysis</h2>
              
              {comprehensiveData?.modules && comprehensiveData.modules.length > 0 ? (
                <div className="space-y-6">
                  {comprehensiveData.modules.map((module: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-l-blue-500 pl-4">
                      <h3 className="text-lg font-semibold mb-2">
                        {module.name}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">({module.type?.toUpperCase()})</span>
                      </h3>
                      
                      {module.purpose && (
                        <div className="mb-3">
                          <span className="font-medium">Purpose: </span>
                          <span className="text-muted-foreground">{module.purpose}</span>
                        </div>
                      )}
                      
                      {module.description && (
                        <div className="mb-3">
                          <span className="font-medium">Description: </span>
                          <span className="text-muted-foreground">{module.description}</span>
                        </div>
                      )}
                      
                      {module.responsibilities && module.responsibilities.length > 0 && (
                        <div className="mb-3">
                          <span className="font-medium">Responsibilities:</span>
                          <ul className="list-disc pl-6 mt-1">
                            {module.responsibilities.map((resp: string, ridx: number) => (
                              <li key={ridx} className="text-sm text-muted-foreground">{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {module.classes && module.classes.length > 0 && (
                        <div className="mb-3">
                          <span className="font-medium">Classes: </span>
                          <span className="text-sm text-muted-foreground">{module.classes.join(', ')}</span>
                        </div>
                      )}
                      
                      {module.methods && module.methods.length > 0 && (
                        <div className="mb-3">
                          <span className="font-medium">Key Methods:</span>
                          <ul className="list-disc pl-6 mt-1">
                            {module.methods.slice(0, 5).map((method: any, midx: number) => (
                              <li key={midx} className="text-sm text-muted-foreground">
                                {typeof method === 'string' ? method : method.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {module.dependencies && module.dependencies.length > 0 && (
                        <div className="mb-3">
                          <span className="font-medium">Dependencies: </span>
                          <span className="text-sm text-muted-foreground">{module.dependencies.join(', ')}</span>
                        </div>
                      )}
                      
                      {module.businessLogic && (
                        <div className="mb-3">
                          <span className="font-medium">Business Logic: </span>
                          <span className="text-muted-foreground">{module.businessLogic}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No module analysis available for this project.</p>
              )}
            </section>

            {/* 13. Code Quality Analysis */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">13. Code Quality Analysis</h2>
              
              {comprehensiveData?.qualityMetrics ? (
                <>
                  <h3 className="text-xl font-semibold mb-3">Quality Metrics Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Maintainability</div>
                      <div className="text-2xl font-bold">{comprehensiveData.qualityMetrics.maintainability || 'N/A'}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Testability</div>
                      <div className="text-2xl font-bold">{comprehensiveData.qualityMetrics.testability || 'N/A'}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Documentation</div>
                      <div className="text-2xl font-bold">{comprehensiveData.qualityMetrics.documentation || 'N/A'}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Complexity</div>
                      <div className="text-2xl font-bold">{comprehensiveData.qualityMetrics.complexity || 'N/A'}</div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No code quality analysis data available.</p>
              )}
            </section>

            {/* 14. Project Structure */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">14. Project Structure</h2>
              
              {structureData?.structure && structureData.structure.length > 0 ? (
                <div className="space-y-3">
                  {structureData.structure.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">{item.name}</span>
                        {item.importance && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {item.importance}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                      {item.children && item.children.length > 0 && (
                        <div className="mt-2 ml-4 space-y-1">
                          {item.children.slice(0, 10).map((child: any, cidx: number) => (
                            <div key={cidx} className="text-sm">
                              <span className="text-muted-foreground">├─ {child.name}</span>
                              {child.description && (
                                <span className="text-xs text-muted-foreground ml-2">({child.description})</span>
                              )}
                            </div>
                          ))}
                          {item.children.length > 10 && (
                            <div className="text-sm text-muted-foreground">... and {item.children.length - 10} more files</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No detailed project structure available.</p>
              )}
            </section>

            {/* 15. Technology Stack Details */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">15. Technology Stack Details</h2>
              
              {comprehensiveData?.technologySummary ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">Architecture & Framework</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Architecture</div>
                        <div className="font-semibold">{comprehensiveData.technologySummary.architecture || 'N/A'}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Framework</div>
                        <div className="font-semibold">{comprehensiveData.technologySummary.framework || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  
                  {comprehensiveData.technologySummary.patterns && comprehensiveData.technologySummary.patterns.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3">Design Patterns</h3>
                      <div className="flex flex-wrap gap-2">
                        {comprehensiveData.technologySummary.patterns.map((pattern: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {comprehensiveData.technologySummary.dependencies && comprehensiveData.technologySummary.dependencies.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3">Key Dependencies</h3>
                      <div className="space-y-2">
                        {comprehensiveData.technologySummary.dependencies.slice(0, 20).map((dep: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                            <div>
                              <span className="font-medium">{dep.name}</span>
                              {dep.version && <span className="text-muted-foreground ml-2">v{dep.version}</span>}
                            </div>
                            {dep.scope && (
                              <span className="text-xs px-2 py-1 bg-gray-200 rounded">{dep.scope}</span>
                            )}
                          </div>
                        ))}
                        {comprehensiveData.technologySummary.dependencies.length > 20 && (
                          <p className="text-sm text-muted-foreground">... and {comprehensiveData.technologySummary.dependencies.length - 20} more dependencies</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {comprehensiveData.technologySummary.securityFeatures && comprehensiveData.technologySummary.securityFeatures.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3">Security Features</h3>
                      <ul className="list-disc pl-6">
                        {comprehensiveData.technologySummary.securityFeatures.map((feature: string, idx: number) => (
                          <li key={idx} className="text-sm">{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No detailed technology stack information available.</p>
              )}
            </section>

            {/* 16. Non-Functional Requirements */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">16. Non-Functional Requirements</h2>
              {comprehensiveData?.nonFunctionalRequirements && comprehensiveData.nonFunctionalRequirements.length > 0 ? (
                <ul className="list-disc pl-6 mb-4">
                  {comprehensiveData.nonFunctionalRequirements.map((nfr: string, idx: number) => (
                    <li key={idx}>{nfr}</li>
                  ))}
                </ul>
              ) : (
                <div className="mb-4">
                  <p className="mb-3">Based on the code analysis, the following non-functional requirements are addressed:</p>
                  <ul className="list-disc pl-6">
                    <li><strong>Scalability:</strong> Layered architecture supports horizontal scaling and component isolation</li>
                    <li><strong>Maintainability:</strong> Clear separation of concerns with {analysisData.patterns?.length || 0} design patterns implemented</li>
                    <li><strong>Performance:</strong> Optimized data access through repository pattern and service layer</li>
                    <li><strong>Security:</strong> Framework-based security annotations and authentication mechanisms</li>
                  </ul>
                </div>
              )}
            </section>

            {/* 17. Demographic Scan Results */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">17. Demographic Scan Results</h2>
              
              {demographicData?.report ? (
                <>
                  <h3 className="text-xl font-semibold mb-3">Scan Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Files Scanned</div>
                      <div className="text-2xl font-bold">{demographicData.report.summary.totalFiles}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Matches</div>
                      <div className="text-2xl font-bold">{demographicData.report.summary.totalMatches}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Fields Found</div>
                      <div className="text-2xl font-bold">{demographicData.report.summary.fieldsFound}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Scan Date</div>
                      <div className="text-sm font-semibold">
                        {new Date(demographicData.report.summary.scanDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {demographicData.report.summary.totalMatches > 0 ? (
                    <>
                      <h3 className="text-xl font-semibold mb-3">Detected Demographic Fields</h3>
                      <div className="space-y-4 mb-6">
                        {Object.entries(demographicData.report.fieldResults).map(([fieldName, results]: [string, any], idx: number) => (
                          <div key={idx} className="border-l-4 border-l-orange-500 pl-4">
                            <h4 className="font-semibold text-lg mb-2">{fieldName}</h4>
                            <div className="text-sm text-muted-foreground mb-2">
                              Found {results.length} occurrence{results.length !== 1 ? 's' : ''}
                            </div>
                            <div className="space-y-2">
                              {results.slice(0, 5).map((result: any, ridx: number) => (
                                <div key={ridx} className="p-3 bg-muted rounded-lg text-sm">
                                  <div className="font-medium mb-1">
                                    📄 {result.file} <span className="text-muted-foreground">(Line {result.line})</span>
                                  </div>
                                  <code className="text-xs bg-background px-2 py-1 rounded block mt-1">
                                    {result.context}
                                  </code>
                                </div>
                              ))}
                              {results.length > 5 && (
                                <p className="text-sm text-muted-foreground">
                                  ... and {results.length - 5} more occurrence{results.length - 5 !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <h3 className="text-xl font-semibold mb-3">Coverage Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2 text-green-600">✓ Found Fields ({demographicData.report.coverage.foundFields.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {demographicData.report.coverage.foundFields.map((field: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2 text-gray-600">✗ Missing Fields ({demographicData.report.coverage.missingFields.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {demographicData.report.coverage.missingFields.slice(0, 15).map((field: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {field}
                              </span>
                            ))}
                            {demographicData.report.coverage.missingFields.length > 15 && (
                              <span className="text-xs text-muted-foreground">
                                +{demographicData.report.coverage.missingFields.length - 15} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* SQL Query Analysis */}
                      {demographicData.report.sqlFindings && demographicData.report.sqlFindings.length > 0 && (
                        <>
                          <h3 className="text-xl font-semibold mt-6 mb-3">SQL Query Analysis</h3>
                          <p className="mb-4 text-sm text-muted-foreground">
                            SQL queries that access demographic fields and their associated database tables.
                          </p>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="p-3 bg-cyan-50 dark:bg-cyan-950 rounded-lg border border-cyan-200">
                              <div className="text-xs text-muted-foreground">SQL Queries</div>
                              <div className="text-2xl font-bold text-cyan-600">{demographicData.report.sqlFindings.length}</div>
                            </div>
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg border border-indigo-200">
                              <div className="text-xs text-muted-foreground">Tables Accessed</div>
                              <div className="text-2xl font-bold text-indigo-600">{demographicData.report.summary.tablesAccessed || 0}</div>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200">
                              <div className="text-xs text-muted-foreground">Query Types</div>
                              <div className="text-2xl font-bold text-purple-600">
                                {Array.from(new Set(demographicData.report.sqlFindings.map((f: any) => f.queryType))).length}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {demographicData.report.sqlFindings.slice(0, 5).map((finding: any, idx: number) => (
                              <div key={idx} className="border-l-4 border-l-cyan-500 pl-3 py-2 bg-muted rounded">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="text-sm">
                                    <span className="font-semibold">{finding.queryType}</span> query in {finding.file}
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                    finding.queryType === 'SELECT' ? 'bg-blue-100 text-blue-800' :
                                    finding.queryType === 'INSERT' ? 'bg-green-100 text-green-800' :
                                    finding.queryType === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {finding.queryType}
                                  </span>
                                </div>
                                <div className="text-xs mb-1">
                                  <span className="font-medium">Fields:</span>{' '}
                                  {finding.demographicFields.join(', ')}
                                </div>
                                {finding.tables.length > 0 && (
                                  <div className="text-xs">
                                    <span className="font-medium">Tables:</span>{' '}
                                    {finding.tables.join(', ')}
                                  </div>
                                )}
                              </div>
                            ))}
                            {demographicData.report.sqlFindings.length > 5 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{demographicData.report.sqlFindings.length - 5} more SQL queries (view full report for details)
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-muted-foreground">
                        No demographic fields detected in the scanned files. 
                        The codebase does not appear to contain sensitive personal data fields.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Loading demographic scan results...</p>
                </div>
              )}
            </section>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 pt-8 border-t-2 border-gray-300 mt-12">
              <p className="font-semibold">Developed by: Ullas Krishnan, Sr Solution Architect</p>
              <p className="mt-1">Copyright © Project Diamond Zensar team</p>
            </div>
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
