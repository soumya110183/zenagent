import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ChevronDown, 
  ChevronRight, 
  Code, 
  Database, 
  Settings, 
  FileText, 
  Users, 
  GitBranch,
  Bug,
  Shield,
  FileCode,
  Activity,
  Layers,
  BookOpen,
  Target,
  Zap,
  Info
} from "lucide-react";
import { type Project } from "@shared/schema";

interface ComprehensiveAnalysisProps {
  project: Project;
}

export default function ComprehensiveAnalysis({ project }: ComprehensiveAnalysisProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const { data: sonarData } = useQuery({
    queryKey: ['/api/projects', project.id, 'sonar'],
    enabled: !!project.id,
  });

  const { data: swaggerData } = useQuery({
    queryKey: ['/api/projects', project.id, 'swagger'],
    enabled: !!project.id,
  });

  const { data: comprehensiveData } = useQuery({
    queryKey: ['/api/projects', project.id, 'comprehensive'],
    enabled: !!project.id,
  });

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'BLOCKER': return 'bg-red-100 text-red-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'MAJOR': return 'bg-orange-100 text-orange-800';
      case 'MINOR': return 'bg-yellow-100 text-yellow-800';
      case 'INFO': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHttpMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Comprehensive Project Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sonar">Code Quality</TabsTrigger>
              <TabsTrigger value="api">API Docs</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="technology">Technology</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {comprehensiveData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <FileCode className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-2xl font-bold">{comprehensiveData.projectOverview.fileCount}</div>
                      <div className="text-sm text-gray-600">Source Files</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Layers className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <div className="text-2xl font-bold">{comprehensiveData.modules?.length || 0}</div>
                      <div className="text-sm text-gray-600">Modules</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <div className="text-2xl font-bold">{comprehensiveData.requestMappings?.length || 0}</div>
                      <div className="text-sm text-gray-600">API Endpoints</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Activity className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                      <div className="text-2xl font-bold">{comprehensiveData.qualityMetrics?.complexity || 'N/A'}</div>
                      <div className="text-sm text-gray-600">Complexity</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Project Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {comprehensiveData && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Architecture</h4>
                        <p className="text-sm text-gray-600">{comprehensiveData.projectOverview.architecture}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Framework</h4>
                        <Badge variant="secondary">{comprehensiveData.projectOverview.framework}</Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Quality Metrics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <Badge variant="outline">Maintainability: {comprehensiveData.qualityMetrics.maintainability}</Badge>
                          <Badge variant="outline">Testability: {comprehensiveData.qualityMetrics.testability}</Badge>
                          <Badge variant="outline">Documentation: {comprehensiveData.qualityMetrics.documentation}</Badge>
                          <Badge variant="outline">Complexity: {comprehensiveData.qualityMetrics.complexity}</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sonar" className="space-y-6">
              {sonarData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Bug className="w-8 h-8 mx-auto mb-2 text-red-500" />
                        <div className="text-2xl font-bold text-red-600">{sonarData.summary.bugs}</div>
                        <div className="text-sm text-gray-600">Bugs</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Shield className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                        <div className="text-2xl font-bold text-orange-600">{sonarData.summary.vulnerabilities}</div>
                        <div className="text-sm text-gray-600">Vulnerabilities</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Code className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                        <div className="text-2xl font-bold text-yellow-600">{sonarData.summary.codeSmells}</div>
                        <div className="text-sm text-gray-600">Code Smells</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Zap className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <div className="text-2xl font-bold text-green-600">{sonarData.summary.qualityGate}</div>
                        <div className="text-sm text-gray-600">Quality Gate</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Quality Metrics</CardTitle>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid="button-metrics-info">
                              <Info className="w-5 h-5 text-blue-500" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl" data-testid="dialog-metrics-info">
                            <DialogHeader>
                              <DialogTitle>How Metrics Are Calculated</DialogTitle>
                              <DialogDescription>
                                Understanding code quality metrics calculations
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="border-l-4 border-blue-500 pl-4">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Activity className="w-4 h-4" />
                                  Complexity
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  Code complexity is measured using Cyclomatic Complexity, which counts the number of independent paths through the code.
                                </p>
                                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                                  <p><strong>Formula:</strong> M = E - N + 2P</p>
                                  <ul className="list-disc list-inside ml-2 space-y-1">
                                    <li>E = number of edges in the control flow graph</li>
                                    <li>N = number of nodes in the control flow graph</li>
                                    <li>P = number of connected components (usually 1)</li>
                                  </ul>
                                  <p className="mt-2"><strong>In practice:</strong> Each decision point (if, while, for, case, &&, ||) adds +1 to complexity</p>
                                  <p className="mt-2"><strong>Interpretation:</strong></p>
                                  <ul className="list-disc list-inside ml-2">
                                    <li>1-10: Simple, low risk</li>
                                    <li>11-20: Moderate complexity</li>
                                    <li>21-50: High complexity, higher risk</li>
                                    <li>50+: Very high complexity, difficult to test</li>
                                  </ul>
                                </div>
                              </div>

                              <div className="border-l-4 border-green-500 pl-4">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  Test Coverage
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  Test coverage measures the percentage of code executed during automated tests.
                                </p>
                                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                                  <p><strong>Formula:</strong> Coverage = (Lines Executed / Total Lines) × 100</p>
                                  <p className="mt-2"><strong>Types of Coverage:</strong></p>
                                  <ul className="list-disc list-inside ml-2 space-y-1">
                                    <li><strong>Line Coverage:</strong> % of code lines executed by tests</li>
                                    <li><strong>Branch Coverage:</strong> % of decision branches (if/else) tested</li>
                                    <li><strong>Function Coverage:</strong> % of functions called by tests</li>
                                  </ul>
                                  <p className="mt-2"><strong>Interpretation:</strong></p>
                                  <ul className="list-disc list-inside ml-2">
                                    <li>80-100%: Excellent coverage</li>
                                    <li>60-79%: Good coverage</li>
                                    <li>40-59%: Moderate coverage</li>
                                    <li>&lt;40%: Poor coverage, needs improvement</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Lines of Code</div>
                          <div className="text-xl font-semibold">{sonarData.metrics.linesOfCode.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Complexity</div>
                          <div className="text-xl font-semibold">{sonarData.metrics.complexity}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Test Coverage</div>
                          <div className="text-xl font-semibold">{sonarData.metrics.testCoverage}%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Issues Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {sonarData.issues.map((issue: any, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge className={getSeverityColor(issue.severity)}>
                                  {issue.severity}
                                </Badge>
                                <Badge variant="outline">{issue.type.replace('_', ' ')}</Badge>
                              </div>
                              <span className="text-sm text-gray-500">Line {issue.line}</span>
                            </div>
                            <div className="text-sm font-medium mb-1">{issue.message}</div>
                            <div className="text-xs text-gray-600">
                              {issue.component} • Rule: {issue.rule}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              {comprehensiveData?.requestMappings && (
                <Card>
                  <CardHeader>
                    <CardTitle>API Endpoints</CardTitle>
                    <div className="text-sm text-gray-600">
                      Complete list of REST API endpoints with detailed information
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left p-3 font-semibold text-sm">Method</th>
                            <th className="text-left p-3 font-semibold text-sm">Endpoint</th>
                            <th className="text-left p-3 font-semibold text-sm">Description</th>
                            <th className="text-left p-3 font-semibold text-sm">Controller</th>
                            <th className="text-left p-3 font-semibold text-sm">Service</th>
                            <th className="text-left p-3 font-semibold text-sm">Parameters</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comprehensiveData.requestMappings.map((mapping: any, index: number) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-3">
                                <Badge className={getHttpMethodColor(mapping.httpMethod)} data-testid={`badge-method-${index}`}>
                                  {mapping.httpMethod}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <code className="bg-gray-100 px-2 py-1 rounded text-sm" data-testid={`text-endpoint-${index}`}>
                                  {mapping.endpoint}
                                </code>
                              </td>
                              <td className="p-3 text-sm text-gray-600" data-testid={`text-description-${index}`}>
                                {mapping.description}
                              </td>
                              <td className="p-3">
                                <div className="text-sm" data-testid={`text-controller-${index}`}>
                                  <div className="font-medium">{mapping.controllerClass}</div>
                                  <code className="text-xs text-gray-500">{mapping.controllerMethod}</code>
                                </div>
                              </td>
                              <td className="p-3">
                                {mapping.serviceCalled && (
                                  <code className="text-sm bg-gray-100 px-1 rounded" data-testid={`text-service-${index}`}>
                                    {mapping.serviceCalled}
                                  </code>
                                )}
                              </td>
                              <td className="p-3">
                                {mapping.parameters && mapping.parameters.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {mapping.parameters.map((param: any, pIndex: number) => (
                                      <Badge key={pIndex} variant="secondary" className="text-xs" data-testid={`badge-param-${index}-${pIndex}`}>
                                        {param.name}: {param.type}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {comprehensiveData?.methodComments && (
                <Card>
                  <CardHeader>
                    <CardTitle>Method Documentation</CardTitle>
                    <div className="text-sm text-gray-600">
                      JavaDoc comments and method descriptions
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {comprehensiveData.methodComments.map((comment: any, index: number) => (
                        <Collapsible key={index}>
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-gray-50">
                              <div className="flex items-center space-x-2">
                                <Code className="w-4 h-4" />
                                <span className="font-medium">{comment.className}.{comment.methodName}()</span>
                              </div>
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="p-3 border-t bg-gray-50">
                              <div className="space-y-2">
                                <div>
                                  <span className="text-sm font-medium">Description: </span>
                                  <span className="text-sm text-gray-600">{comment.javadoc}</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">Return Type: </span>
                                  <code className="text-sm bg-white px-1 rounded">{comment.returnType}</code>
                                </div>
                                {comment.parameters && comment.parameters.length > 0 && (
                                  <div>
                                    <span className="text-sm font-medium">Parameters: </span>
                                    <div className="mt-1 space-y-1">
                                      {comment.parameters.map((param: any, pIndex: number) => (
                                        <div key={pIndex} className="text-sm">
                                          <code className="bg-white px-1 rounded">{param.name}: {param.type}</code>
                                          <span className="text-gray-600 ml-2">{param.description}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="modules" className="space-y-6">
              {comprehensiveData?.modules && (
                <Card>
                  <CardHeader>
                    <CardTitle>Module Analysis</CardTitle>
                    <div className="text-sm text-gray-600">
                      Detailed analysis of each project module and its functionality
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {comprehensiveData.modules.map((module: any, index: number) => (
                        <Card key={index} className="border-l-4 border-l-blue-200">
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                      {module.type === 'controller' && <Users className="w-4 h-4 text-blue-600" />}
                                      {module.type === 'service' && <Settings className="w-4 h-4 text-green-600" />}
                                      {module.type === 'repository' && <Database className="w-4 h-4 text-orange-600" />}
                                      {module.type === 'entity' && <FileText className="w-4 h-4 text-purple-600" />}
                                    </div>
                                    <div>
                                      <CardTitle className="text-lg">{module.name}</CardTitle>
                                      <Badge variant="outline" className="text-xs">
                                        {module.type.toUpperCase()}
                                      </Badge>
                                    </div>
                                  </div>
                                  <ChevronDown className="w-5 h-5" />
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <CardContent className="pt-0">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">Description</h4>
                                    <p className="text-sm text-gray-600">{module.description}</p>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">Responsibilities</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                      {module.responsibilities?.map((responsibility: string, rIndex: number) => (
                                        <li key={rIndex}>{responsibility}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">Business Logic</h4>
                                    <p className="text-sm text-gray-600">{module.businessLogic}</p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold text-sm mb-2">Methods</h4>
                                      <div className="text-lg font-semibold text-blue-600">{module.methods}</div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm mb-2">Type</h4>
                                      <Badge variant="secondary">{module.type}</Badge>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="technology" className="space-y-6">
              {comprehensiveData?.technologySummary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Technology Stack Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3">Architecture & Patterns</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium">Architecture: </span>
                            <span className="text-sm text-gray-600">{comprehensiveData.technologySummary.architecture}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Framework: </span>
                            <span className="text-sm text-gray-600">{comprehensiveData.technologySummary.framework}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-sm font-medium">Design Patterns: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {comprehensiveData.technologySummary.patterns?.map((pattern: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {pattern}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Dependencies</h4>
                        <div className="space-y-2">
                          {comprehensiveData.technologySummary.dependencies?.map((dep: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <span className="text-sm font-medium">{dep.name}</span>
                                {dep.version && <span className="text-xs text-gray-500 ml-2">v{dep.version}</span>}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">{dep.scope}</Badge>
                                <span className="text-xs text-gray-600">{dep.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">Build & Runtime</h4>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Build Tool:</span> {comprehensiveData.technologySummary.buildTool}</div>
                            <div><span className="font-medium">Java Version:</span> {comprehensiveData.technologySummary.javaVersion}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">Testing & Security</h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium">Testing: </span>
                              <div className="flex flex-wrap gap-1">
                                {comprehensiveData.technologySummary.testingFrameworks?.map((framework: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {framework}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Security: </span>
                              <div className="flex flex-wrap gap-1">
                                {comprehensiveData.technologySummary.securityFrameworks?.map((framework: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {framework}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}