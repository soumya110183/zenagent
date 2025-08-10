import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Download, 
  Terminal, 
  Folder, 
  Code2, 
  Database, 
  Globe, 
  Shield,
  Zap,
  Book,
  ExternalLink,
  Copy,
  CheckCircle,
  Settings
} from "lucide-react";
import Layout from "@/components/layout";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ReadmePage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(label);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const CodeBlock = ({ code, label }: { code: string; label: string }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        {code}
      </pre>
      <Button
        size="sm"
        variant="outline"
        className="absolute top-2 right-2 h-8 w-8 p-0"
        onClick={() => copyToClipboard(code, label)}
      >
        {copiedCode === label ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  const prerequisites = [
    "Node.js 18+",
    "PostgreSQL database", 
    "OpenAI API key (optional, for online AI analysis)"
  ];

  const features = [
    "Multi-language code analysis (Java, Python, PySpark, Mainframe)",
    "Interactive architecture diagrams with React Flow",
    "AI-powered insights with multiple model options",
    "SonarQube integration for code quality",
    "Professional PDF report generation",
    "Complete user management system",
    "Secure authentication and session handling"
  ];

  const scripts = [
    { command: "npm run dev", description: "Start development server" },
    { command: "npm run build", description: "Build for production" },
    { command: "npm run db:push", description: "Push schema changes to database" },
    { command: "npm run db:studio", description: "Open Drizzle Studio (GUI)" },
    { command: "npm run lint", description: "Run ESLint" },
    { command: "npm run type-check", description: "Run TypeScript checks" }
  ];

  const apiEndpoints = [
    { method: "POST", path: "/api/auth/login", description: "User authentication" },
    { method: "GET", path: "/api/auth/user", description: "Get current user" },
    { method: "PATCH", path: "/api/auth/user", description: "Update user profile" },
    { method: "POST", path: "/api/auth/upload-avatar", description: "Upload profile image" },
    { method: "GET", path: "/api/projects", description: "List all projects" },
    { method: "POST", path: "/api/projects/upload", description: "Upload ZIP for analysis" },
    { method: "GET", path: "/api/projects/:id", description: "Get project details" },
    { method: "GET", path: "/api/admin/statistics", description: "Admin dashboard data" }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Developer Documentation
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete setup and development guide for Zengent AI Enterprise Application Intelligence Platform
          </p>
        </div>

        {/* Quick Start */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="h-6 w-6 text-green-600 mr-2" />
              Quick Start
            </CardTitle>
            <CardDescription>
              Get up and running in minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prerequisites */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                Prerequisites
              </h3>
              <div className="grid md:grid-cols-3 gap-3">
                {prerequisites.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Installation Steps */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Download className="h-5 w-5 text-purple-500 mr-2" />
                Installation Steps
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Clone the repository</h4>
                  <CodeBlock 
                    code="git clone <repository-url>\ncd zengent-ai" 
                    label="Clone command"
                  />
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Install dependencies</h4>
                  <CodeBlock 
                    code="npm install" 
                    label="Install command"
                  />
                </div>

                <div>
                  <h4 className="font-medium mb-2">3. Set up environment variables</h4>
                  <CodeBlock 
                    code={`# Required
DATABASE_URL=postgresql://username:password@localhost:5432/zengent
SESSION_SECRET=your-secret-key

# Optional (for AI features)
OPENAI_API_KEY=your-openai-api-key`}
                    label="Environment variables"
                  />
                </div>

                <div>
                  <h4 className="font-medium mb-2">4. Initialize the database</h4>
                  <CodeBlock 
                    code="npm run db:push" 
                    label="Database init"
                  />
                </div>

                <div>
                  <h4 className="font-medium mb-2">5. Start the development server</h4>
                  <CodeBlock 
                    code="npm run dev" 
                    label="Start server"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Application will be available at http://localhost:5000
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Folder className="h-6 w-6 text-blue-600 mr-2" />
              Project Architecture
            </CardTitle>
            <CardDescription>
              Understanding the codebase structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Code2 className="h-5 w-5 text-blue-500 mr-2" />
                  Frontend (client/)
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>React + TypeScript</strong> for type-safe development</li>
                  <li>• <strong>Tailwind CSS + shadcn/ui</strong> for modern UI</li>
                  <li>• <strong>React Flow</strong> for interactive diagrams</li>
                  <li>• <strong>TanStack Query</strong> for state management</li>
                  <li>• <strong>Wouter</strong> for lightweight routing</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Database className="h-5 w-5 text-green-500 mr-2" />
                  Backend (server/)
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Express.js + TypeScript</strong> for robust API</li>
                  <li>• <strong>Drizzle ORM</strong> for type-safe database ops</li>
                  <li>• <strong>Multer</strong> for secure file uploads</li>
                  <li>• <strong>bcrypt</strong> for password security</li>
                  <li>• <strong>Session-based auth</strong> with PostgreSQL</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Project Structure</h3>
              <CodeBlock 
                code={`├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express.js backend
│   ├── services/           # Business logic services
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   └── auth.ts             # Authentication logic
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
└── docs/                   # Documentation`}
                label="Project structure"
              />
            </div>
          </CardContent>
        </Card>

        {/* Available Scripts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Terminal className="h-6 w-6 text-purple-600 mr-2" />
              Available Scripts
            </CardTitle>
            <CardDescription>
              Common development commands
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {scripts.map((script, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {script.command}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(script.command, script.command)}
                    >
                      {copiedCode === script.command ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">{script.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-6 w-6 text-orange-600 mr-2" />
              API Documentation
            </CardTitle>
            <CardDescription>
              Key API endpoints for development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={endpoint.method === 'GET' ? 'default' : endpoint.method === 'POST' ? 'destructive' : 'secondary'}
                      className="w-16 justify-center"
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono">{endpoint.path}</code>
                  </div>
                  <span className="text-sm text-gray-600">{endpoint.description}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm flex items-center">
                <Book className="h-4 w-4 mr-2" />
                Full Swagger documentation available at <code className="mx-1">/api-docs</code> when server is running
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-6 w-6 text-indigo-600 mr-2" />
              Platform Features
            </CardTitle>
            <CardDescription>
              What makes Zengent AI powerful
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-6 w-6 text-red-600 mr-2" />
              Security Features
            </CardTitle>
            <CardDescription>
              Enterprise-grade security implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Authentication</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• bcrypt password hashing</li>
                  <li>• PostgreSQL-backed sessions</li>
                  <li>• Session timeout handling</li>
                  <li>• Secure cookie configuration</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Data Protection</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Local processing options</li>
                  <li>• File upload validation</li>
                  <li>• SQL injection protection</li>
                  <li>• Privacy-first AI analysis</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deployment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-6 w-6 text-yellow-600 mr-2" />
              Deployment
            </CardTitle>
            <CardDescription>
              Production deployment guidelines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Production Build</h3>
                <CodeBlock 
                  code="npm run build\nnpm start" 
                  label="Production build"
                />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Environment Variables</h3>
                <CodeBlock 
                  code={`NODE_ENV=production
DATABASE_URL=your-production-db-url
SESSION_SECRET=your-production-secret
OPENAI_API_KEY=your-api-key`}
                  label="Production env"
                />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Docker Support</h3>
                <CodeBlock 
                  code={`FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]`}
                  label="Dockerfile"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <p className="text-gray-600 mb-2">
            <strong>Built by the Amex Diamond Zensar Team</strong>
          </p>
          <p className="text-sm text-gray-500">
            For support, feature requests, or enterprise inquiries, please contact our team
          </p>
        </div>
      </div>
    </Layout>
  );
}