import { 
  Code2, 
  Database, 
  Globe, 
  Zap, 
  Server, 
  Cpu, 
  FileCode, 
  GitBranch,
  Brain,
  Shield,
  ArrowRight,
  Upload,
  Search,
  BarChart,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TechnologyFlow() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Technology & Program Flow</h1>
        <p className="text-gray-600 dark:text-gray-300">Complete overview of our technology stack and how the system works</p>
      </div>

      <Tabs defaultValue="technology" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="technology" data-testid="tab-technology">
            <Code2 className="w-4 h-4 mr-2" />
            Technology Stack
          </TabsTrigger>
          <TabsTrigger value="flow" data-testid="tab-flow">
            <GitBranch className="w-4 h-4 mr-2" />
            Program Flow
          </TabsTrigger>
        </TabsList>

        {/* Technology Stack Tab */}
        <TabsContent value="technology" className="space-y-6">
          {/* Frontend Technologies */}
          <Card data-testid="card-frontend">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Frontend Technologies
              </CardTitle>
              <CardDescription>Modern React-based user interface</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-500" />
                  Core Framework
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                  <li>• React 18 with TypeScript</li>
                  <li>• Vite for fast builds</li>
                  <li>• Wouter for routing</li>
                  <li>• TanStack Query for state management</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  UI Components
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                  <li>• shadcn/ui component library</li>
                  <li>• Radix UI primitives</li>
                  <li>• Tailwind CSS styling</li>
                  <li>• Lucide React icons</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-green-500" />
                  Visualization
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                  <li>• Mermaid.js for diagrams</li>
                  <li>• AntV X6 for components</li>
                  <li>• React Flow for graphs</li>
                  <li>• Recharts for analytics</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  Document Export
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                  <li>• jsPDF for PDF generation</li>
                  <li>• docx for Word documents</li>
                  <li>• HTML2Canvas for previews</li>
                  <li>• JSZip for file handling</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Backend Technologies */}
          <Card data-testid="card-backend">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-green-600" />
                Backend Technologies
              </CardTitle>
              <CardDescription>Robust Node.js server architecture</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-green-500" />
                  Server Framework
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                  <li>• Express.js with TypeScript</li>
                  <li>• RESTful API design</li>
                  <li>• Multer for file uploads (50MB limit)</li>
                  <li>• Express Session management</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  Database & ORM
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                  <li>• PostgreSQL database</li>
                  <li>• Drizzle ORM for type-safe queries</li>
                  <li>• Neon serverless integration</li>
                  <li>• Zod schema validation</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  Authentication
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                  <li>• Passport.js authentication</li>
                  <li>• bcrypt password encryption</li>
                  <li>• Session-based auth</li>
                  <li>• Multi-tenant support</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-orange-500" />
                  Code Analysis
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                  <li>• Java (Spring Boot, JPA, MVC)</li>
                  <li>• Python (Django, Flask)</li>
                  <li>• PySpark (DataFrame, Job Flows)</li>
                  <li>• Mainframe (COBOL, JCL)</li>
                  <li>• C# (.NET, ASP.NET Core)</li>
                  <li>• Kotlin (Android, JVM)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* AI & ML Stack */}
          <Card data-testid="card-ai">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI & Machine Learning
              </CardTitle>
              <CardDescription>Advanced AI-powered analysis and insights</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-500" />
                  AI Models
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                  <li>• OpenAI GPT-4o (cloud)</li>
                  <li>• Ollama local LLMs</li>
                  <li>• Code Llama, Deepseek Coder</li>
                  <li>• Llama 3, Mistral, StarCoder</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-500" />
                  Vector & Knowledge
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                  <li>• ChromaDB vector storage</li>
                  <li>• HuggingFace transformers</li>
                  <li>• CodeBERT for code quality</li>
                  <li>• Sentence transformers</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-teal-500" />
                  AI Orchestration
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                  <li>• LangChain for document processing</li>
                  <li>• LangGraph for workflows</li>
                  <li>• Langfuse for observability</li>
                  <li>• Redis for caching</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-500" />
                  Code Lens ML & Scanning
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                  <li>• Pure Python/NumPy ML (no TensorFlow)</li>
                  <li>• 39 regex patterns (5 categories)</li>
                  <li>• Excel field mapping (exact match)</li>
                  <li>• Levenshtein & token similarity</li>
                  <li>• Lookup table (95%+ confidence)</li>
                  <li>• Acronym detection (90%+ confidence)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Additional Tools */}
          <Card data-testid="card-tools">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                Additional Tools & Libraries
              </CardTitle>
              <CardDescription>Supporting technologies and utilities</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Development</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                  <li>• TypeScript</li>
                  <li>• ESBuild</li>
                  <li>• Vite</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Validation</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                  <li>• Zod schemas</li>
                  <li>• date-fns</li>
                  <li>• clsx utilities</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Integration</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                  <li>• GitHub API</li>
                  <li>• WebSocket (ws)</li>
                  <li>• OpenID Client</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Program Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          {/* Upload Phase */}
          <Card data-testid="card-upload-phase">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Phase 1: Project Upload & Extraction
              </CardTitle>
              <CardDescription>Initial project ingestion and validation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-blue-100 p-2">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Upload Sources</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Users upload ZIP files (up to 50MB) or provide GitHub repository URLs. The system validates file formats and supports Java, Python, PySpark, Mainframe, C#, and Kotlin projects with automatic language detection.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-blue-100 p-2">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">File Extraction</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    ZIP files are extracted to temporary directories. Source files are identified by language-specific patterns (.java, .py, .scala, .cbl, .jcl). Files are stored in database before cleanup.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-blue-100 p-2">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Language Detection</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    System automatically detects project type based on file extensions and routes to appropriate analyzer: Java (.java), Python (.py), PySpark (.scala), Mainframe (.cbl, .jcl), C# (.cs), or Kotlin (.kt).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Phase */}
          <Card data-testid="card-analysis-phase">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-green-600" />
                Phase 2: Code Analysis & Parsing
              </CardTitle>
              <CardDescription>Deep source code analysis and pattern extraction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-green-100 p-2">
                  <ArrowRight className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Language-Specific Parsing</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Each analyzer extracts classes, methods, imports, annotations, and dependencies. Java analyzer identifies Spring Boot components, JPA entities, REST controllers. Python analyzer detects Django/Flask patterns.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-green-100 p-2">
                  <ArrowRight className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Dependency Graph Building</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    System maps relationships between classes, services, repositories, and controllers. Creates architectural hierarchy with layers (controller → service → repository → entity).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-green-100 p-2">
                  <ArrowRight className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Metadata Extraction</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Extracts HTTP methods, API endpoints, database operations, and business logic flows. Results stored in PostgreSQL as JSON for quick retrieval.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Phase */}
          <Card data-testid="card-ai-phase">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Phase 3: AI-Powered Analysis
              </CardTitle>
              <CardDescription>Intelligent insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-purple-100 p-2">
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">LLM Selection</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Users choose between cloud AI (OpenAI GPT-4o) or local models (Ollama with Code Llama, Deepseek, StarCoder, Llama 3, Mistral) for privacy-sensitive projects.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-purple-100 p-2">
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Pattern Recognition</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    AI identifies architectural patterns (MVC, microservices, layered), design patterns (singleton, factory, repository), code smells, and technical debt areas.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-purple-100 p-2">
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Code Lens - Demographic Scanning</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Two scanning modes: (1) Regex Scan - 39 pre-defined patterns across 5 categories (Names, Personal Info, Addresses, Phones, Emails), and (2) Excel Field Mapping - upload Excel with table_name + field_name columns for exact matching. Optional Code Lens ML provides suggestions for unmatched fields using Lookup Table (95%), Acronym Detection (90%), and Levenshtein similarity (60-95%).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-purple-100 p-2">
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Quality Assessment</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    AI-powered code quality analysis with HuggingFace CodeBERT for code assessment, security scanning, and technical debt identification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visualization Phase */}
          <Card data-testid="card-visualization-phase">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-orange-600" />
                Phase 4: Visualization & Export
              </CardTitle>
              <CardDescription>Interactive diagrams and professional reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-orange-100 p-2">
                  <ArrowRight className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Diagram Generation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Creates Flow Diagrams (Mermaid.js), Component Diagrams (AntV X6 with zoom controls), Sequence Diagrams (project-specific flows), and UML Class Diagrams (entity relationships).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-orange-100 p-2">
                  <ArrowRight className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">C360 Process Visualization</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Visual representation of integration processes, data flows, and system interactions with corporate branding.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-orange-100 p-2">
                  <ArrowRight className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Export Options</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    PDF reports with professional formatting (jsPDF + autotable), Word documents (docx), HTML previews (HTML2Canvas), and downloadable diagram images.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-orange-100 p-2">
                  <ArrowRight className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">AI Insights Display</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Formatted markdown output with component analysis, architectural patterns, detected issues, and actionable recommendations for improvement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Features */}
          <Card data-testid="card-advanced-features">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-600" />
                Advanced Features & Agents
              </CardTitle>
              <CardDescription>Specialized AI agents and enterprise capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-cyan-100 p-2">
                  <ArrowRight className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Knowledge Agent</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Document intelligence with Confluence scraping, IBM Doclinq PDF processing, intelligent Q&A interface, and persistent knowledge base using LangChain for document processing and LangGraph for workflow orchestration.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-cyan-100 p-2">
                  <ArrowRight className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Code Conversion Agent</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Multi-language code transformation agent supporting conversion between Java, Python, PySpark, Mainframe, C#, and Kotlin. Uses AST-based syntax conversion and framework migration support while preserving code quality.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-cyan-100 p-2">
                  <ArrowRight className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Validator & Responsible AI Agent</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Comprehensive validation covering security vulnerability detection, privacy compliance (GDPR, CCPA), AI ethics and bias detection, fairness assessment, code quality metrics, and responsible AI deployment validation.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-cyan-100 p-2">
                  <ArrowRight className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Real-time Processing & Backend Visibility</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Interactive processing modals show backend operations step-by-step. Excel scanning displays: file upload → validation → parsing → codebase matching → report generation. ML suggestions show: engine initialization → dataset loading → lookup table → acronym detection → Levenshtein analysis → token similarity → report compilation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
