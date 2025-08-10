import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Brain, 
  Search, 
  Code, 
  Database,
  FileText,
  Github,
  Cpu,
  Shield,
  BarChart3,
  Users,
  Briefcase,
  MapPin,
  Star,
  Zap,
  Eye,
  Target,
  Activity
} from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  responsibility?: string;
}

interface AgentInfo {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  capabilities: string[];
  useCases: string[];
  technologyStack: string[];
  status: string;
  version: string;
  integrations: string[];
  features: {
    title: string;
    description: string;
  }[];
}

const teamMembers: TeamMember[] = [
  {
    name: "Kaushik Saha",
    role: "Project Manager",
    responsibility: "Overall project coordination and delivery"
  },
  {
    name: "Sameer Kumar Sharma", 
    role: "Engineering Manager",
    responsibility: "Technical leadership and team management"
  },
  {
    name: "Piyush Gupta",
    role: "Onsite Manager", 
    responsibility: "Code Lens, Match Lens, Validator Agent"
  },
  {
    name: "Ullas Krishnan",
    role: "Solution Architect",
    responsibility: "System architecture and design"
  },
  {
    name: "Hrushikesh Nalwade",
    role: "Java Architect",
    responsibility: "Frameworks, Microservices"
  },
  {
    name: "Pavan Luka",
    role: "IBM Expert",
    responsibility: "Mainframe, COBOL, Batch Processing"
  }
];

