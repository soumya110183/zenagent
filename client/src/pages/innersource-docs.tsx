import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Code, 
  GitBranch, 
  Shield, 
  Database, 
  Brain,
  Zap,
  BarChart3,
  CheckCircle2,
  Book,
  Workflow,
  Search,
  Cloud,
  Lock,
  DollarSign,
  AlertTriangle,
  Package,
  FileCode,
  Settings,
  TrendingUp,
  Award,
  Network,
  Cpu,
  Users,
  Bot,
  Target,
  Sparkles,
  Download
} from "lucide-react";

export default function InnersourceDocsPage() {
  const exportToHTML = () => {
    const content = document.getElementById('innersource-content');
    if (!content) return;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Innersource Documentation Generator - Code Lens</title>
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
    a.download = 'innersource-documentation-generator.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8" id="innersource-content">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Book className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Innersource Documentation Generator
            </h1>
            <Button 
              onClick={exportToHTML}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 ml-4"
              data-testid="button-export-html"
            >
              <Download className="h-4 w-4" />
              Export HTML
            </Button>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Automate creation of delivery teams' documentation based on their code base
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Badge variant="secondary" className="px-4 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="secondary" className="px-4 py-1">
              <Zap className="h-3 w-3 mr-1" />
              Automated
            </Badge>
            <Badge variant="secondary" className="px-4 py-1">
              <FileText className="h-3 w-3 mr-1" />
              Comprehensive
            </Badge>
          </div>
        </div>

        {/* What is it? */}
        <Card className="border-2 border-blue-200 dark:border-blue-900 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              What is Innersource Documentation Generator?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              The Innersource Documentation Generator is an intelligent automation tool that analyzes your team's codebase 
              and automatically generates comprehensive, accurate, and up-to-date technical documentation. By leveraging 
              AI-powered code analysis, it eliminates manual documentation effort while ensuring consistency across delivery teams.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <Bot className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-semibold mb-1">AI-Driven Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Uses advanced AI models to understand code structure, dependencies, and architecture
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                <Zap className="h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-semibold mb-1">Zero Manual Effort</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically generates documentation from source code without manual intervention
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-semibold mb-1">Team Collaboration</h4>
                <p className="text-sm text-muted-foreground">
                  Enables knowledge sharing across delivery teams with standardized documentation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Features */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">
            Comprehensive Code Lens Features
          </h2>
          
          {/* Multi-Language Support */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-indigo-600" />
                Multi-Language Code Analysis
              </CardTitle>
              <CardDescription>Support for enterprise programming languages and frameworks</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Java Ecosystem
                  </h4>
                  <ul className="ml-6 space-y-1 text-sm text-muted-foreground">
                    <li>• Spring Boot, JPA, Hibernate frameworks</li>
                    <li>• REST API controllers and services</li>
                    <li>• Repository pattern detection</li>
                    <li>• Annotation-based configuration analysis</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Python Frameworks
                  </h4>
                  <ul className="ml-6 space-y-1 text-sm text-muted-foreground">
                    <li>• Django, Flask, FastAPI detection</li>
                    <li>• ORM model extraction</li>
                    <li>• API route documentation</li>
                    <li>• Decorator pattern analysis</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    PySpark & Big Data
                  </h4>
                  <ul className="ml-6 space-y-1 text-sm text-muted-foreground">
                    <li>• DataFrame operations tracking</li>
                    <li>• Job orchestration flow analysis</li>
                    <li>• Data transformation pipeline detection</li>
                    <li>• Spark SQL query extraction</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Mainframe & Legacy
                  </h4>
                  <ul className="ml-6 space-y-1 text-sm text-muted-foreground">
                    <li>• COBOL program analysis</li>
                    <li>• JCL batch processing documentation</li>
                    <li>• Legacy system integration patterns</li>
                    <li>• Copybook structure extraction</li>
                  </ul>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex gap-2 flex-wrap">
                <Badge>C#</Badge>
                <Badge>Kotlin</Badge>
                <Badge>JavaScript</Badge>
                <Badge>TypeScript</Badge>
                <Badge>And more...</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Architecture Analysis */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-purple-600" />
                Automated Architecture Documentation
              </CardTitle>
              <CardDescription>Intelligent extraction of system architecture and design patterns</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <GitBranch className="h-6 w-6 text-purple-600 mb-2" />
                  <h4 className="font-semibold mb-2">Dependency Graphs</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Class-to-class dependencies</li>
                    <li>• Module relationships</li>
                    <li>• API endpoint call chains</li>
                    <li>• Database entity relationships</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <Cpu className="h-6 w-6 text-purple-600 mb-2" />
                  <h4 className="font-semibold mb-2">Design Patterns</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• MVC/MVVM pattern detection</li>
                    <li>• Repository pattern analysis</li>
                    <li>• Factory/Builder patterns</li>
                    <li>• Singleton and dependency injection</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <Cloud className="h-6 w-6 text-purple-600 mb-2" />
                  <h4 className="font-semibold mb-2">Architecture Styles</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Monolithic vs Microservices</li>
                    <li>• Layered architecture detection</li>
                    <li>• Event-driven patterns</li>
                    <li>• Service-oriented architecture</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality & Security */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Quality Metrics & Security Analysis
              </CardTitle>
              <CardDescription>Automated code quality assessment and vulnerability detection</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    ISO-5055 Quality Metrics
                  </h4>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Reliability score (0-100)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Security vulnerability index</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Maintainability assessment</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Performance efficiency metrics</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Technical debt estimation</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    CWE Security Scanning
                  </h4>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>SQL injection vulnerabilities (CWE-89)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Cross-site scripting (CWE-79)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Buffer overflow detection (CWE-120)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Authentication vulnerabilities (CWE-287)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Insecure deserialization (CWE-502)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Compliance */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-yellow-600" />
                Demographic Data Compliance Scanner
              </CardTitle>
              <CardDescription>Automated PII/sensitive data detection and compliance tracking</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Sensitive Data Detection</h4>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Social Security Numbers (SSN)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Credit card numbers (PCI-DSS)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Email addresses and phone numbers</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Dates of birth and personal identifiers</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Excel field mapping for data migration</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Compliance Features</h4>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>File and line-level location tracking</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Context extraction (functions/classes accessing PII)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>GDPR/HIPAA/PCI-DSS risk scoring</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Migration priority assignment (CRITICAL/HIGH/MEDIUM/LOW)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Compliance audit trail documentation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Analysis Reports */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Comprehensive Analysis Reports
              </CardTitle>
              <CardDescription>Detailed technical analysis and documentation reports</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <Brain className="h-6 w-6 text-green-600 mb-2" />
                  <h4 className="font-semibold mb-2">AI-Powered Insights</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Project overview and summary</li>
                    <li>• Architecture analysis and patterns</li>
                    <li>• Code quality assessment</li>
                    <li>• Actionable recommendations</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <Network className="h-6 w-6 text-green-600 mb-2" />
                  <h4 className="font-semibold mb-2">Dependency Mapping</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Complete dependency graphs</li>
                    <li>• Component relationship visualization</li>
                    <li>• Call chain analysis</li>
                    <li>• Cyclic dependency detection</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <FileText className="h-6 w-6 text-green-600 mb-2" />
                  <h4 className="font-semibold mb-2">API Documentation</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Swagger/OpenAPI specifications</li>
                    <li>• REST endpoint documentation</li>
                    <li>• Request/response schemas</li>
                    <li>• Authentication methods</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <Code className="h-6 w-6 text-green-600 mb-2" />
                  <h4 className="font-semibold mb-2">Code Documentation</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Class and method documentation</li>
                    <li>• Code complexity metrics</li>
                    <li>• Function signatures and parameters</li>
                    <li>• Usage examples</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <Database className="h-6 w-6 text-green-600 mb-2" />
                  <h4 className="font-semibold mb-2">Data Model Documentation</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Entity relationship diagrams</li>
                    <li>• Database schema documentation</li>
                    <li>• Field descriptions and constraints</li>
                    <li>• Data flow diagrams</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <Award className="h-6 w-6 text-green-600 mb-2" />
                  <h4 className="font-semibold mb-2">Quality Reports</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• ISO-5055 compliance scores</li>
                    <li>• Technical debt metrics</li>
                    <li>• Code coverage analysis</li>
                    <li>• Best practice adherence</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced AI Agents */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-cyan-600" />
                Enterprise AI Agents
              </CardTitle>
              <CardDescription>Specialized AI agents for advanced code intelligence</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Search className="h-5 w-5 text-cyan-600" />
                    ZenVector Agent - Vector Database Intelligence
                  </h4>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>ChromaDB persistent vector storage</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Code similarity detection and semantic search</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>HuggingFace CodeBERT for code quality analysis</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Langfuse LLM monitoring and tracing</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Book className="h-5 w-5 text-cyan-600" />
                    Knowledge Agent - Document Intelligence
                  </h4>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Confluence integration for document scraping</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>IBM Doclinq for PDF processing</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>LangChain document processing & Q&A</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Context-aware chat interface with memory</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Reporting */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-600" />
                Professional Documentation Output
              </CardTitle>
              <CardDescription>Enterprise-grade documentation generation and export</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">PDF Report Generation</h4>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Corporate branding and logo integration</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Executive summary with key metrics</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Detailed technical analysis sections</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Interactive table of contents</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Visual Diagrams</h4>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Interactive dependency graphs</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>UML-style architecture diagrams</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Data flow visualizations</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Swagger API documentation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Methods */}
        <Card className="border-2 border-green-200 dark:border-green-900 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-green-600" />
              How Teams Use Innersource Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <FileCode className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold">1. Upload Code</h4>
                <p className="text-sm text-muted-foreground">
                  Upload ZIP or connect GitHub repository with your team's codebase
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold">2. AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  AI automatically analyzes architecture, dependencies, and patterns
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-yellow-600" />
                </div>
                <h4 className="font-semibold">3. Generate Docs</h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive documentation automatically generated with diagrams
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold">4. Share & Collaborate</h4>
                <p className="text-sm text-muted-foreground">
                  Export PDFs and share knowledge across delivery teams
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="border-2 border-blue-200 dark:border-blue-900 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardTitle className="text-2xl">Key Benefits for Delivery Teams</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <Zap className="h-5 w-5" />
                  <h4 className="font-semibold">Time Savings</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Eliminate 80% of manual documentation effort. Focus developers on coding instead of writing docs.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <h4 className="font-semibold">Accuracy</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Documentation always reflects actual code. No outdated or incorrect information from manual updates.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <Users className="h-5 w-5" />
                  <h4 className="font-semibold">Knowledge Sharing</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Standardized documentation format enables easy knowledge transfer between teams and new developers.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-yellow-600">
                  <Lock className="h-5 w-5" />
                  <h4 className="font-semibold">Compliance</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatic tracking of PII/sensitive data helps teams meet GDPR, HIPAA, and PCI-DSS requirements.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <Shield className="h-5 w-5" />
                  <h4 className="font-semibold">Security</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automated vulnerability detection and security best practices documentation for safer code.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-600">
                  <BarChart3 className="h-5 w-5" />
                  <h4 className="font-semibold">Complete Analysis</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Comprehensive code analysis reports with quality metrics, dependencies, and architecture documentation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Powered by Code Lens - Enterprise Application Intelligence Platform
          </p>
        </div>
      </div>
    </div>
  );
}
