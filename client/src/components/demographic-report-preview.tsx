import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileText, X } from "lucide-react";
import type { Project } from "@shared/schema";
import { htmlExportService } from "@/services/htmlExportService";

interface DemographicReportPreviewProps {
  open: boolean;
  onClose: () => void;
  project: Project;
}

export default function DemographicReportPreview({
  open,
  onClose,
  project,
}: DemographicReportPreviewProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingDOC, setIsExportingDOC] = useState(false);
  const [demographicData, setDemographicData] = useState<any>(null);
  const [fieldPatterns, setFieldPatterns] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchDemographicData();
      fetchFieldPatterns();
    }
  }, [open]);

  const fetchDemographicData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${project.id}/demographics`);
      if (response.ok) {
        const data = await response.json();
        setDemographicData(data);
      }
    } catch (error) {
      console.error('Error fetching demographic data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFieldPatterns = async () => {
    try {
      const response = await fetch('/api/demographic/patterns');
      if (response.ok) {
        const data = await response.json();
        setFieldPatterns(data);
      }
    } catch (error) {
      console.error('Error fetching field patterns:', error);
    }
  };

  const handlePDFExport = async () => {
    setIsExportingPDF(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      const filename = `${project.name.replace(/\s+/g, '-')}-Demographic-Scan-${timestamp}.pdf`;
      await htmlExportService.exportToPDF('demographic-report-content', filename);
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
      const filename = `${project.name.replace(/\s+/g, '-')}-Demographic-Scan-${timestamp}.docx`;
      await htmlExportService.exportToDOCX('demographic-report-content', filename);
    } catch (error) {
      console.error('DOC export failed:', error);
      alert('DOC export failed. Please try again.');
    } finally {
      setIsExportingDOC(false);
    }
  };

  const getCategoryFields = (category: string) => {
    if (!fieldPatterns?.fields) return [];
    return fieldPatterns.fields.filter((f: any) => f.category === category);
  };

  const categories = ['Name', 'Contact Information', 'Government IDs', 'Financial Data', 'Personal Identifiers'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Demographic Scan Report</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDOCExport}
                disabled={isExportingDOC || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
                data-testid="button-save-demographic-docx"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isExportingDOC ? 'Saving...' : 'Save as DOCX'}
              </Button>
              <Button
                onClick={handlePDFExport}
                disabled={isExportingPDF || isLoading}
                className="bg-red-600 hover:bg-red-700"
                size="sm"
                data-testid="button-save-demographic-pdf"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExportingPDF ? 'Saving...' : 'Save as PDF'}
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                data-testid="button-close-demographic-report"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6 pb-6">
          <div id="demographic-report-content" className="prose prose-sm dark:prose-invert max-w-none py-6">
            {/* Cover Section */}
            <div className="text-center mb-12 pb-12 border-b">
              <h1 className="text-4xl font-bold mb-4">{project.name}</h1>
              <p className="text-xl text-muted-foreground mb-2">Demographic Scan Analysis Report</p>
              <p className="text-sm text-muted-foreground">
                Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Powered by Zengent AI - Enterprise Application Intelligence Platform
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading demographic scan results...</p>
              </div>
            ) : demographicData?.report ? (
              <>
                {/* Executive Summary */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
                  <p className="mb-4">
                    This report presents a comprehensive analysis of demographic and personally identifiable information (PII) 
                    fields detected within the {project.name} project codebase. The scan was performed using advanced pattern 
                    recognition across {demographicData.report.summary.totalFiles} source files.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-muted-foreground">Files Scanned</div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {demographicData.report.summary.totalFiles}
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="text-sm text-muted-foreground">Total Matches</div>
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        {demographicData.report.summary.totalMatches}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-sm text-muted-foreground">Fields Detected</div>
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {demographicData.report.summary.fieldsFound}
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="text-sm text-muted-foreground">Coverage</div>
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {Math.round((demographicData.report.summary.fieldsFound / 39) * 100)}%
                      </div>
                    </div>
                  </div>
                </section>

                {/* Scan Methodology */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Scan Methodology</h2>
                  <p className="mb-4">
                    The demographic field scanner employs <strong>39 advanced regex patterns</strong> organized across 
                    <strong> 5 major categories</strong> to identify sensitive data fields within the codebase:
                  </p>
                  <ul className="list-disc pl-6 mb-4">
                    <li><strong>Name Fields:</strong> Personal names, legal names, embossed names, DBA names</li>
                    <li><strong>Contact Information:</strong> Email addresses, phone numbers, physical addresses</li>
                    <li><strong>Government IDs:</strong> SSN, passport numbers, tax IDs, driver's licenses</li>
                    <li><strong>Financial Data:</strong> Account numbers, card details, routing information</li>
                    <li><strong>Personal Identifiers:</strong> Birth dates, gender, nationality, marital status</li>
                  </ul>
                  <p className="mb-4">
                    Scan completed on: <strong>{new Date(demographicData.report.summary.scanDate).toLocaleString()}</strong>
                  </p>
                </section>

                {/* Detailed Findings */}
                {demographicData.report.summary.totalMatches > 0 ? (
                  <>
                    <section className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">Detected Demographic Fields</h2>
                      <p className="mb-4">
                        The following demographic fields were identified in the codebase. Each entry includes the file location, 
                        line number, and code context for verification and compliance purposes.
                      </p>
                      
                      <div className="space-y-6">
                        {Object.entries(demographicData.report.fieldResults).map(([fieldName, results]: [string, any], idx: number) => {
                          const fieldInfo = fieldPatterns?.fields?.find((f: any) => f.fieldName === fieldName);
                          
                          return (
                            <div key={idx} className="border-l-4 border-l-orange-500 pl-4 pb-4">
                              <h3 className="text-xl font-semibold mb-2">{fieldName}</h3>
                              
                              {fieldInfo && (
                                <div className="mb-3 p-3 bg-muted rounded-lg">
                                  <div className="text-sm mb-1">
                                    <span className="font-medium">Category:</span> {fieldInfo.category}
                                  </div>
                                  <div className="text-sm mb-1">
                                    <span className="font-medium">Description:</span> {fieldInfo.description}
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">Examples:</span> {fieldInfo.examples.join(', ')}
                                  </div>
                                </div>
                              )}
                              
                              <div className="mb-3">
                                <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-semibold">
                                  {results.length} occurrence{results.length !== 1 ? 's' : ''} found
                                </span>
                              </div>
                              
                              <div className="space-y-3">
                                {results.map((result: any, ridx: number) => (
                                  <div key={ridx} className="p-4 bg-muted rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="font-medium">
                                        📄 <span className="text-blue-600 dark:text-blue-400">{result.file}</span>
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Line {result.line}
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <div className="text-xs text-muted-foreground mb-1">Code Context:</div>
                                      <code className="text-xs bg-background dark:bg-gray-900 px-3 py-2 rounded block font-mono">
                                        {result.context}
                                      </code>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    {/* Coverage Analysis */}
                    <section className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">Coverage Analysis</h2>
                      <p className="mb-4">
                        This section provides an overview of which demographic field patterns were detected and which were not found 
                        in the codebase.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 border-2 border-green-500 rounded-lg">
                          <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">
                            ✓ Detected Fields ({demographicData.report.coverage.foundFields.length})
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {demographicData.report.coverage.foundFields.map((field: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg">
                          <h3 className="text-lg font-semibold mb-3 text-gray-600 dark:text-gray-400">
                            ✗ Not Found ({demographicData.report.coverage.missingFields.length})
                          </h3>
                          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                            {demographicData.report.coverage.missingFields.map((field: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Category Breakdown */}
                    <section className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">Category Breakdown</h2>
                      <p className="mb-4">
                        Demographic fields organized by category showing the distribution of sensitive data types across the codebase.
                      </p>
                      
                      <div className="space-y-4">
                        {categories.map((category, idx) => {
                          const categoryFields = getCategoryFields(category);
                          const foundInCategory = categoryFields.filter((f: any) => 
                            demographicData.report.coverage.foundFields.includes(f.fieldName)
                          );
                          
                          return (
                            <div key={idx} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold">{category}</h3>
                                <span className="text-sm font-medium px-3 py-1 bg-muted rounded-full">
                                  {foundInCategory.length} / {categoryFields.length} fields detected
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {categoryFields.map((field: any, fidx: number) => {
                                  const isFound = demographicData.report.coverage.foundFields.includes(field.fieldName);
                                  return (
                                    <div 
                                      key={fidx} 
                                      className={`p-2 rounded text-sm ${
                                        isFound 
                                          ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                                          : 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-500'
                                      }`}
                                    >
                                      {isFound ? '✓' : '✗'} {field.fieldName}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </>
                ) : (
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Scan Results</h2>
                    <div className="p-8 bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 rounded-lg text-center">
                      <div className="text-5xl mb-4">✓</div>
                      <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-300">No Demographic Fields Detected</h3>
                      <p className="text-muted-foreground">
                        The codebase does not appear to contain sensitive personal data fields. 
                        This indicates good data privacy practices or that demographic data is handled externally.
                      </p>
                    </div>
                  </section>
                )}

                {/* Recommendations */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
                  
                  {demographicData.report.summary.totalMatches > 0 ? (
                    <>
                      <h3 className="text-lg font-semibold mb-3">Data Privacy Considerations</h3>
                      <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>
                          <strong>Compliance Review:</strong> Ensure all detected demographic fields comply with relevant 
                          data protection regulations (GDPR, CCPA, HIPAA, etc.)
                        </li>
                        <li>
                          <strong>Encryption:</strong> Verify that sensitive demographic data is encrypted both at rest and in transit
                        </li>
                        <li>
                          <strong>Access Control:</strong> Implement role-based access control (RBAC) for fields containing PII
                        </li>
                        <li>
                          <strong>Data Minimization:</strong> Review if all detected demographic fields are necessary for business operations
                        </li>
                        <li>
                          <strong>Audit Logging:</strong> Implement comprehensive audit trails for all access to demographic data
                        </li>
                        <li>
                          <strong>Regular Scans:</strong> Schedule periodic demographic scans to detect new PII fields introduced during development
                        </li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
                      <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>
                          <strong>Continue Monitoring:</strong> Maintain regular demographic scans as the codebase evolves
                        </li>
                        <li>
                          <strong>External Systems:</strong> If demographic data is handled by external systems, ensure they follow security best practices
                        </li>
                        <li>
                          <strong>Documentation:</strong> Document data flow for any demographic information processed by the application
                        </li>
                      </ul>
                    </>
                  )}
                </section>

                {/* Pattern Reference */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Pattern Reference</h2>
                  <p className="mb-4">
                    Complete list of {fieldPatterns?.totalFields || 39} demographic field patterns used in this scan, 
                    organized by category:
                  </p>
                  
                  {fieldPatterns?.fields && (
                    <div className="space-y-4">
                      {categories.map((category, idx) => {
                        const fields = getCategoryFields(category);
                        
                        return fields.length > 0 ? (
                          <div key={idx} className="border rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-3">{category}</h3>
                            <div className="space-y-3">
                              {fields.map((field: any, fidx: number) => (
                                <div key={fidx} className="p-3 bg-muted rounded-lg text-sm">
                                  <div className="font-semibold mb-1">{field.fieldName}</div>
                                  <div className="text-muted-foreground mb-2">{field.description}</div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium">Examples:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {field.examples.slice(0, 3).map((example: string, eidx: number) => (
                                        <code key={eidx} className="text-xs bg-background px-2 py-1 rounded">
                                          {example}
                                        </code>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </section>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No demographic data available for this project.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