const agents: AgentInfo[] = [
  {
    id: "zenvector",
    name: "ZenVector Agent",
    icon: Database,
    description: "Advanced AI Agent for Code Intelligence with Enterprise AI Integration using ChromaDB vector database for persistent storage and similarity analysis.",
    capabilities: [
      "Code Similarity Detection",
      "Semantic Code Search", 
      "Demographic Data Analysis",
      "Pattern Recognition",
      "Multi-modal Search",
      "HuggingFace Code Analysis",
      "SonarQube Integration",
      "Langfuse Observability"
    ],
    useCases: [
      "Find similar code patterns across large codebases",
      "Semantic search for code documentation and comments",
      "Identify code duplication and refactoring opportunities", 
      "Analyze demographic data patterns for business intelligence",
      "Code quality assessment with AI insights",
      "Technical debt analysis and recommendations"
    ],
    technologyStack: [
      "ChromaDB Vector Database",
      "HuggingFace Transformers (CodeBERT)",
      "Sentence Transformers",
      "SonarQube API Integration",
      "Langfuse Observability",
      "Python with FastAPI",
      "Vector Embeddings (all-MiniLM-L6-v2)"
    ],
    status: "Active",
    version: "2.0.0",
    integrations: ["ChromaDB", "SonarQube", "HuggingFace", "Langfuse"],
    features: [
      {
        title: "Vector Database Storage",
        description: "Persistent storage of code embeddings using ChromaDB for fast similarity searches"
      },
      {
        title: "AI-Powered Analysis", 
        description: "Advanced code analysis using HuggingFace CodeBERT and custom models"
      },
      {
        title: "Quality Metrics",
        description: "Comprehensive code quality analysis with SonarQube integration"
      },
      {
        title: "Observability",
        description: "Complete monitoring and tracing with Langfuse for all AI operations"
      }
    ]
  },
  {
    id: "knowledge",
    name: "Knowledge Agent",
    icon: Brain,
    description: "Comprehensive Document Intelligence & Q&A System with enterprise AI integration for processing and analyzing various document sources.",
    capabilities: [
      "Confluence Page Scraping",
      "PDF Document Processing", 
      "IBM Doclinq Integration",
      "LangChain Document Processing",
      "LangGraph Workflow Orchestration",
      "Langfuse LLM Observability",
      "HuggingFace Model Integration",
      "Multi-Model AI Pipeline",
      "Web Scraping",
      "Intelligent Q&A Chat",
      "Vector Search",
      "Redis Caching"
    ],
    useCases: [
      "Process enterprise documentation from Confluence",
      "Extract insights from PDF documents with OCR",
      "Build intelligent knowledge bases from web content",
      "Provide contextual Q&A on organizational knowledge",
      "Automate document analysis and summarization",
      "Create searchable knowledge repositories"
    ],
    technologyStack: [
      "IBM Doclinq (Enterprise PDF Processing)",
      "LangChain Framework",
      "LangGraph State Management", 
      "ChromaDB Vector Storage",
      "Redis Caching",
      "HuggingFace DialoGPT",
      "BeautifulSoup Web Scraping",
      "Sentence Transformers"
    ],
    status: "Active",
    version: "2.0.0", 
    integrations: ["IBM Doclinq", "LangChain", "LangGraph", "ChromaDB", "Redis"],
    features: [
      {
        title: "Enterprise Document Processing",
        description: "Advanced PDF processing with IBM Doclinq for OCR and entity extraction"
      },
      {
        title: "Multi-Source Integration",
        description: "Process documents from Confluence, web sources, and file uploads"
      },
      {
        title: "Intelligent Chat Interface",
        description: "Context-aware Q&A with multiple AI model support and retrieval"
      },
      {
        title: "Workflow Orchestration",
        description: "Complex document processing pipelines with LangGraph state management"
      }
    ]
  },
  {
    id: "codelens",
    name: "Code Lens Agent",
    icon: Eye,
    description: "Advanced Code Analysis and Pattern Recognition agent for deep code quality assessment, security scanning, and architectural analysis.",
    capabilities: [
      "Deep Code Analysis",
      "Pattern Recognition", 
      "Security Vulnerability Scanning",
      "Performance Analysis",
      "Complexity Metrics",
      "Technical Debt Assessment",
      "Architecture Pattern Detection",
      "HuggingFace AI Insights",
      "Langfuse Observability"
    ],
    useCases: [
      "Comprehensive code quality assessment",
      "Security vulnerability detection and remediation",
      "Performance bottleneck identification",
      "Technical debt analysis and prioritization",
      "Design pattern recognition in codebases",
      "Code complexity and maintainability metrics"
    ],
    technologyStack: [
      "HuggingFace CodeBERT",
      "Radon Complexity Analysis",
      "AST (Abstract Syntax Tree) Parsing",
      "Langfuse Observability",
      "Python Static Analysis",
      "Security Pattern Matching",
      "Performance Profiling"
    ],
    status: "Active",
    version: "1.0.0",
    integrations: ["HuggingFace", "Langfuse", "Radon"],
    features: [
      {
        title: "Security Scanning",
        description: "Automated detection of security vulnerabilities and coding anti-patterns"
      },
      {
        title: "Complexity Analysis",
        description: "Detailed code complexity metrics using Radon and custom algorithms"
      },
      {
        title: "Pattern Detection",
        description: "Recognition of design patterns and architectural anti-patterns"
      },
      {
        title: "AI Insights",
        description: "AI-powered code analysis and recommendations using CodeBERT"
      }
    ]
  },
  {
    id: "aianalysis",
    name: "AI Analysis Service",
    icon: Zap,
    description: "Multi-model AI integration service providing intelligent analysis across different AI platforms with configurable model selection.",
    capabilities: [
      "Multi-Model AI Integration",
      "OpenAI GPT-4o Support",
      "AWS Claude 3.5 Integration", 
      "Google Gemini Pro Support",
      "Intelligent Code Analysis",
      "Project Insights Generation",
      "Configurable AI Model Selection",
      "Real-time Model Switching"
    ],
    useCases: [
      "Intelligent project analysis with multiple AI models",
      "Code explanation and documentation generation",
      "Architecture recommendations and insights",
      "Comparative analysis across different AI models",
      "Automated code review and suggestions",
      "Project assessment and recommendations"
    ],
    technologyStack: [
      "OpenAI GPT-4o API",
      "AWS Claude 3.5 Sonnet",
      "Google Gemini Pro",
      "TypeScript/Node.js",
      "Express.js Framework",
      "Model Configuration Management"
    ],
    status: "Active",
    version: "1.5.0",
    integrations: ["OpenAI", "AWS Claude", "Google Gemini"],
    features: [
      {
        title: "Multi-Model Support",
        description: "Integration with leading AI models for diverse analysis capabilities"
      },
      {
        title: "Dynamic Configuration",
        description: "Real-time switching between AI models based on requirements"
      },
      {
        title: "Intelligent Analysis",
        description: "Advanced project and code analysis using state-of-the-art AI"
      },
      {
        title: "Scalable Architecture",
        description: "Modular design supporting easy addition of new AI models"
      }
    ]
  },
  {
    id: "javaanalyzer",
    name: "Java Analyzer Agent",
    icon: Code,
    description: "Specialized Java project analysis agent for Spring Boot applications, MVC architecture detection, and enterprise Java patterns.",
    capabilities: [
      "Java Project Structure Analysis",
      "Spring Boot Pattern Detection",
      "MVC Architecture Analysis", 
      "Class Relationship Mapping",
      "JPA Entity Detection",
      "REST Controller Analysis",
      "Service Layer Identification",
      "Repository Pattern Detection"
    ],
    useCases: [
      "Analyze Spring Boot application architecture",
      "Map Java class relationships and dependencies",
      "Identify MVC pattern implementation",
      "Assess enterprise Java best practices",
      "Generate architectural documentation",
      "Code structure visualization"
    ],
    technologyStack: [
      "Java AST Parsing",
      "Spring Framework Analysis",
      "Maven/Gradle Integration",
      "TypeScript/Node.js Backend",
      "File System Analysis",
      "Pattern Matching Algorithms"
    ],
    status: "Active", 
    version: "1.0.0",
    integrations: ["Spring Boot", "Maven", "Gradle"],
    features: [
      {
        title: "Spring Boot Analysis",
        description: "Comprehensive analysis of Spring Boot applications and patterns"
      },
      {
        title: "Architecture Mapping",
        description: "Detailed mapping of MVC architecture and component relationships"
      },
      {
        title: "Pattern Recognition",
        description: "Identification of enterprise Java patterns and best practices"
      },
      {
        title: "Dependency Analysis",
        description: "Analysis of class dependencies and package structure"
      }
    ]
  },
  {
    id: "github",
    name: "GitHub Service Agent",
    icon: Github,
    description: "GitHub repository integration agent for cloning, analyzing, and processing multi-language projects from GitHub repositories.",
    capabilities: [
      "GitHub Repository Cloning",
      "Multi-Language Project Analysis",
      "Branch-Aware Processing", 
      "Repository Structure Analysis",
      "Automated Project Setup",
      "Git Integration",
      "Multi-Branch Support",
      "Repository Validation"
    ],
    useCases: [
      "Analyze open-source projects from GitHub",
      "Process enterprise repositories for architecture review",
      "Automated code analysis from version control",
      "Multi-branch project comparison",
      "Repository structure assessment",
      "Integration with CI/CD pipelines"
    ],
    technologyStack: [
      "Git CLI Integration",
      "GitHub API",
      "Multi-Language Detection",
      "TypeScript/Node.js",
      "File System Processing",
      "Repository Management"
    ],
    status: "Active",
    version: "1.0.0",
    integrations: ["GitHub", "Git"],
    features: [
      {
        title: "Repository Cloning",
        description: "Automated cloning and setup of GitHub repositories for analysis"
      },
      {
        title: "Branch Support",
        description: "Support for multiple branches with intelligent fallback mechanisms"
      },
      {
        title: "Multi-Language Analysis",
        description: "Detection and analysis of projects in multiple programming languages"
      },
      {
        title: "Structure Analysis",
        description: "Comprehensive analysis of repository structure and organization"
      }
    ]
  },
  {
    id: "ollama",
    name: "Ollama Service Agent",
    icon: Cpu,
    description: "Local LLM integration agent providing offline AI processing capabilities with privacy-focused analysis using Ollama.",
    capabilities: [
      "Local LLM Integration",
      "Offline AI Processing",
      "Model Management",
      "Privacy-Focused Analysis", 
      "Multiple Model Support",
      "Custom Model Loading",
      "Resource Management",
      "Secure Processing"
    ],
    useCases: [
      "Offline code analysis for sensitive projects",
      "Privacy-compliant AI processing",
      "Local development environment integration",
      "Custom model deployment and testing",
      "Air-gapped environment analysis",
      "Reduced dependency on external APIs"
    ],
    technologyStack: [
      "Ollama Framework",
      "Local LLM Models (Mistral, Llama, CodeLlama)",
      "TypeScript/Node.js",
      "Model Management APIs",
      "Resource Optimization",
      "Local Processing Pipeline"
    ],
    status: "Active",
    version: "1.0.0",
    integrations: ["Ollama", "Local LLMs"],
    features: [
      {
        title: "Local Processing",
        description: "Complete offline AI processing without external API dependencies"
      },
      {
        title: "Model Flexibility",
        description: "Support for multiple local LLM models with easy switching"
      },
      {
        title: "Privacy-First",
        description: "Secure, local processing ensuring data privacy and compliance"
      },
      {
        title: "Resource Efficiency",
        description: "Optimized resource usage for local model execution"
      }
    ]
  }
];

