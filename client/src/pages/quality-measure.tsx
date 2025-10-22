import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Github, 
  Award, 
  TrendingUp, 
  Shield, 
  Zap, 
  RefreshCw,
  FileCode,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Info,
  Download
} from 'lucide-react';
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
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// ISO 25010 Software Quality Checklist Data
const ISO25010_CHECKLIST = [
  // Maintainability
  { category: "Maintainability", cwe: "CWE-407", descriptor: "Algorithmic Complexity", description: "Algorithm has inefficient worst-case complexity that can degrade system performance or be exploited by crafted input." },
  { category: "Maintainability", cwe: "CWE-478", descriptor: "Missing Default Case in Switch Statement", description: "Lack of default case in switch may lead to logical errors." },
  { category: "Maintainability", cwe: "CWE-480", descriptor: "Use of Incorrect Operator", description: "Wrong operator alters program logic." },
  { category: "Maintainability", cwe: "CWE-484", descriptor: "Omitted Break Statement in Switch", description: "Missing break executes unintended code blocks." },
  { category: "Maintainability", cwe: "CWE-561", descriptor: "Dead Code", description: "Contains code that never executes (threshold 5%)." },
  { category: "Maintainability", cwe: "CWE-570", descriptor: "Expression is Always False", description: "Expression always evaluates to false." },
  { category: "Maintainability", cwe: "CWE-571", descriptor: "Expression is Always True", description: "Expression always evaluates to true." },
  { category: "Maintainability", cwe: "CWE-783", descriptor: "Operator Precedence Logic Error", description: "Operator precedence causes incorrect logic." },
  { category: "Maintainability", cwe: "CWE-1041", descriptor: "Use of Redundant Code (Copy-Paste)", description: "Duplicated code fragments reduce maintainability." },
  { category: "Maintainability", cwe: "CWE-1045", descriptor: "Parent Class with Virtual Destructor and Child without", description: "Destructor mismatch between parent and child class." },
  { category: "Maintainability", cwe: "CWE-1047", descriptor: "Modules with Circular Dependencies", description: "Modules depend cyclically on each other." },
  { category: "Maintainability", cwe: "CWE-1048", descriptor: "Invokable Control Element with Large Fan-out", description: "Function calls too many external components (>5)." },
  { category: "Maintainability", cwe: "CWE-1051", descriptor: "Initialization with Hard-Coded Network Resource", description: "Hard-coded network identifiers limit reusability." },
  { category: "Maintainability", cwe: "CWE-1052", descriptor: "Excessive Hard-Coded Literals in Initialization", description: "Too many fixed literals make code inflexible." },
  { category: "Maintainability", cwe: "CWE-1054", descriptor: "Layer-Skipping Call", description: "Function bypasses designed architectural layers." },
  { category: "Maintainability", cwe: "CWE-1055", descriptor: "Multiple Inheritance from Concrete Classes", description: "Multiple inheritance increases complexity." },
  { category: "Maintainability", cwe: "CWE-1062", descriptor: "Parent Class References Child", description: "Breaks encapsulation and modularity." },
  { category: "Maintainability", cwe: "CWE-1064", descriptor: "Signature with Excessive Parameters", description: "Method has >7 parameters, reducing readability." },
  { category: "Maintainability", cwe: "CWE-1074", descriptor: "Excessive Inheritance Depth", description: "Deep inheritance (>7 levels) reduces understandability." },
  { category: "Maintainability", cwe: "CWE-1075", descriptor: "Unconditional Goto outside Switch", description: "Poor structured control flow." },
  { category: "Maintainability", cwe: "CWE-1079", descriptor: "Parent without Virtual Destructor", description: "Can lead to memory leaks." },
  { category: "Maintainability", cwe: "CWE-1080", descriptor: "Source File Too Large", description: "File exceeds 1000 lines of code." },
  { category: "Maintainability", cwe: "CWE-1084", descriptor: "Excessive File/Data Access Operations", description: "Too many file or data accesses (>7)." },
  { category: "Maintainability", cwe: "CWE-1085", descriptor: "Excessive Commented-Out Code", description: "Commented code exceeds 2%." },
  { category: "Maintainability", cwe: "CWE-1086", descriptor: "Too Many Child Classes", description: "Class has >10 children." },
  { category: "Maintainability", cwe: "CWE-1087", descriptor: "Virtual Method without Virtual Destructor", description: "Virtual function lacks destructor match." },
  { category: "Maintainability", cwe: "CWE-1090", descriptor: "Cross-Class Member Access", description: "Violates encapsulation." },
  { category: "Maintainability", cwe: "CWE-1095", descriptor: "Loop Condition Updated Inside Loop", description: "Loop modifies control condition." },
  { category: "Maintainability", cwe: "CWE-1121", descriptor: "Excessive Cyclomatic Complexity", description: "McCabe complexity exceeds 20." },
  // Performance Efficiency
  { category: "Performance Efficiency", cwe: "CWE-404", descriptor: "Improper Resource Shutdown", description: "Resource not released correctly." },
  { category: "Performance Efficiency", cwe: "CWE-401", descriptor: "Memory Leak", description: "Memory not freed after use." },
  { category: "Performance Efficiency", cwe: "CWE-772", descriptor: "Missing Resource Release", description: "Resource not released after lifetime." },
  { category: "Performance Efficiency", cwe: "CWE-775", descriptor: "Missing File Handle Release", description: "File descriptor not closed, leading to DoS." },
  { category: "Performance Efficiency", cwe: "CWE-424", descriptor: "Improper Protection of Alternate Path", description: "Alternate access paths not secured." },
  { category: "Performance Efficiency", cwe: "CWE-1042", descriptor: "Static Member Outside Singleton", description: "Static element used in non-singleton context." },
  { category: "Performance Efficiency", cwe: "CWE-1043", descriptor: "Data Element with Too Many Non-Primitive Children", description: "Too many complex child objects (>5)." },
  { category: "Performance Efficiency", cwe: "CWE-1046", descriptor: "Inefficient String Concatenation", description: "String concatenation instead of buffer object." },
  { category: "Performance Efficiency", cwe: "CWE-1049", descriptor: "Excessive Joins/Subqueries", description: "Too many joins/subqueries (>5/3)." },
  { category: "Performance Efficiency", cwe: "CWE-1050", descriptor: "Resource Consumption in Loop", description: "Loop consumes platform resources repeatedly." },
  { category: "Performance Efficiency", cwe: "CWE-1057", descriptor: "Data Access Outside Data Manager", description: "Data accessed without central manager." },
  { category: "Performance Efficiency", cwe: "CWE-1060", descriptor: "Too Many Server-Side Queries", description: "Excessive data queries (>5)." },
  { category: "Performance Efficiency", cwe: "CWE-1067", descriptor: "Sequential Search on Large Table", description: "Query without index (>500 rows)." },
  { category: "Performance Efficiency", cwe: "CWE-1072", descriptor: "No Connection Pooling", description: "Database access lacks pooling." },
  { category: "Performance Efficiency", cwe: "CWE-1073", descriptor: "Non-SQL Function with Too Many Data Accesses", description: "Too many direct queries (>2)." },
  { category: "Performance Efficiency", cwe: "CWE-1089", descriptor: "Large Table with Too Many Indices", description: "Table has >3 indices." },
  { category: "Performance Efficiency", cwe: "CWE-1091", descriptor: "Object Used Without Destructor", description: "Destructor not invoked." },
  { category: "Performance Efficiency", cwe: "CWE-1094", descriptor: "Excessive Index Range Scan", description: "Index scan covers too many rows (>10)." },
  { category: "Performance Efficiency", cwe: "CWE-119", descriptor: "Memory Bounds Violation", description: "Read/write outside buffer." },
  { category: "Performance Efficiency", cwe: "CWE-120", descriptor: "Buffer Overflow", description: "Input exceeds buffer size." },
  { category: "Performance Efficiency", cwe: "CWE-125", descriptor: "Out-of-Bounds Read", description: "Reads beyond buffer boundary." },
  { category: "Performance Efficiency", cwe: "CWE-476", descriptor: "NULL Pointer Dereference", description: "Pointer expected valid but is NULL." },
  { category: "Performance Efficiency", cwe: "CWE-562", descriptor: "Return of Stack Variable", description: "Returns address of local variable." },
  { category: "Performance Efficiency", cwe: "CWE-662", descriptor: "Improper Synchronization", description: "Shared resource not properly synchronized." },
  { category: "Performance Efficiency", cwe: "CWE-833", descriptor: "Deadlock", description: "Threads waiting indefinitely." },
  { category: "Performance Efficiency", cwe: "CWE-835", descriptor: "Infinite Loop", description: "Loop exit condition unreachable." },
  { category: "Performance Efficiency", cwe: "CWE-908", descriptor: "Uninitialized Resource", description: "Resource used before initialization." },
  { category: "Performance Efficiency", cwe: "CWE-703", descriptor: "Improper Exception Handling", description: "Errors not properly managed." },
  { category: "Performance Efficiency", cwe: "CWE-682", descriptor: "Incorrect Calculation", description: "Miscomputed values affect logic." },
  { category: "Performance Efficiency", cwe: "CWE-22", descriptor: "Path Traversal", description: "Path manipulation escapes restricted directory." },
  { category: "Performance Efficiency", cwe: "CWE-77", descriptor: "Command Injection", description: "Unneutralized input used in system command." },
  { category: "Performance Efficiency", cwe: "CWE-79", descriptor: "Cross-Site Scripting (XSS)", description: "Input reflected in HTML output." },
  { category: "Performance Efficiency", cwe: "CWE-89", descriptor: "SQL Injection", description: "Improperly escaped SQL statements." },
  { category: "Performance Efficiency", cwe: "CWE-90", descriptor: "LDAP Injection", description: "Unsafe LDAP query composition." },
  { category: "Performance Efficiency", cwe: "CWE-91", descriptor: "XML Injection", description: "XML data not properly neutralized." },
  { category: "Performance Efficiency", cwe: "CWE-502", descriptor: "Deserialization of Untrusted Data", description: "Untrusted input used in object deserialization." },
  { category: "Performance Efficiency", cwe: "CWE-611", descriptor: "XXE Injection", description: "XML entities access external resources." },
  { category: "Performance Efficiency", cwe: "CWE-643", descriptor: "XPath Injection", description: "Unchecked dynamic XPath expressions." },
  { category: "Performance Efficiency", cwe: "CWE-798", descriptor: "Hard-Coded Credentials", description: "Credentials embedded in code." },
  { category: "Performance Efficiency", cwe: "CWE-789", descriptor: "Uncontrolled Memory Allocation", description: "Unvalidated memory allocation size." },
  { category: "Performance Efficiency", cwe: "CWE-732", descriptor: "Incorrect Permission Assignment", description: "Improper file or resource permissions." },
  { category: "Performance Efficiency", cwe: "CWE-778", descriptor: "Insufficient Logging", description: "Missing or incomplete security event logging." },
  { category: "Performance Efficiency", cwe: "CWE-917", descriptor: "Expression Language Injection", description: "JSP/EL statement with unneutralized input." },
];

