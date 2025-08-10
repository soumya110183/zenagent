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
import Layout from "@/components/layout";

export default function About() {
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

  const agents = [
    {
      name: "Code Lens",
      description: "Demographic data scanning and analysis specialized for Diamond Project requirements",
      icon: "🔍"
    },
    {
      name: "Match Lens", 
      description: "Dependency mapping and relationship analysis",
      icon: "🔗"
    },
    {
      name: "Validator",
      description: "Code quality and compliance checking",
      icon: "✅"
    },
    {
      name: "Responsible AI",
      description: "Ethics and bias detection in code analysis",
      icon: "⚖️"
    }
  ];

  const techStack = [
    { category: "Frontend", items: ["React", "TypeScript", "Tailwind CSS", "React Flow", "shadcn/ui"] },
    { category: "Backend", items: ["Express.js", "Node.js", "PostgreSQL", "Drizzle ORM", "bcrypt"] },
    { category: "AI Integration", items: ["OpenAI API", "Ollama", "AWS Claude", "Google Gemini"] },
    { category: "Analysis Tools", items: ["SonarQube", "Swagger", "JavaDoc", "Custom Parsers"] }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Zengent AI
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Enterprise Application Intelligence Platform
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transform your codebase understanding with AI-powered analysis, interactive visualizations, 
            and comprehensive insights across multiple programming languages.
          </p>
        </div>

        {/* Key Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              Key Features
            </CardTitle>
            <CardDescription>
              Comprehensive capabilities for enterprise-grade code analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    {feature.icon}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {feature.technologies.map((tech, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Agents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="h-6 w-6 text-blue-600 mr-2" />
              Specialized AI Agents
            </CardTitle>
            <CardDescription>
              Four specialized agents for comprehensive code analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {agents.map((agent, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <span className="text-2xl">{agent.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-600">{agent.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-6 w-6 text-green-600 mr-2" />
              Technology Stack
            </CardTitle>
            <CardDescription>
              Modern, scalable technologies powering the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {techStack.map((category, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900 mb-3">{category.category}</h3>
                  <div className="space-y-2">
                    {category.items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                  <li>• Static analysis with SonarQube integration</li>
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

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <p className="text-gray-600 mb-2">
            <strong>Powered by Zensar Technologies</strong>
          </p>
          <p className="text-sm text-gray-500">
            Transforming enterprises through intelligent automation and AI-driven solutions
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Built by the Amex Diamond Zensar Team
          </p>
        </div>
      </div>
    </Layout>
  );
}