export default function AgentDetails() {
  const [selectedAgent, setSelectedAgent] = useState<string>(agents[0].id);
  
  const currentAgent = agents.find(agent => agent.id === selectedAgent) || agents[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Zengent AI - Enterprise Agent Portfolio
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enterprise application intelligence platform with specialized AI agents
          </p>
        </div>

        {/* Team Information */}
        <Card className="mb-8 border-2 border-blue-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="w-6 h-6" />
              Diamond Zensar Team - For AI Agents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                  {member.responsibility && (
                    <p className="text-sm text-gray-600">{member.responsibility}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agent Selection Tabs */}
        <Tabs value={selectedAgent} onValueChange={setSelectedAgent} className="w-full">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-8 bg-white/80 backdrop-blur-sm border-2 border-blue-200">
            {agents.map((agent) => (
              <TabsTrigger 
                key={agent.id} 
                value={agent.id}
                className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <agent.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{agent.name.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Agent Details Content */}
          {agents.map((agent) => (
            <TabsContent key={agent.id} value={agent.id} className="space-y-6">
              {/* Agent Overview */}
              <Card className="border-2 border-blue-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <agent.icon className="w-8 h-8" />
                    {agent.name}
                    <Badge variant="secondary" className="bg-white text-blue-600">
                      {agent.status}
                    </Badge>
                    <Badge variant="outline" className="border-white text-white">
                      v{agent.version}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    {agent.description}
                  </p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Key Features */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Key Features
                      </h3>
                      <div className="space-y-3">
                        {agent.features.map((feature, index) => (
                          <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Integrations */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        Enterprise Integrations
                      </h3>
                      <div className="grid grid-cols-2 gap-2 mb-6">
                        {agent.integrations.map((integration, index) => (
                          <Badge key={index} variant="outline" className="justify-center p-2 border-green-200 text-green-700">
                            {integration}
                          </Badge>
                        ))}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        Technology Stack
                      </h3>
                      <div className="space-y-2">
                        {agent.technologyStack.map((tech, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded border border-purple-200">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">{tech}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Capabilities and Use Cases */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Capabilities */}
                <Card className="border-2 border-green-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Core Capabilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {agent.capabilities.map((capability, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                            <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{capability}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Use Cases */}
                <Card className="border-2 border-orange-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Enterprise Use Cases
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {agent.useCases.map((useCase, index) => (
                          <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <p className="text-sm text-gray-700">{useCase}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Summary Stats */}
        <Card className="mt-8 border-2 border-indigo-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <CardTitle className="text-center text-2xl">Enterprise AI Platform Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <Bot className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">7</div>
                <div className="text-sm text-gray-600">Active Agents</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">15+</div>
                <div className="text-sm text-gray-600">Enterprise Integrations</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">AI Capabilities</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">4</div>
                <div className="text-sm text-gray-600">Team Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}