interface QualityMetrics {
  reliability: number;
  security: number;
  performance: number;
  maintainability: number;
  overallScore: number;
}

interface QualityAnalysisReport {
  projectId: string;
  projectName: string;
  language: string;
  metrics: QualityMetrics;
  issues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  details: {
    reliability: {
      score: number;
      issues: Array<{ severity: string; description: string; file: string; line: number }>;
    };
    security: {
      score: number;
      issues: Array<{ severity: string; description: string; file: string; line: number }>;
    };
    performance: {
      score: number;
      issues: Array<{ severity: string; description: string; file: string; line: number }>;
    };
    maintainability: {
      score: number;
      issues: Array<{ severity: string; description: string; file: string; line: number }>;
    };
  };
  scanDate: string;
}

interface CWERule {
  id: string;
  name: string;
  cweId: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  owasp?: string;
  description: string;
  recommendation: string;
  impact?: string;
  languages: string[];
  confidence: 'high' | 'medium' | 'low';
}

export default function QualityMeasure() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState('https://github.com/kartik1502/Spring-Boot-Microservices-Banking-Application');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('java');
  const [analysisReport, setAnalysisReport] = useState<QualityAnalysisReport | null>(null);
  const [iso25010Filter, setIso25010Filter] = useState<string>('all');
  const { toast } = useToast();

  const { data: cweRules, isLoading: rulesLoading } = useQuery<CWERule[]>({
    queryKey: ['/api/cwe-rules'],
  });

  const filteredISO25010 = iso25010Filter === 'all'
    ? ISO25010_CHECKLIST
    : ISO25010_CHECKLIST.filter(item => item.category === iso25010Filter);

  const uploadMutation = useMutation({
    mutationFn: async (data: { file?: File; githubUrl?: string; language: string }) => {
      const formData = new FormData();
      if (data.file) {
        formData.append('file', data.file);
      }
      if (data.githubUrl) {
        formData.append('githubUrl', data.githubUrl);
      }
      formData.append('language', data.language);

      const response = await fetch('/api/quality-measure/analyze', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to analyze code quality');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisReport(data.report);
      toast({
        title: 'Analysis Complete',
        description: 'ISO 5055 quality analysis completed successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze code quality',
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 50MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      setGithubUrl('');
    }
  };

  const handleGithubUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGithubUrl(e.target.value);
    setSelectedFile(null);
  };

  const handleAnalyze = () => {
    if (!selectedLanguage) {
      toast({
        title: 'Language Required',
        description: 'Please select a programming language',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedFile && !githubUrl) {
      toast({
        title: 'Source Required',
        description: 'Please upload a ZIP file or provide a GitHub URL',
        variant: 'destructive',
      });
      return;
    }

    uploadMutation.mutate({
      file: selectedFile || undefined,
      githubUrl: githubUrl || undefined,
      language: selectedLanguage,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Quality Measure</h1>
        </div>
        <p className="text-gray-600">ISO 5055 - Automated Source Code Quality Measurement</p>
        <Badge variant="outline" className="mt-2">
          ISO/IEC 5055:2021 Compliant
        </Badge>
      </div>

      {/* Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Source Code Upload</CardTitle>
          <CardDescription>
            Upload your codebase as ZIP file or import from GitHub repository for ISO 5055 quality analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="zip" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="zip">
                <Upload className="w-4 h-4 mr-2" />
                ZIP Upload
              </TabsTrigger>
              <TabsTrigger value="github">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </TabsTrigger>
            </TabsList>

            <TabsContent value="zip" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zip-file">Upload ZIP File (max 50MB)</Label>
                <Input
                  id="zip-file"
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  data-testid="input-zip-file"
                />
                {selectedFile && (
                  <p className="text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    {selectedFile.name} selected
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="github" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github-url">GitHub Repository URL</Label>
                <Input
                  id="github-url"
                  type="url"
                  placeholder="https://github.com/username/repository"
                  value={githubUrl}
                  onChange={handleGithubUrlChange}
                  data-testid="input-github-url"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Language Selector */}
          <div className="mt-6 space-y-2">
            <Label htmlFor="language">Programming Language</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger id="language" data-testid="select-language">
                <SelectValue placeholder="Select programming language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript / TypeScript</SelectItem>
                <SelectItem value="csharp">C#</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="kotlin">Kotlin</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="ruby">Ruby</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Analyze Button */}
          <Button
            className="mt-6 w-full"
            size="lg"
            onClick={handleAnalyze}
            disabled={uploadMutation.isPending}
            data-testid="button-analyze"
          >
            {uploadMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Run ISO 5055 Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ISO 5055 Information */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            About ISO/IEC 5055
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-4">
            ISO/IEC 5055:2021 is an international standard for automated source code quality measurement. 
            It defines measures for four key quality characteristics:
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 text-blue-600" />
              <div>
                <strong>Reliability:</strong> Measures the capability of software to maintain a specified level of performance
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 text-blue-600" />
              <div>
                <strong>Security:</strong> Assesses protection against unauthorized access and data breaches
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Zap className="w-4 h-4 mt-0.5 text-blue-600" />
              <div>
                <strong>Performance Efficiency:</strong> Evaluates resource utilization and response time
              </div>
            </li>
            <li className="flex items-start gap-2">
              <RefreshCw className="w-4 h-4 mt-0.5 text-blue-600" />
              <div>
                <strong>Maintainability:</strong> Measures ease of modification and enhancement
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisReport && (
        <>
          {/* Quality Score Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Overall Score */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Overall Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">
                  {analysisReport.metrics.overallScore}
                </div>
                <p className="text-xs text-gray-500 mt-1">Out of 100</p>
                <Progress value={analysisReport.metrics.overallScore} className="mt-2" />
              </CardContent>
            </Card>

            {/* Reliability */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Reliability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(analysisReport.metrics.reliability)}`}>
                  {analysisReport.metrics.reliability}
                </div>
                <Progress value={analysisReport.metrics.reliability} className="mt-2" />
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(analysisReport.metrics.security)}`}>
                  {analysisReport.metrics.security}
                </div>
                <Progress value={analysisReport.metrics.security} className="mt-2" />
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(analysisReport.metrics.performance)}`}>
                  {analysisReport.metrics.performance}
                </div>
                <Progress value={analysisReport.metrics.performance} className="mt-2" />
              </CardContent>
            </Card>

            {/* Maintainability */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Maintainability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(analysisReport.metrics.maintainability)}`}>
                  {analysisReport.metrics.maintainability}
                </div>
                <Progress value={analysisReport.metrics.maintainability} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Issues Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Issues Summary</CardTitle>
              <CardDescription>Total issues found by severity level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-3xl font-bold text-red-600">{analysisReport.issues.critical}</div>
                  <div className="text-sm text-red-800 mt-1">Critical</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-3xl font-bold text-orange-600">{analysisReport.issues.high}</div>
                  <div className="text-sm text-orange-800 mt-1">High</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-600">{analysisReport.issues.medium}</div>
                  <div className="text-sm text-yellow-800 mt-1">Medium</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">{analysisReport.issues.low}</div>
                  <div className="text-sm text-blue-800 mt-1">Low</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visualization Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics Radar Chart</CardTitle>
                <CardDescription>Comprehensive view of all quality characteristics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={[
                    { subject: 'Reliability', score: analysisReport.metrics.reliability },
                    { subject: 'Security', score: analysisReport.metrics.security },
                    { subject: 'Performance', score: analysisReport.metrics.performance },
                    { subject: 'Maintainability', score: analysisReport.metrics.maintainability },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Quality Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issues Distribution by Severity</CardTitle>
                <CardDescription>Visual representation of issue severity levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Critical', value: analysisReport.issues.critical, color: '#dc2626' },
                        { name: 'High', value: analysisReport.issues.high, color: '#ea580c' },
                        { name: 'Medium', value: analysisReport.issues.medium, color: '#f59e0b' },
                        { name: 'Low', value: analysisReport.issues.low, color: '#3b82f6' },
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Critical', value: analysisReport.issues.critical, color: '#dc2626' },
                        { name: 'High', value: analysisReport.issues.high, color: '#ea580c' },
                        { name: 'Medium', value: analysisReport.issues.medium, color: '#f59e0b' },
                        { name: 'Low', value: analysisReport.issues.low, color: '#3b82f6' },
                      ].filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quality Metrics Bar Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quality Metrics Comparison</CardTitle>
              <CardDescription>Compare all quality characteristics side by side</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Reliability', score: analysisReport.metrics.reliability },
                  { name: 'Security', score: analysisReport.metrics.security },
                  { name: 'Performance', score: analysisReport.metrics.performance },
                  { name: 'Maintainability', score: analysisReport.metrics.maintainability },
                  { name: 'Overall', score: analysisReport.metrics.overallScore },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#3b82f6" name="Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
              <CardDescription>ISO 5055 quality characteristics breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="reliability" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="reliability">Reliability</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="maintainability">Maintainability</TabsTrigger>
                </TabsList>

                {Object.entries(analysisReport.details).map(([key, value]) => (
                  <TabsContent key={key} value={key} className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold capitalize">{key}</h3>
                        <p className="text-sm text-gray-600">
                          Score: <span className={`font-bold ${getScoreColor(value.score)}`}>{value.score}</span>/100
                        </p>
                      </div>
                      <Badge variant={getScoreBadgeVariant(value.score)}>
                        {value.issues.length} Issues
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {value.issues.length === 0 ? (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            No {key} issues found. Great job!
                          </AlertDescription>
                        </Alert>
                      ) : (
                        value.issues.map((issue, idx) => (
                          <div
                            key={idx}
                            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            data-testid={`issue-${key}-${idx}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    variant={
                                      issue.severity === 'critical'
                                        ? 'destructive'
                                        : issue.severity === 'high'
                                        ? 'destructive'
                                        : issue.severity === 'medium'
                                        ? 'secondary'
                                        : 'outline'
                                    }
                                  >
                                    {issue.severity.toUpperCase()}
                                  </Badge>
                                  <span className="text-sm text-gray-600">
                                    {issue.file}:{issue.line}
                                  </span>
                                </div>
                                <p className="text-sm">{issue.description}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Export Report */}
          <Card>
            <CardHeader>
              <CardTitle>Export Report</CardTitle>
              <CardDescription>Download ISO 5055 quality analysis report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export as HTML
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export as DOC
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ISO 25010 Software Quality Checklist */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            ISO 25010 Software Quality Checklist
          </CardTitle>
          <CardDescription>
            Complete checklist of 74 CWE weaknesses mapped to ISO 25010 quality characteristics (Maintainability & Performance Efficiency)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total CWE Items</p>
                <p className="text-3xl font-bold text-purple-600">{ISO25010_CHECKLIST.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Maintainability</p>
                <p className="text-3xl font-bold text-blue-600">
                  {ISO25010_CHECKLIST.filter(item => item.category === 'Maintainability').length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Performance Efficiency</p>
                <p className="text-3xl font-bold text-green-600">
                  {ISO25010_CHECKLIST.filter(item => item.category === 'Performance Efficiency').length}
                </p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
              <Label htmlFor="category-filter">Filter by Category:</Label>
              <Select value={iso25010Filter} onValueChange={setIso25010Filter}>
                <SelectTrigger id="category-filter" className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories ({ISO25010_CHECKLIST.length})</SelectItem>
                  <SelectItem value="Maintainability">
                    Maintainability ({ISO25010_CHECKLIST.filter(item => item.category === 'Maintainability').length})
                  </SelectItem>
                  <SelectItem value="Performance Efficiency">
                    Performance Efficiency ({ISO25010_CHECKLIST.filter(item => item.category === 'Performance Efficiency').length})
                  </SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="ml-auto">
                Showing {filteredISO25010.length} of {ISO25010_CHECKLIST.length} items
              </Badge>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                        CWE #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                        Descriptor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                        Weakness Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredISO25010.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors" data-testid={`iso25010-row-${index}`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge 
                            variant={item.category === 'Maintainability' ? 'default' : 'secondary'}
                            className={item.category === 'Maintainability' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                          >
                            {item.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant="outline" className="font-mono">
                            {item.cwe}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gray-900">{item.descriptor}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{item.description}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CWE Security Rules Checklist */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5" />
            CWE Security Rules Engine (200+ Rules)
          </CardTitle>
          <CardDescription>
            Comprehensive list of Common Weakness Enumeration (CWE) rules used for security vulnerability scanning
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rulesLoading && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-gray-600">Loading CWE rules...</p>
            </div>
          )}

          {cweRules && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Rules</p>
                  <p className="text-2xl font-bold text-gray-900">{cweRules.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Critical Rules</p>
                  <p className="text-2xl font-bold text-red-600">
                    {cweRules.filter((r) => r.severity === 'critical').length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">High Rules</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {cweRules.filter((r) => r.severity === 'high').length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Languages</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {new Set(cweRules.flatMap((r) => r.languages)).size}
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {cweRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              rule.severity === 'critical' || rule.severity === 'high'
                                ? 'destructive'
                                : rule.severity === 'medium'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {rule.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{rule.cweId}</Badge>
                          <Badge variant="outline" className="bg-blue-50">
                            {rule.category}
                          </Badge>
                          {rule.owasp && (
                            <Badge variant="outline" className="bg-purple-50">
                              {rule.owasp}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Description:</p>
                        <p className="text-sm text-gray-600">{rule.description}</p>
                      </div>

                      {rule.impact && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm font-semibold text-red-900 mb-1 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Potential Impact:
                          </p>
                          <p className="text-sm text-red-800">{rule.impact}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-semibold text-gray-700">Recommendation:</p>
                        <p className="text-sm text-gray-600">{rule.recommendation}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap pt-2">
                        <p className="text-sm font-semibold text-gray-700">Languages:</p>
                        {rule.languages.map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <p className="text-sm font-semibold text-gray-700">Detection Confidence:</p>
                        <Badge
                          variant={
                            rule.confidence === 'high'
                              ? 'default'
                              : rule.confidence === 'medium'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {rule.confidence.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
