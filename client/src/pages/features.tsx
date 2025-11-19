import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  TrendingUp, 
  Database, 
  Shield, 
  Code, 
  GitBranch, 
  AlertTriangle,
  Cloud,
  Zap,
  DollarSign,
  FileCode,
  Lock,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Brain,
  Workflow,
  Package,
  Settings,
  Download
} from "lucide-react";

export default function FeaturesPage() {
  const exportToHTML = () => {
    const content = document.getElementById('features-content');
    if (!content) return;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Automated Dependency Mapping Tool - Code Lens</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        h1, h2, h3 { color: #2563eb; }
        .badge { display: inline-block; padding: 4px 12px; background: #e2e8f0; border-radius: 4px; margin: 4px; }
        .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .card-header { border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
        ul { list-style-type: none; padding-left: 0; }
        li:before { content: "✓ "; color: #10b981; font-weight: bold; }
    </style>
</head>
<body>
    ${content.innerHTML}
</body>
</html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'automated-dependency-mapping-tool.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8" id="features-content">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Automated Dependency Mapping Tool
            </h1>
            <Button 
              onClick={exportToHTML}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              data-testid="button-export-html"
            >
              <Download className="h-4 w-4" />
              Export HTML
            </Button>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Enterprise Application Intelligence Platform for POD→POA Migration Analysis
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Badge variant="secondary" className="px-4 py-1">Java</Badge>
            <Badge variant="secondary" className="px-4 py-1">Python</Badge>
            <Badge variant="secondary" className="px-4 py-1">PySpark</Badge>
            <Badge variant="secondary" className="px-4 py-1">Mainframe</Badge>
            <Badge variant="secondary" className="px-4 py-1">C#</Badge>
            <Badge variant="secondary" className="px-4 py-1">Kotlin</Badge>
          </div>
        </div>

        {/* Main Feature Categories */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Category 1: Scanner Features */}
          <Card className="border-2 border-blue-200 dark:border-blue-900 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">1. POD Dependency Scanner</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Identifies dependencies within POD integrations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Multi-Language Code Parsing */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">Multi-Language Code Parsing</h3>
                </div>
                <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Java analyzer (Spring Boot, JPA, Hibernate, REST controllers)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Python analyzer (Django, Flask, FastAPI frameworks)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>PySpark analyzer (DataFrame operations, job orchestration)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Mainframe analyzer (COBOL, JCL batch processing)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>C# and Kotlin support</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Dependency Graph Analysis */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">Dependency Graph Analysis</h3>
                </div>
                <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Automatic dependency extraction between classes and modules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Component relationship mapping (call graphs)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Database entity relationship detection from ORM annotations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>API endpoint dependency tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Library and framework dependency identification</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Demographic Field Scanner */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">Demographic Field Scanner</h3>
                </div>
                <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Pattern-based detection of sensitive data (SSN, credit cards, email, phone)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Excel field mapping analysis for data migration tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>File-level and line-level location tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Context extraction (which functions/classes access sensitive data)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Compliance risk scoring based on demographic field count</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Quality & Security Analysis */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">Quality & Security Analysis</h3>
                </div>
                <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>ISO-5055 quality metrics (reliability, security, maintainability)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>CWE vulnerability detection (SQL injection, XSS, buffer overflow)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Code complexity measurement and technical debt estimation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Cyclomatic complexity analysis</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Component Impact Analysis */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">Component Impact Analysis</h3>
                </div>
                <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Tracks which specific files contain demographic data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Identifies functions and classes that access sensitive fields</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Dependency chain analysis (dependsOn, usedBy relationships)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Migration priority assignment (CRITICAL/HIGH/MEDIUM/LOW)</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Category 2: Migration Path Features */}
          <Card className="border-2 border-purple-200 dark:border-purple-900 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">2. POA Migration Suggester</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Suggests migration paths to POA
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* AI-Powered Migration Strategy */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-lg">AI-Powered Migration Strategy</h3>
                </div>
                <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Multiple AI model support (OpenAI GPT-4o, Ollama local models)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Custom prompt input for user-specific migration requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Strategic migration pattern recommendations (Strangler Fig, Phased, Big Bang)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>AI reasoning for recommended approach based on POD analysis</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* POA Architecture Recommendations */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-lg">POA Architecture Recommendations</h3>
                </div>
                <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Microservices decomposition suggestions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Cloud-native architecture patterns (AWS, Azure, GCP)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Serverless computing recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Event-driven architecture patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>API Gateway and service mesh integration</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Technology Stack Modernization */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-lg">Technology Stack Modernization</h3>
                </div>
                <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Language upgrade paths (Java 8 → Java 21, Python 2 → Python 3)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Framework migration suggestions (Spring Boot, Node.js, .NET Core)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Database modernization (Oracle → PostgreSQL, on-premise → cloud DBs)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Cloud platform recommendations with service mappings</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Phased Migration Roadmap */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-lg">Phased Migration Roadmap</h3>
                </div>
                <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Multi-phase migration plans (typically 3-4 phases over 6 months)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Service-by-service extraction prioritization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Effort estimation (person-months per phase)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Timeline and deliverables for each phase</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Dependency-aware sequencing</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Demographic Data Migration Strategy */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-lg">Demographic Data Migration Strategy</h3>
                </div>
                <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Security-first data migration approach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Encryption strategies (AES-256-GCM with cloud KMS)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>PCI-DSS tokenization for payment data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>PII vault microservice architecture</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>GDPR/HIPAA/PCI-DSS compliance features</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Pseudo Code Transformation Examples */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-lg">Pseudo Code Transformation Examples</h3>
                </div>
                <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Before/after code snippets for demographic field handling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>SSN encryption transformation examples</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Credit card tokenization code patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Email PII isolation to dedicated microservices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Security enhancement recommendations per transformation</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Cost-Benefit Analysis */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-lg">Cost-Benefit Analysis</h3>
                </div>
                <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>POD annual operating cost estimation (infrastructure, licenses)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>POA projected costs (cloud services, pay-as-you-go pricing)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Migration investment calculation (development, tools, training)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>ROI break-even analysis and annual savings projections</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Risk Management */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-lg">Risk Management</h3>
                </div>
                <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Automated risk identification (security, compliance, data loss)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Impact assessment with mitigation strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Breaking cyclic dependencies recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Zero-downtime migration strategies</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Professional Reporting */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-lg">Professional Reporting</h3>
                </div>
                <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>PDF report generation with corporate branding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Interactive visual diagrams (dependency graphs, architecture)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Executive summary with key metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Swagger API documentation</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Migration Flow Diagram */}
        <Card className="border-2 border-green-200 dark:border-green-900 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-green-600" />
              Complete POD→POA Migration Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold">1. Upload & Scan</h4>
                <p className="text-sm text-muted-foreground">
                  Upload ZIP or connect GitHub repository
                </p>
              </div>
              
              <ArrowRight className="h-8 w-8 text-muted-foreground rotate-90 md:rotate-0" />
              
              <div className="flex-1 text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold">2. Analyze Dependencies</h4>
                <p className="text-sm text-muted-foreground">
                  Extract POD architecture & dependencies
                </p>
              </div>
              
              <ArrowRight className="h-8 w-8 text-muted-foreground rotate-90 md:rotate-0" />
              
              <div className="flex-1 text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <Brain className="h-8 w-8 text-yellow-600" />
                </div>
                <h4 className="font-semibold">3. AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Generate POA migration recommendations
                </p>
              </div>
              
              <ArrowRight className="h-8 w-8 text-muted-foreground rotate-90 md:rotate-0" />
              
              <div className="flex-1 text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold">4. Migration Plan</h4>
                <p className="text-sm text-muted-foreground">
                  Phased roadmap with cost analysis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Powered by enterprise-grade AI models and multi-language code analysis
          </p>
        </div>
      </div>
    </div>
  );
}
