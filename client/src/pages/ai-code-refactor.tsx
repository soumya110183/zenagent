import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Code, 
  FileCode, 
  Zap, 
  Brain, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  TrendingUp,
  Network,
  Database,
  Cloud,
  GitBranch,
  FileText,
  Award,
  Lock,
  Settings,
  Layers,
  Download
} from "lucide-react";

export default function AICodeRefactor() {
  const exportToHTML = () => {
    const content = document.getElementById('refactor-content');
    if (!content) return;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Code Refactor Assistant - Code Lens</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        h1, h2, h3 { color: #9333ea; }
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
    a.download = 'ai-code-refactor-assistant.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8" id="refactor-content">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-12 w-12 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Code Refactor Assistant
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
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Use AI to refactor old integration code into Diamond-compatible templates with intelligent transformations and best practices
          </p>
        </div>

        {/* Diamond Template Format Overview */}
        <Card className="border-2 border-purple-200 dark:border-purple-900 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileCode className="h-6 w-6 text-purple-600" />
              Diamond-Compatible Template Output Format
            </CardTitle>
            <CardDescription>Standardized, enterprise-ready code structure for modernized integrations</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-600" />
                  Template Structure
                </h4>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span><strong>Modular Architecture:</strong> Separation of concerns with clean interfaces</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span><strong>Configuration-Driven:</strong> Externalized configs for flexibility</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span><strong>Error Handling:</strong> Comprehensive try-catch with logging</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span><strong>Type Safety:</strong> Strong typing with interfaces/DTOs</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span><strong>Dependency Injection:</strong> Loose coupling for testability</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Diamond Standards
                </h4>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span><strong>SOLID Principles:</strong> Single responsibility, open/closed design</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span><strong>Design Patterns:</strong> Factory, Strategy, Repository patterns</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span><strong>Code Documentation:</strong> JSDoc/JavaDoc with examples</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span><strong>Unit Test Ready:</strong> Testable code with mock points</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span><strong>Security Best Practices:</strong> Input validation, sanitization</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Features */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* AI-Powered Transformations */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI-Powered Code Transformations
              </CardTitle>
              <CardDescription>Intelligent refactoring with context-aware improvements</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Code className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Legacy Code Modernization</h4>
                    <p className="text-sm text-muted-foreground">Transform outdated patterns into modern equivalents (callbacks → async/await, spaghetti → modular)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Settings className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Design Pattern Application</h4>
                    <p className="text-sm text-muted-foreground">Automatically apply Factory, Strategy, Observer, and other patterns where appropriate</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Security Hardening</h4>
                    <p className="text-sm text-muted-foreground">Add input validation, SQL injection prevention, XSS protection, and secure authentication</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Performance Optimization</h4>
                    <p className="text-sm text-muted-foreground">Optimize database queries, add caching layers, reduce memory footprint</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Lens Integration */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-green-600" />
                Code Lens Intelligence Integration
              </CardTitle>
              <CardDescription>Leverage existing analysis for smart refactoring decisions</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Dependency Analysis Input</h4>
                    <p className="text-sm text-muted-foreground">Use Code Lens dependency graphs to identify tightly coupled code for refactoring</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Quality Metrics Guidance</h4>
                    <p className="text-sm text-muted-foreground">Prioritize refactoring based on ISO-5055 scores and technical debt metrics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Security Vulnerability Focus</h4>
                    <p className="text-sm text-muted-foreground">Target CWE-detected vulnerabilities for immediate security improvements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Demographic Data Compliance</h4>
                    <p className="text-sm text-muted-foreground">Refactor PII/sensitive data handling with encryption and tokenization</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Refactoring Capabilities */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              Comprehensive Refactoring Capabilities
            </CardTitle>
            <CardDescription>Multi-language support with intelligent code transformations</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5 text-orange-600" />
                  Code Structure
                </h4>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span>Extract methods/functions for readability</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span>Split large classes into smaller ones</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span>Rename variables for clarity</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span>Remove duplicate code blocks</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span>Eliminate dead/unreachable code</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-orange-600" />
                  Architecture Patterns
                </h4>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span>Convert monolith to microservices</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span>Apply MVC/MVVM separation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span>Implement repository pattern</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span>Add service layer abstraction</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span>Event-driven transformation</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-orange-600" />
                  Modernization
                </h4>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span>Java 8+ → Java 17+ features</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span>Python 2 → Python 3 migration</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span>REST → GraphQL conversion</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span>SOAP → REST API transformation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span>Cloud-native refactoring</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diamond Template Example Output */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-indigo-600" />
              Diamond Template Output Components
            </CardTitle>
            <CardDescription>Structured output format for refactored code</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Template Sections
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Header Documentation:</strong> Module purpose, version, author, dependencies
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Imports Section:</strong> Organized imports with comments
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Configuration:</strong> Externalized constants and configs
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Interfaces/Types:</strong> Type definitions and contracts
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Core Implementation:</strong> Main logic with single responsibility
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Error Handling:</strong> Comprehensive exception management
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Utility Functions:</strong> Helper methods and validators
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Export Statement:</strong> Public API definition
                    </div>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  Enhanced Features
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Before/After Comparison:</strong> Side-by-side original vs refactored
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Change Summary:</strong> List of transformations applied
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Improvement Metrics:</strong> Complexity reduction, coverage increase
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Testing Recommendations:</strong> Suggested unit tests for refactored code
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Migration Guide:</strong> Step-by-step integration instructions
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Dependencies Update:</strong> Required library versions and installs
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Risk Assessment:</strong> Breaking changes and mitigation strategies
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Performance Impact:</strong> Expected performance improvements
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="border-2 border-purple-200 dark:border-purple-900 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-purple-600" />
              How AI Code Refactor Works
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <FileCode className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold">1. Upload Legacy Code</h4>
                <p className="text-sm text-muted-foreground">
                  Upload old integration code or select from Code Lens analyzed projects
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold">2. AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  AI analyzes code patterns, dependencies, security issues, and quality metrics
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold">3. Diamond Transformation</h4>
                <p className="text-sm text-muted-foreground">
                  Code refactored into Diamond-compatible template with best practices
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="font-semibold">4. Review & Deploy</h4>
                <p className="text-sm text-muted-foreground">
                  Review changes, run tests, and integrate refactored code into your project
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="border-2 border-blue-200 dark:border-blue-900 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardTitle className="text-2xl">Key Benefits</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <Zap className="h-5 w-5" />
                  <h4 className="font-semibold">Speed & Efficiency</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Refactor thousands of lines in minutes instead of weeks. AI handles the heavy lifting.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <h4 className="font-semibold">Consistency</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Diamond templates ensure uniform code structure across all refactored integrations.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <Shield className="h-5 w-5" />
                  <h4 className="font-semibold">Security Enhanced</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatic addition of security best practices and vulnerability remediation.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-orange-600">
                  <Award className="h-5 w-5" />
                  <h4 className="font-semibold">Quality Improvement</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Measurable quality increases with reduced complexity and improved maintainability scores.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <TrendingUp className="h-5 w-5" />
                  <h4 className="font-semibold">Technical Debt Reduction</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Systematically eliminate legacy code patterns and reduce long-term maintenance costs.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Brain className="h-5 w-5" />
                  <h4 className="font-semibold">AI Learning</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Continuously improving refactoring patterns based on best practices and industry standards.
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
