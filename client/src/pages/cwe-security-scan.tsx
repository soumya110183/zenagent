import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, AlertTriangle, Info, CheckCircle, XCircle, ArrowLeft, Play, FileCode, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface CWEVulnerability {
  id: string;
  cweId: string;
  cweName: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  filePath: string;
  lineNumber?: number;
  codeSnippet?: string;
  description: string;
  recommendation?: string;
  owasp?: string;
  confidence: 'high' | 'medium' | 'low';
}

interface CWEScan {
  id: string;
  projectId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  totalFiles: number;
  scannedFiles: number;
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  vulnerabilities?: CWEVulnerability[];
  qualityMetrics?: string;
}

interface QualityMetrics {
  functionalSuitability: number;
  performanceEfficiency: number;
  compatibility: number;
  usability: number;
  reliability: number;
  security: number;
  maintainability: number;
  portability: number;
  overallScore: number;
  securityGrade: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#f59e0b',
  low: '#3b82f6',
  info: '#6b7280',
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
};

export default function CWESecurityScan() {
  const [, navigate] = useLocation();
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('projectId');
  const scanId = urlParams.get('scanId');

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId,
  });

  const { data: scans, isLoading: scansLoading } = useQuery<CWEScan[]>({
    queryKey: ['/api/projects', projectId, 'cwe-scans'],
    enabled: !!projectId,
  });

  const { data: currentScan, isLoading: scanLoading } = useQuery<CWEScan>({
    queryKey: ['/api/cwe-scans', scanId],
    enabled: !!scanId,
  });

  const { data: qualityMetrics, isLoading: metricsLoading } = useQuery<QualityMetrics>({
    queryKey: ['/api/projects', projectId, 'quality-metrics'],
    enabled: !!projectId,
  });

  const startScanMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/projects/${projectId}/cwe-scan`, 'POST', {});
    },
    onSuccess: (data: { scanId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'cwe-scans'] });
      navigate(`/cwe-security-scan?projectId=${projectId}&scanId=${data.scanId}`);
    },
  });

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
        <Alert>
          <AlertDescription>No project selected. Please select a project first.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isLoading = projectLoading || scansLoading || (scanId && scanLoading) || metricsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full" data-testid="skeleton-header" />
          <Skeleton className="h-96 w-full" data-testid="skeleton-content" />
        </div>
      </div>
    );
  }

  const latestScan = scanId ? currentScan : scans?.[0];
  const vulnerabilities = latestScan?.vulnerabilities || [];

  const filteredVulnerabilities = vulnerabilities.filter((v) => {
    if (selectedSeverity && v.severity !== selectedSeverity) return false;
    if (selectedCategory && v.category !== selectedCategory) return false;
    return true;
  });

  const severityData = [
    { name: 'Critical', value: latestScan?.criticalCount || 0, color: SEVERITY_COLORS.critical },
    { name: 'High', value: latestScan?.highCount || 0, color: SEVERITY_COLORS.high },
    { name: 'Medium', value: latestScan?.mediumCount || 0, color: SEVERITY_COLORS.medium },
    { name: 'Low', value: latestScan?.lowCount || 0, color: SEVERITY_COLORS.low },
    { name: 'Info', value: latestScan?.infoCount || 0, color: SEVERITY_COLORS.info },
  ];

  const categoryData = vulnerabilities.reduce((acc: Record<string, number>, v) => {
    acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const iso25010Data = qualityMetrics
    ? [
        { subject: 'Security', score: qualityMetrics.security },
        { subject: 'Reliability', score: qualityMetrics.reliability },
        { subject: 'Maintainability', score: qualityMetrics.maintainability },
        { subject: 'Performance', score: qualityMetrics.performanceEfficiency },
        { subject: 'Usability', score: qualityMetrics.usability },
        { subject: 'Compatibility', score: qualityMetrics.compatibility },
        { subject: 'Portability', score: qualityMetrics.portability },
        { subject: 'Functionality', score: qualityMetrics.functionalSuitability },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/home?tab=projects`)}
              data-testid="button-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white" data-testid="text-title">
                CWE Security Scan
              </h1>
              <p className="text-slate-600 dark:text-slate-400" data-testid="text-project-name">
                {project?.name}
              </p>
            </div>
          </div>
          <Button
            onClick={() => startScanMutation.mutate()}
            disabled={startScanMutation.isPending || latestScan?.status === 'running'}
            data-testid="button-start-scan"
          >
            <Play className="mr-2 h-4 w-4" />
            {latestScan?.status === 'running' ? 'Scan Running...' : 'Start New Scan'}
          </Button>
        </div>

        {latestScan?.status === 'running' && (
          <Alert data-testid="alert-scanning">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Security scan in progress... {latestScan.scannedFiles} / {latestScan.totalFiles} files scanned
              <Progress value={(latestScan.scannedFiles / latestScan.totalFiles) * 100} className="mt-2" />
            </AlertDescription>
          </Alert>
        )}

        {latestScan?.status === 'completed' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card data-testid="card-critical">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Critical
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{latestScan.criticalCount}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-high">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">High</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{latestScan.highCount}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-medium">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Medium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{latestScan.mediumCount}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-low">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Low</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{latestScan.lowCount}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-total">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {latestScan.totalVulnerabilities}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="vulnerabilities" className="w-full">
              <TabsList className="grid w-full grid-cols-3" data-testid="tabs-list">
                <TabsTrigger value="vulnerabilities" data-testid="tab-vulnerabilities">
                  Vulnerabilities
                </TabsTrigger>
                <TabsTrigger value="analytics" data-testid="tab-analytics">
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="quality" data-testid="tab-quality">
                  Quality Metrics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vulnerabilities" className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedSeverity === null ? 'default' : 'outline'}
                    onClick={() => setSelectedSeverity(null)}
                    size="sm"
                    data-testid="filter-all"
                  >
                    All ({vulnerabilities.length})
                  </Button>
                  {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedSeverity === key ? 'default' : 'outline'}
                      onClick={() => setSelectedSeverity(key)}
                      size="sm"
                      data-testid={`filter-${key}`}
                    >
                      {label} ({vulnerabilities.filter((v) => v.severity === key).length})
                    </Button>
                  ))}
                </div>

                <div className="space-y-3">
                  {filteredVulnerabilities.map((vuln, index) => (
                    <Card key={vuln.id} data-testid={`vulnerability-${index}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant="outline"
                                style={{
                                  backgroundColor: SEVERITY_COLORS[vuln.severity],
                                  color: 'white',
                                  borderColor: SEVERITY_COLORS[vuln.severity],
                                }}
                                data-testid={`badge-severity-${index}`}
                              >
                                {SEVERITY_LABELS[vuln.severity]}
                              </Badge>
                              <Badge variant="secondary" data-testid={`badge-cwe-${index}`}>
                                {vuln.cweId}
                              </Badge>
                              <Badge variant="outline" data-testid={`badge-category-${index}`}>
                                {vuln.category}
                              </Badge>
                              {vuln.owasp && (
                                <Badge variant="outline" data-testid={`badge-owasp-${index}`}>
                                  {vuln.owasp}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg" data-testid={`title-vuln-${index}`}>
                              {vuln.cweName}
                            </CardTitle>
                            <CardDescription className="mt-1" data-testid={`desc-vuln-${index}`}>
                              {vuln.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <FileCode className="h-4 w-4" />
                          <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded" data-testid={`file-path-${index}`}>
                            {vuln.filePath}
                            {vuln.lineNumber && `:${vuln.lineNumber}`}
                          </code>
                        </div>

                        {vuln.codeSnippet && (
                          <div className="bg-slate-900 dark:bg-slate-950 p-3 rounded-md overflow-x-auto">
                            <pre className="text-xs text-slate-300" data-testid={`code-snippet-${index}`}>
                              {vuln.codeSnippet}
                            </pre>
                          </div>
                        )}

                        {vuln.recommendation && (
                          <Alert data-testid={`recommendation-${index}`}>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Recommendation:</strong> {vuln.recommendation}
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {filteredVulnerabilities.length === 0 && (
                    <Card>
                      <CardContent className="pt-6 text-center text-slate-600 dark:text-slate-400">
                        <Shield className="h-12 w-12 mx-auto mb-2 text-green-600" />
                        <p data-testid="text-no-vulnerabilities">No vulnerabilities found in this category.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card data-testid="card-severity-chart">
                    <CardHeader>
                      <CardTitle>Vulnerabilities by Severity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={severityData.filter((d) => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {severityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-category-chart">
                    <CardHeader>
                      <CardTitle>Vulnerabilities by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="quality" className="space-y-4">
                {qualityMetrics && (
                  <>
                    <Card data-testid="card-overall-score">
                      <CardHeader>
                        <CardTitle>Overall Quality Score</CardTitle>
                        <CardDescription>Based on ISO 25010 Software Quality Model</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center gap-8">
                          <div className="text-center">
                            <div className="text-6xl font-bold text-blue-600" data-testid="text-overall-score">
                              {qualityMetrics.overallScore}
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 mt-2">Overall Score</p>
                          </div>
                          <div className="text-center">
                            <div
                              className="text-6xl font-bold"
                              style={{
                                color:
                                  qualityMetrics.securityGrade === 'A'
                                    ? '#10b981'
                                    : qualityMetrics.securityGrade === 'B'
                                    ? '#3b82f6'
                                    : qualityMetrics.securityGrade === 'C'
                                    ? '#f59e0b'
                                    : '#dc2626',
                              }}
                              data-testid="text-security-grade"
                            >
                              {qualityMetrics.securityGrade}
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 mt-2">Security Grade</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card data-testid="card-radar-chart">
                      <CardHeader>
                        <CardTitle>ISO 25010 Quality Characteristics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                          <RadarChart data={iso25010Data}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar name="Quality" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card data-testid="card-security-score">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Security</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{qualityMetrics.security}/100</div>
                          <Progress value={qualityMetrics.security} className="mt-2" />
                        </CardContent>
                      </Card>
                      <Card data-testid="card-reliability-score">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Reliability</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{qualityMetrics.reliability}/100</div>
                          <Progress value={qualityMetrics.reliability} className="mt-2" />
                        </CardContent>
                      </Card>
                      <Card data-testid="card-maintainability-score">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Maintainability</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{qualityMetrics.maintainability}/100</div>
                          <Progress value={qualityMetrics.maintainability} className="mt-2" />
                        </CardContent>
                      </Card>
                      <Card data-testid="card-performance-score">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{qualityMetrics.performanceEfficiency}/100</div>
                          <Progress value={qualityMetrics.performanceEfficiency} className="mt-2" />
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}

                {!qualityMetrics && (
                  <Card>
                    <CardContent className="pt-6 text-center text-slate-600 dark:text-slate-400">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                      <p data-testid="text-no-metrics">Quality metrics will be available after the first scan completes.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {!latestScan && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-semibold mb-2" data-testid="text-no-scans">No security scans yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Start your first CWE security scan to identify vulnerabilities in your codebase.
              </p>
              <Button onClick={() => startScanMutation.mutate()} disabled={startScanMutation.isPending} data-testid="button-start-first-scan">
                <Play className="mr-2 h-4 w-4" />
                Start Security Scan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
