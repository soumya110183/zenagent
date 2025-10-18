import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, FileText, CheckCircle, XCircle, RefreshCw, Users, Settings } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import DemographicPatternsManager from '@/components/demographic-patterns-manager';

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

  const { data: scanData, isLoading: isScanLoading } = useQuery<{ report: ScanReport; success: boolean }>({
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
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Regex Scan
          </TabsTrigger>
          <TabsTrigger value="excel" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Excel Field Mapping
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
  const { toast } = useToast();

  const { data: mappingsData, isLoading } = useQuery<{ mappings: ExcelMapping[]; success: boolean }>({
    queryKey: ['/api/projects', projectId, 'excel-mappings'],
    enabled: !!projectId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
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
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'excel-mappings'] });
      toast({
        title: 'Upload Successful',
        description: 'Excel file uploaded and scanned successfully',
      });
      setSelectedFile(null);
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
      setUploadProgress(0);
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
              className="flex-1"
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
              <CardTitle className="text-base">Scan Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{latestMapping.totalFields}</div>
                  <div className="text-sm text-muted-foreground">Total Fields</div>
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
                        <div className="font-medium text-sm">
                          {match.tableName}.{match.fieldName}
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {match.matchCount} {match.matchCount === 1 ? 'match' : 'matches'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {match.locations.slice(0, 3).map((loc, locIdx) => (
                          <div key={locIdx} className="text-xs">
                            <div className="text-muted-foreground">
                              {loc.filePath}:{loc.lineNumber}
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
                <CardTitle className="text-base flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-orange-600" />
                  Unmatched Fields ({latestMapping.scanResults.unmatchedFields.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {latestMapping.scanResults.unmatchedFields.map((field, idx) => (
                    <div key={idx} className="p-2 border rounded bg-orange-50">
                      <div className="text-sm font-medium">
                        {field.tableName}.{field.fieldName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        No matches found in codebase
                      </div>
                    </div>
                  ))}
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
    </div>
  );
}
