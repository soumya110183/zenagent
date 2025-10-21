import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, FileText, CheckCircle, XCircle, RefreshCw, Users, Settings, Brain, Info } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import DemographicPatternsManager from '@/components/demographic-patterns-manager';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DemographicScanTabProps {
  projectId: string;
}

interface ScanResult {
  file: string;
  line: number;
  fieldType: string;
  matchedPattern: string;
  context: string;
}

interface ScanReport {
  summary: {
    totalFiles: number;
    totalMatches: number;
    fieldsFound: number;
    scanDate: string;
  };
  fieldResults: Record<string, ScanResult[]>;
  coverage: {
    foundFields: string[];
    missingFields: string[];
  };
}

export default function DemographicScanTab({ projectId }: DemographicScanTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: scanData, isLoading: isScanLoading } = useQuery<{ report: ScanReport; success: boolean; excelMapping?: any }>({
    queryKey: ['/api/projects', projectId, 'demographics'],
    enabled: !!projectId,
  });

  const { data: patternsData } = useQuery({
    queryKey: ['/api/demographic/patterns'],
    enabled: !!projectId,
  });

  const scanMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/projects/${projectId}/scan-demographics`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'demographics'] });
      toast({
        title: 'Scan Complete',
        description: 'Demographic field scan completed successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Scan Failed',
        description: 'Failed to scan demographic fields',
        variant: 'destructive',
      });
    },
  });

  if (isScanLoading) {
    return (
      <div className="flex items-center justify-center py-12 bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const report = scanData?.report;
  const excelMapping = scanData?.excelMapping;
  const allResults: ScanResult[] = report ? Object.values(report.fieldResults).flat() : [];
  const filteredResults = allResults.filter(result => 
    result.fieldType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.context.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { name: 'Name Fields', fields: ['Embossed Name', 'Primary Name', 'Secondary Name', 'Legal Name', 'DBA Name', 'Double Byte Name', 'Embossed Company Name'] },
    { name: 'Personal Info', fields: ['Gender', 'Date of Birth', 'Government IDs', 'Member Since Date'] },
    { name: 'Address Fields', fields: ['Home Address', 'Business Address', 'Alternate Address', 'Temporary Address', 'Other Address', 'Additional Addresses Array'] },
    { name: 'Phone Fields', fields: ['Home Phone', 'Alternate Home Phone', 'Business Phone', 'Alternate Business Phone', 'Mobile Phone', 'Alternate Mobile Phone', 'Attorney Phone', 'Fax', 'ANI Phone', 'Other Phone', 'Additional Phones Array'] },
    { name: 'Email Fields', fields: ['Servicing Email', 'E-Statement Email', 'Business Email', 'Additional Emails Array'] },
  ];

  const coveragePercentage = report 
    ? Math.round((report.coverage.foundFields.length / (report.coverage.foundFields.length + report.coverage.missingFields.length)) * 100)
    : 0;

  return (
    <div className="p-6 bg-white">
      <Tabs defaultValue="scan" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Regex Scan
          </TabsTrigger>
          <TabsTrigger value="excel" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Excel Field Mapping
          </TabsTrigger>
          <TabsTrigger value="demographic-class" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Demographic Class
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Pattern Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-6">
          {/* Header and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Demographic Field Scanner</h3>
            </div>
            <Button
              onClick={() => scanMutation.mutate()}
              disabled={scanMutation.isPending}
              size="sm"
              data-testid="button-run-scan"
            >
              {scanMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Scan
                </>
              )}
            </Button>
          </div>

          {!report ? (
            <Alert>
              <AlertDescription>
                No demographic scan has been performed yet. Click "Run Scan" to analyze this project for demographic fields.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Files Scanned</p>
                    <p className="text-2xl font-bold" data-testid="text-files-scanned">{report.summary.totalFiles}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Matches</p>
                    <p className="text-2xl font-bold" data-testid="text-total-matches">{report.summary.totalMatches}</p>
                  </div>
                  <Search className="w-8 h-8 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Fields Found</p>
                    <p className="text-2xl font-bold" data-testid="text-fields-found">{report.coverage.foundFields.length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Coverage</p>
                    <p className="text-2xl font-bold" data-testid="text-coverage">{coveragePercentage}%</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Excel Field Mapping Summary */}
          {excelMapping && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Excel Field Mapping Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-lg font-bold text-blue-600">{excelMapping.totalFields}</div>
                    <div className="text-xs text-muted-foreground">Total Fields</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-lg font-bold text-green-600">{excelMapping.matchedFields}</div>
                    <div className="text-xs text-muted-foreground">Matched</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-lg font-bold text-orange-600">{excelMapping.unmatchedFields}</div>
                    <div className="text-xs text-muted-foreground">Unmatched</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-lg font-bold text-blue-600">{excelMapping.matchPercentage}%</div>
                    <div className="text-xs text-muted-foreground">Match Rate</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-xs font-medium text-muted-foreground truncate">{excelMapping.fileName}</div>
                    <div className="text-xs text-muted-foreground">{new Date(excelMapping.uploadedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground bg-white p-2 rounded border">
                  <span>💡 Excel-based field mapping uses 100% exact matching algorithm</span>
                  <Badge variant="outline" className="text-xs">Code Lens ML Available</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coverage by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Field Coverage by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => {
                  const foundInCategory = category.fields.filter(f => 
                    report.coverage.foundFields.includes(f)
                  );
                  const categoryPercentage = Math.round((foundInCategory.length / category.fields.length) * 100);
                  
                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {foundInCategory.length}/{category.fields.length} ({categoryPercentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${categoryPercentage}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {category.fields.map(field => (
                          <Badge 
                            key={field}
                            variant={report.coverage.foundFields.includes(field) ? "default" : "outline"}
                            className="text-xs"
                          >
                            {report.coverage.foundFields.includes(field) ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Search and Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Scan Results ({filteredResults.length})</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search results..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                    data-testid="input-search-results"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {searchTerm ? 'No results match your search' : 'No demographic fields found'}
                  </p>
                ) : (
                  filteredResults.map((result, idx) => (
                    <div 
                      key={idx}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`scan-result-${idx}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {result.fieldType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {result.file}:{result.line}
                            </span>
                          </div>
                          <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                            {result.context}
                          </code>
                          <p className="text-xs text-muted-foreground mt-1">
                            Pattern: <code>{result.matchedPattern}</code>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            </Card>
          </>
        )}
      </TabsContent>

      <TabsContent value="excel" className="space-y-6">
        <ExcelFieldMappingTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="demographic-class" className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Demographic Classes</h3>
          </div>
        </div>

        {!report ? (
          <Alert>
            <AlertDescription>
              No demographic scan has been performed yet. Click "Run Scan" in the Regex Scan tab to analyze this project for demographic fields.
            </AlertDescription>
          </Alert>
        ) : (() => {
          // Group results by file (class)
          const classesByFile = allResults.reduce((acc, result) => {
            if (!acc[result.file]) {
              acc[result.file] = [];
            }
            acc[result.file].push(result);
            return acc;
          }, {} as Record<string, ScanResult[]>);

          const classEntries = Object.entries(classesByFile);

          return classEntries.length === 0 ? (
            <Alert>
              <AlertDescription>
                No classes with demographic fields found in the project.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {/* Summary Card */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Classes with Demographic Fields</p>
                      <p className="text-2xl font-bold" data-testid="text-demographic-classes">{classEntries.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-purple-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              {/* Classes List */}
              <div className="space-y-4">
                {classEntries.map(([fileName, results]) => (
                  <Card key={fileName}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="font-mono text-sm">{fileName}</span>
                        </div>
                        <Badge variant="secondary">
                          {results.length} field{results.length !== 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.map((result, idx) => (
                          <div 
                            key={idx}
                            className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            data-testid={`class-field-${idx}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant="default" className="text-xs">
                                  {result.fieldType}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Line {result.line}
                                </span>
                              </div>
                            </div>
                            <code className="text-xs bg-muted px-2 py-1 rounded block">
                              {result.context}
                            </code>
                            <p className="text-xs text-muted-foreground mt-2">
                              Pattern: <code className="bg-muted px-1 rounded">{result.matchedPattern}</code>
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })()}
      </TabsContent>

      <TabsContent value="patterns">
        <DemographicPatternsManager />
      </TabsContent>
    </Tabs>
  </div>
  );
}

interface ExcelFieldMappingTabProps {
  projectId: string;
}

interface ExcelMapping {
  id: string;
  fileName: string;
  uploadedAt: string;
  totalFields: number;
  matchedFields: number;
  status: string;
  scanResults?: {
    totalFields: number;
    matchedFields: number;
    matches: Array<{
      tableName: string;
      fieldName: string;
      combined: string;
      matchCount: number;
      fieldMatchCount: number;
      tableMatchCount: number;
      locations: Array<{
        filePath: string;
        lineNumber: number;
        line: string;
        context: string;
        matchType: string;
      }>;
    }>;
    unmatchedFields: Array<{
      tableName: string;
      fieldName: string;
      combined: string;
    }>;
  };
}

function ExcelFieldMappingTab({ projectId }: ExcelFieldMappingTabProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mlSuggestions, setMlSuggestions] = useState<any>(null);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<Array<{step: string; status: 'pending' | 'running' | 'complete'}>>([]);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [reportHtml, setReportHtml] = useState<string>('');
  const [currentMappingId, setCurrentMappingId] = useState<string>('');
  const { toast } = useToast();

  const generateExcelMappingReport = async (mappingId: string) => {
    try {
      console.log('[Report] Generating report for mapping:', mappingId);
      const url = `/api/projects/${projectId}/excel-mapping/${mappingId}/report-html`;
      console.log('[Report] Fetching from:', url);
      
      // Fetch HTML preview
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      console.log('[Report] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Report] Error response:', errorText);
        throw new Error(`Failed to generate report preview: ${response.status}`);
      }

      const html = await response.text();
      console.log('[Report] Received HTML, length:', html.length);
      setReportHtml(html);
      setCurrentMappingId(mappingId);
      setShowReportPreview(true);
    } catch (error) {
      console.error('[Report] Error generating report:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate report preview',
        variant: 'destructive',
      });
    }
  };

  const downloadReport = async (format: 'html' | 'pdf' | 'docx') => {
    try {
      console.log('[Download] Starting download, format:', format, 'mappingId:', currentMappingId);
      const url = `/api/projects/${projectId}/excel-mapping/${currentMappingId}/report-download?format=${format}`;
      console.log('[Download] Fetching from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      console.log('[Download] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Download] Error response:', errorText);
        throw new Error(`Failed to download ${format.toUpperCase()} report: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('[Download] Blob size:', blob.size, 'type:', blob.type);
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const extension = format === 'docx' ? 'docx' : format === 'pdf' ? 'pdf' : 'html';
      link.download = `Excel_Field_Mapping_Report_${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      console.log('[Download] Download triggered successfully');

      toast({
        title: 'Download Complete',
        description: `Report downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('[Download] Error:', error);
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : `Failed to download ${format.toUpperCase()} report`,
        variant: 'destructive',
      });
    }
  };

  const { data: mappingsData, isLoading } = useQuery<{ mappings: ExcelMapping[]; success: boolean }>({
    queryKey: ['/api/projects', projectId, 'excel-mappings'],
    enabled: !!projectId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Show processing modal and initialize steps
      setShowProcessingModal(true);
      const steps = [
        { step: 'Uploading Excel file', status: 'running' as const },
        { step: 'Validating Excel format', status: 'pending' as const },
        { step: 'Parsing table and field names', status: 'pending' as const },
        { step: 'Scanning codebase for matches', status: 'pending' as const },
        { step: 'Analyzing match results', status: 'pending' as const },
        { step: 'Generating scan report', status: 'pending' as const },
      ];
      setProcessingSteps(steps);
      
      // Simulate step progression
      const updateStep = (index: number) => {
        setProcessingSteps(prev => prev.map((s, i) => ({
          ...s,
          status: i < index ? 'complete' : i === index ? 'running' : 'pending'
        })));
      };
      
      setTimeout(() => updateStep(1), 500);
      setTimeout(() => updateStep(2), 1000);
      setTimeout(() => updateStep(3), 1500);
      
      const formData = new FormData();
      formData.append('excelFile', file);
      
      const response = await fetch(`/api/projects/${projectId}/excel-mapping`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      setTimeout(() => updateStep(4), 500);
      setTimeout(() => updateStep(5), 1000);
      
      const result = await response.json();
      
      // Mark all complete
      setTimeout(() => {
        setProcessingSteps(prev => prev.map(s => ({ ...s, status: 'complete' as const })));
      }, 1500);
      
      return result;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'excel-mappings'] });
      
      // Close modal after a short delay
      setTimeout(() => {
        setShowProcessingModal(false);
        const totalRows = data?.results?.totalFields || data?.mapping?.totalFields || 0;
        toast({
          title: 'Upload Successful',
          description: `Excel file uploaded and scanned successfully. Loaded ${totalRows} rows from Excel file.`,
        });
        setSelectedFile(null);
        setUploadProgress(0);
      }, 2000);
    },
    onError: (error: Error) => {
      setShowProcessingModal(false);
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
      setUploadProgress(0);
    },
  });

  const mlSuggestionsMutation = useMutation({
    mutationFn: async (mappingId: string) => {
      // Show processing modal and initialize ML-specific steps
      setShowProcessingModal(true);
      const steps = [
        { step: 'Initializing Code Lens ML engine', status: 'running' as const },
        { step: 'Loading unmatched fields dataset', status: 'pending' as const },
        { step: 'Applying Lookup Table matching (95%+ confidence)', status: 'pending' as const },
        { step: 'Running Acronym Detection (90%+ confidence)', status: 'pending' as const },
        { step: 'Executing Levenshtein similarity analysis', status: 'pending' as const },
        { step: 'Token-based similarity matching (60-95% confidence)', status: 'pending' as const },
        { step: 'Compiling ML suggestions report', status: 'pending' as const },
      ];
      setProcessingSteps(steps);
      
      // Simulate step progression
      const updateStep = (index: number) => {
        setProcessingSteps(prev => prev.map((s, i) => ({
          ...s,
          status: i < index ? 'complete' : i === index ? 'running' : 'pending'
        })));
      };
      
      setTimeout(() => updateStep(1), 400);
      setTimeout(() => updateStep(2), 800);
      setTimeout(() => updateStep(3), 1200);
      setTimeout(() => updateStep(4), 1600);
      setTimeout(() => updateStep(5), 2000);
      
      const result = await apiRequest('POST', `/api/projects/${projectId}/excel-mapping/${mappingId}/ml-suggestions`);
      
      setTimeout(() => updateStep(6), 400);
      
      // Mark all complete
      setTimeout(() => {
        setProcessingSteps(prev => prev.map(s => ({ ...s, status: 'complete' as const })));
      }, 800);
      
      return result;
    },
    onSuccess: (data: any) => {
      setMlSuggestions(data.suggestions);
      
      // Close modal after a short delay
      setTimeout(() => {
        setShowProcessingModal(false);
        toast({
          title: 'ML Suggestions Generated',
          description: `Found ${Object.keys(data.suggestions || {}).length} field suggestions using Code Lens ML`,
        });
      }, 1500);
    },
    onError: (error: Error) => {
      setShowProcessingModal(false);
      toast({
        title: 'ML Suggestions Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        toast({
          title: 'Invalid File',
          description: 'Please select an Excel file (.xlsx or .xls)',
          variant: 'destructive',
        });
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      setUploadProgress(10);
      uploadMutation.mutate(selectedFile);
    }
  };

  const mappings = mappingsData?.mappings || [];
  const latestMapping = mappings[0];

  return (
    <div className="space-y-6">
      {/* Processing Modal */}
      <Dialog open={showProcessingModal} onOpenChange={setShowProcessingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              Code Lens - Processing Backend Operations
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {processingSteps.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                {item.status === 'complete' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : item.status === 'running' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <span className={`text-sm ${
                  item.status === 'complete' ? 'text-green-600 font-medium' :
                  item.status === 'running' ? 'text-primary font-medium' :
                  'text-muted-foreground'
                }`}>
                  {item.step}
                </span>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Backend processing in progress... Please wait.
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Upload Excel Field Mapping
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Upload an Excel file with two columns: <strong>table_name</strong> and <strong>field_name</strong>. 
              The system will scan the codebase for 100% matches of table.field combinations.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="flex-1 border-2 border-green-500 p-3 rounded-md cursor-pointer hover:border-green-600"
              data-testid="input-excel-file"
            />
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
              data-testid="button-upload-excel"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload & Scan'
              )}
            </Button>
          </div>

          {selectedFile && (
            <div className="text-sm text-muted-foreground">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : latestMapping ? (
        <div className="space-y-4">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Scan Summary</CardTitle>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => generateExcelMappingReport(latestMapping.id)}
                  className="flex items-center gap-2"
                  data-testid="button-generate-excel-report"
                >
                  <FileText className="w-4 h-4" />
                  Generate Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{latestMapping.totalFields}</div>
                  <div className="text-sm text-muted-foreground">Total Rows Loaded</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{latestMapping.matchedFields}</div>
                  <div className="text-sm text-muted-foreground">Matched</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {latestMapping.totalFields - latestMapping.matchedFields}
                  </div>
                  <div className="text-sm text-muted-foreground">Unmatched</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((latestMapping.matchedFields / latestMapping.totalFields) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Match Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matched Fields */}
          {latestMapping.scanResults && latestMapping.scanResults.matches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Matched Fields ({latestMapping.scanResults.matches.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {latestMapping.scanResults.matches.map((match, idx) => (
                    <div key={idx} className="p-3 border rounded-lg bg-green-50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-sm">
                            Table: <span className="text-blue-600">{match.tableName}</span> | Field: <span className="text-purple-600">{match.fieldName}</span>
                          </div>
                          {(match.fieldMatchCount > 0 || match.tableMatchCount > 0) && (
                            <div className="flex gap-2 mt-1">
                              {match.fieldMatchCount > 0 && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                                  Field: {match.fieldMatchCount}
                                </Badge>
                              )}
                              {match.tableMatchCount > 0 && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                  Table: {match.tableMatchCount}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {match.matchCount} total
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {match.locations.slice(0, 3).map((loc, locIdx) => (
                          <div key={locIdx} className="text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {loc.matchType === 'field_name' ? '📄 Field' : '🗃️ Table'}
                              </Badge>
                              <span className="text-muted-foreground">
                                {loc.filePath}:{loc.lineNumber}
                              </span>
                            </div>
                            <code className="block bg-white px-2 py-1 rounded mt-1 text-xs">
                              {loc.line}
                            </code>
                          </div>
                        ))}
                        {match.matchCount > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{match.matchCount - 3} more matches
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unmatched Fields */}
          {latestMapping.scanResults && latestMapping.scanResults.unmatchedFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-orange-600" />
                    Unmatched Fields ({latestMapping.scanResults.unmatchedFields.length})
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => mlSuggestionsMutation.mutate(latestMapping.id)}
                          disabled={mlSuggestionsMutation.isPending}
                          className="flex items-center gap-2"
                          data-testid="button-get-ml-suggestions"
                        >
                          {mlSuggestionsMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Brain className="w-4 h-4" />
                              Get ML Suggestions
                              <Info className="w-3.5 h-3.5 ml-1" />
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-sm">
                        <div className="space-y-2 text-xs">
                          <div className="font-bold text-sm">Code Lens ML (Traditional ML)</div>
                          <div className="space-y-1">
                            <div><strong>Method 1:</strong> Lookup Table (95% confidence)</div>
                            <div className="text-muted-foreground pl-2">Uses knowledge base of common field mappings</div>
                            <div><strong>Method 2:</strong> Acronym Detection (90% confidence)</div>
                            <div className="text-muted-foreground pl-2">Matches abbreviated field names (e.g., DOB → dateOfBirth)</div>
                            <div><strong>Method 3:</strong> Similarity Matching (60-95%)</div>
                            <div className="text-muted-foreground pl-2">Levenshtein distance + token overlap algorithms</div>
                          </div>
                          <div className="text-muted-foreground italic mt-2">
                            100% offline, no external API calls
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {latestMapping.scanResults.unmatchedFields.map((field, idx) => {
                    const suggestions = mlSuggestions?.[field.combined];
                    return (
                      <div key={idx} className="p-3 border rounded bg-orange-50">
                        <div className="text-sm font-medium mb-1">
                          {field.tableName}.{field.fieldName}
                        </div>
                        {!suggestions ? (
                          <div className="text-xs text-muted-foreground">
                            No matches found in codebase
                          </div>
                        ) : (
                          <div className="mt-2 space-y-1">
                            <div className="text-xs font-semibold text-green-700 flex items-center gap-1">
                              <Brain className="w-3 h-3" />
                              ML Suggestions:
                            </div>
                            {suggestions.slice(0, 3).map((suggestion: any, sIdx: number) => (
                              <div key={sIdx} className="flex items-center justify-between bg-white px-2 py-1 rounded text-xs">
                                <code className="font-mono">{suggestion.field}</code>
                                <Badge 
                                  variant={suggestion.confidence >= 0.9 ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {Math.round(suggestion.confidence * 100)}% match
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            No Excel mappings uploaded yet. Upload an Excel file to start scanning.
          </AlertDescription>
        </Alert>
      )}

      {/* Report Preview Modal */}
      <Dialog open={showReportPreview} onOpenChange={setShowReportPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Excel Field Mapping Report Preview</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport('html')}
                  className="flex items-center gap-2"
                  data-testid="button-download-html"
                >
                  <FileText className="w-4 h-4" />
                  Save HTML
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport('pdf')}
                  className="flex items-center gap-2"
                  data-testid="button-download-pdf"
                >
                  <FileText className="w-4 h-4" />
                  Save PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport('docx')}
                  className="flex items-center gap-2"
                  data-testid="button-download-docx"
                >
                  <FileText className="w-4 h-4" />
                  Save Word
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div
            className="border rounded-lg p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: reportHtml }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
