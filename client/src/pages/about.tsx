import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  Code, 
  Shield, 
  Zap, 
  Globe, 
  Monitor, 
  FileText, 
  Users,
  CheckCircle,
  Star,
  Sparkles,
  Database,
  Lock
} from "lucide-react";
import ullasPhoto from "@assets/ullas_1754848831242.png";
import kaushikPhoto from "@assets/kaushik_1754851074835.png";
import sameerPhoto from "@assets/sameer_1754894004666.png";
import piyushPhoto from "@assets/piyush_1754876944912.jpg";
import hrushikeshPhoto from "@assets/hri_1754851135645.png";


export default function TeamBehind() {
  const features = [
    {
      icon: <Code className="h-6 w-6 text-blue-600" />,
      title: "Multi-Language Support",
      description: "Analyze Java, Python, PySpark, and Mainframe codebases with specialized parsers for each language.",
      technologies: ["Spring Boot", "Django/Flask", "Apache Spark", "COBOL/JCL"]
    },
    {
      icon: <Bot className="h-6 w-6 text-green-600" />,
      title: "AI-Powered Analysis",
      description: "Choose from multiple AI models including OpenAI GPT-4o, AWS Claude, Google Gemini, or local LLM.",
      technologies: ["GPT-4o", "Claude 3.5", "Gemini Pro", "Ollama"]
    },
    {
      icon: <Shield className="h-6 w-6 text-purple-600" />,
      title: "Enterprise Security",
      description: "Complete user management with role-based access, secure authentication, and privacy-first analysis.",
      technologies: ["bcrypt", "Session Management", "PostgreSQL", "Local Processing"]
    },
    {
      icon: <FileText className="h-6 w-6 text-orange-600" />,
      title: "Professional Reporting",
      description: "Generate comprehensive PDF reports with SVG diagrams, corporate branding, and detailed analysis.",
      technologies: ["PDF Export", "SVG Diagrams", "Corporate Branding", "Revision History"]
    }
  ];

  const projectAIAgents = [
    {
      name: "Java Agent",
      description: "Comprehensive analysis of Java applications including Spring Boot frameworks, Maven/Gradle builds, and enterprise patterns",
      icon: "☕",
      category: "Language Analysis"
    },
    {
      name: "PySpark Agent",
      description: "Advanced big data processing pipeline analysis with Apache Spark ecosystem integration and performance optimization insights",
      icon: "🔥",
      category: "Big Data"
    },
    {
      name: "Mainframe Agent",
      description: "Legacy system analysis for COBOL programs, JCL job scheduling, and mainframe database integrations with modernization insights",
      icon: "🏢",
      category: "Legacy Systems"
    },
    {
      name: "Python Agent",
      description: "Deep analysis of Python applications with Django/Flask framework detection, package dependencies, and API architecture insights",
      icon: "🐍",
      category: "Web Development"
    },
    {
      name: "Validator Agent",
      description: "Comprehensive code validation covering security vulnerabilities, privacy compliance, and quality assessment",
      icon: "✅",
      category: "Code Quality"
    },
    {
      name: "Responsible AI Agent",
      description: "Ethics and bias detection in code analysis with comprehensive AI governance and fairness assessment",
      icon: "⚖️",
      category: "AI Ethics"
    }
  ];

  const diamondProjectAgents = [
    {
      name: "Code Lens Agent",
      description: "Advanced demographic field analysis and integration pattern detection for comprehensive application understanding",
      icon: "🔍",
      category: "Data Analysis"
    },
    {
      name: "Match Lens Agent",
      description: "Intelligent field matching between demographic data and C360 customer fields with automated relationship discovery",
      icon: "🔗",
      category: "Data Mapping"
    },
    {
      name: "Knowledge Agent",
      description: "Document intelligence and Q&A system with Confluence integration, PDF processing, and intelligent knowledge extraction",
      icon: "📚",
      category: "Knowledge Management"
    },
    {
      name: "Data Lens Agent",
      description: "Big Data intelligence agent for analyzing large-scale datasets, data lakes, and distributed computing environments",
      icon: "📊",
      category: "Big Data Analytics"
    },
    {
      name: "Codeshift Lens Agent",
      description: "Multi-language code conversion agent for transforming source code between programming languages while preserving logic",
      icon: "🔄",
      category: "Code Transformation"
    }
  ];

  const techStack = [
    { category: "Frontend", items: ["React", "TypeScript", "Tailwind CSS", "React Flow", "shadcn/ui"] },
    { category: "Backend", items: ["Express.js", "Node.js", "PostgreSQL", "Drizzle ORM", "bcrypt"] },
    { category: "AI Integration", items: ["OpenAI API", "Ollama", "AWS Claude", "Google Gemini"] },
    { category: "Analysis Tools", items: ["Swagger", "JavaDoc", "Custom Parsers", "HuggingFace CodeBERT"] }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Team Behind
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Code Lens v2 - Enterprise Application Agents
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transform your codebase understanding with AI-powered analysis, interactive visualizations, 
            and comprehensive insights across multiple programming languages.
          </p>
        </div>



        {/* Use Cases */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-6 w-6 text-purple-600 mr-2" />
              Use Cases
            </CardTitle>
            <CardDescription>
              How teams leverage Zengent AI for better code understanding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Globe className="h-5 w-5 text-blue-500 mr-2" />
                  Software Architecture Analysis
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Understand complex legacy systems</li>
                  <li>• Identify architectural patterns and anti-patterns</li>
                  <li>• Map dependencies across large codebases</li>
                  <li>• Generate comprehensive documentation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-2" />
                  Code Quality Assessment
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• AI-powered code quality analysis</li>
                  <li>• Performance bottleneck identification</li>
                  <li>• Security vulnerability scanning</li>
                  <li>• Technical debt evaluation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                  Migration Planning
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Assess modernization readiness</li>
                  <li>• Identify migration complexity</li>
                  <li>• Plan phased migration strategies</li>
                  <li>• Generate detailed migration reports</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="h-5 w-5 text-purple-500 mr-2" />
                  Team Collaboration
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Share analysis results across teams</li>
                  <li>• Maintain project documentation</li>
                  <li>• Track architectural decisions</li>
                  <li>• Facilitate code reviews</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-6 w-6 text-red-600 mr-2" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Enterprise-grade security with privacy-first approach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Monitor className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Local Processing</h3>
                <p className="text-sm text-gray-600">
                  Option to run AI analysis completely offline with local LLM models
                </p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Secure Authentication</h3>
                <p className="text-sm text-gray-600">
                  bcrypt password hashing and PostgreSQL session management
                </p>
              </div>
              <div className="text-center">
                <Database className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Data Control</h3>
                <p className="text-sm text-gray-600">
                  Your code never leaves your infrastructure with local analysis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diamond Zensar Team */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-2" />
              Diamond Zensar Team - For AI Agents
            </CardTitle>
            <CardDescription>
              The specialized team behind Zengent AI development and implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <img 
                    src={kaushikPhoto} 
                    alt="Kaushik Saha" 
                    className="w-24 h-32 rounded-lg object-cover border-2 border-blue-400 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Kaushik Saha</h3>
                    <p className="text-blue-600 font-medium mb-1">Distinguished Engineer</p>
                    <p className="text-gray-600 text-sm">AES Digital Engineering</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <img 
                    src={sameerPhoto} 
                    alt="Sameer Kumar Sharma" 
                    className="w-24 h-32 rounded-lg object-cover border-2 border-blue-400 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Sameer Kumar Sharma</h3>
                    <p className="text-blue-600 font-medium mb-1">Sr Engineering Manager</p>
                    <p className="text-gray-600 text-sm">AES Delivery</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <img 
                    src={piyushPhoto} 
                    alt="Piyush Gupta" 
                    className="w-24 h-32 rounded-lg object-cover border-2 border-blue-400 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Piyush Gupta</h3>
                    <p className="text-blue-600 font-medium mb-1">Sr Solution Architect</p>
                    <p className="text-gray-600 text-sm">AS (AD/AMS)</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <img 
                    src={ullasPhoto} 
                    alt="Ullas Krishnan" 
                    className="w-24 h-32 rounded-lg object-cover border-2 border-blue-400 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Ullas Krishnan</h3>
                    <p className="text-blue-600 font-medium mb-1">Sr Solution Architect</p>
                    <p className="text-gray-600 text-sm">AES Cloud Strategy & Operations</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <img 
                    src={hrushikeshPhoto} 
                    alt="Hrushikesh Nalwade" 
                    className="w-24 h-32 rounded-lg object-cover border-2 border-blue-400 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Hrushikesh Nalwade</h3>
                    <p className="text-blue-600 font-medium mb-1">Sr Technical Specialist</p>
                    <p className="text-gray-600 text-sm">AES Digital Engineering</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary Developer Section */}
        <Card className="mb-8 border-2 border-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center">
              <Code className="h-6 w-6 text-blue-600 mr-2" />
              Primary Developer
            </CardTitle>
            <CardDescription>
              Lead architect and developer of the CodeLens platform
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-6">
              <img 
                src={ullasPhoto} 
                alt="Ullas Krishnan" 
                className="w-32 h-40 rounded-lg object-cover border-4 border-blue-500 flex-shrink-0 shadow-lg"
              />
              <div className="flex-1">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Ullas Krishnan</h3>
                  <p className="text-lg text-blue-600 font-semibold mb-1">Sr. Solution Architect</p>
                  <p className="text-gray-600 mb-4">AES Cloud Strategy & Operations</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-800 leading-relaxed">
                    <strong className="text-blue-700">End-to-end design and development</strong> of the CodeLens platform, 
                    including architecture, AI logic, data processing, UI integration, and report generation.
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">Platform Architecture</Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">AI Integration</Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">Full-Stack Development</Badge>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">Report Generation</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}