import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Network, 
  RefreshCw, 
  Download, 
  ZoomIn, 
  ZoomOut,
  Info,
  Loader2,
  Upload,
  Github
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@shared/schema';

interface FunctionCallData {
  nodes: Node[];
  edges: Edge[];
  stats: {
    totalFunctions: number;
    totalCalls: number;
    maxDepth: number;
    cyclicDependencies: number;
  };
}

export default function DataFlow() {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowStats, setFlowStats] = useState<FunctionCallData['stats'] | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('zipFile', file);
      
      const response = await fetch('/api/projects/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: async (project: Project) => {
      toast({
        title: "Upload Successful",
        description: "Your project is being analyzed. Data flow will be generated once analysis completes.",
      });
      setSelectedProjectId(project.id);
      
      // Poll for project completion, then trigger data flow analysis
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/projects/${project.id}`);
          const updatedProject = await response.json();
          
          if (updatedProject.status === 'completed') {
            clearInterval(pollInterval);
            refetch();
            toast({
              title: "Analysis Complete",
              description: "Data flow visualization is ready!",
            });
          } else if (updatedProject.status === 'failed') {
            clearInterval(pollInterval);
            toast({
              title: "Analysis Failed",
              description: "Project analysis failed. Please try again.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error polling project status:', error);
        }
      }, 3000); // Poll every 3 seconds
      
      // Stop polling after 5 minutes
      setTimeout(() => clearInterval(pollInterval), 300000);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // GitHub analysis mutation
  const githubMutation = useMutation({
    mutationFn: async (): Promise<Project> => {
      const response = await fetch('/api/projects/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubUrl,
          githubBranch,
          name: githubUrl.split('/').pop()?.replace('.git', '') || 'GitHub Project',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'GitHub analysis failed');
      }
      
      return response.json();
    },
    onSuccess: async (project: Project) => {
      toast({
        title: "Analysis Started",
        description: "GitHub repository is being cloned and analyzed. Data flow will be generated once complete.",
      });
      setSelectedProjectId(project.id);
      setGithubUrl('');
      setGithubBranch('main');
      
      // Poll for project completion, then trigger data flow analysis
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/projects/${project.id}`);
          const updatedProject = await response.json();
          
          if (updatedProject.status === 'completed') {
            clearInterval(pollInterval);
            refetch();
            toast({
              title: "Analysis Complete",
              description: "Data flow visualization is ready!",
            });
          } else if (updatedProject.status === 'failed') {
            clearInterval(pollInterval);
            toast({
              title: "Analysis Failed",
              description: "Project analysis failed. Please try again.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error polling project status:', error);
        }
      }, 3000); // Poll every 3 seconds
      
      // Stop polling after 5 minutes
      setTimeout(() => clearInterval(pollInterval), 300000);
    },
    onError: (error: Error) => {
      toast({
        title: "GitHub Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch data flow for selected project
  const { data: dataFlowData, isLoading: isLoadingFlow, refetch } = useQuery<FunctionCallData>({
    queryKey: ['/api/data-flow', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) {
        throw new Error('No project selected');
      }
      const response = await fetch(`/api/data-flow/${selectedProjectId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data flow');
      }
      return response.json();
    },
    enabled: !!selectedProjectId,
  });

  // Update nodes and edges when data changes
  useEffect(() => {
    if (dataFlowData) {
      setNodes(dataFlowData.nodes);
      setEdges(dataFlowData.edges);
      setFlowStats(dataFlowData.stats);
    }
  }, [dataFlowData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAnalyze = async () => {
    if (!selectedProjectId) {
      toast({
        title: "No Project Selected",
        description: "Please select a project to analyze",
        variant: "destructive",
      });
      return;
    }

    try {
      await refetch();
      toast({
        title: "Success",
        description: "Data flow analysis completed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze data flow",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ nodes, edges, stats: flowStats }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data-flow-${selectedProjectId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        uploadMutation.mutate(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a ZIP file containing source code.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      uploadMutation.mutate(file);
    }
  };

  const handleGithubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl) {
      toast({
        title: "GitHub URL Required",
        description: "Please enter a GitHub repository URL",
        variant: "destructive",
      });
      return;
    }
    githubMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3" data-testid="text-page-title">
              <Network className="w-8 h-8 text-blue-600" />
              Data Flow Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              Visualize function call graphs and data flow patterns in your codebase
            </p>
          </div>
        </div>

        {/* Project Upload */}
        <Card data-testid="card-controls">
          <CardHeader>
            <CardTitle>Project Source</CardTitle>
            <CardDescription>Upload a ZIP file or analyze a GitHub repository</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload ZIP
                </TabsTrigger>
                <TabsTrigger value="github">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </TabsTrigger>
              </TabsList>

              {/* Upload ZIP Tab */}
              <TabsContent value="upload" className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  data-testid="dropzone-upload"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">
                    Drag and drop your ZIP file here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click the button below to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleFileInput}
                    className="hidden"
                    data-testid="input-file"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                    data-testid="button-browse"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Browse Files
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* GitHub Tab */}
              <TabsContent value="github" className="space-y-4">
                <form onSubmit={handleGithubSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-url">Repository URL</Label>
                    <Input
                      id="github-url"
                      type="url"
                      placeholder="https://github.com/username/repository"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      disabled={githubMutation.isPending}
                      data-testid="input-github-url"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github-branch">Branch (optional)</Label>
                    <Input
                      id="github-branch"
                      type="text"
                      placeholder="main"
                      value={githubBranch}
                      onChange={(e) => setGithubBranch(e.target.value)}
                      disabled={githubMutation.isPending}
                      data-testid="input-github-branch"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={githubMutation.isPending || !githubUrl}
                    className="w-full"
                    data-testid="button-github-analyze"
                  >
                    {githubMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cloning...
                      </>
                    ) : (
                      <>
                        <Github className="w-4 h-4 mr-2" />
                        Analyze GitHub Repository
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>

        {/* Statistics */}
        {flowStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{flowStats.totalFunctions}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Functions</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{flowStats.totalCalls}</div>
                  <div className="text-sm text-gray-600 mt-1">Function Calls</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{flowStats.maxDepth}</div>
                  <div className="text-sm text-gray-600 mt-1">Max Call Depth</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{flowStats.cyclicDependencies}</div>
                  <div className="text-sm text-gray-600 mt-1">Cyclic Dependencies</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Alert */}
        {!selectedProjectId && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Upload a ZIP file or provide a GitHub repository URL to generate an interactive data flow diagram showing how functions call each other.
            </AlertDescription>
          </Alert>
        )}

        {/* Flow Diagram */}
        <Card data-testid="card-flow-diagram">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Function Call Graph</CardTitle>
                <CardDescription>
                  Interactive visualization of function calls and data flow
                </CardDescription>
              </div>
              {nodes.length > 0 && (
                <Button
                  onClick={handleExport}
                  variant="outline"
                  data-testid="button-export"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div style={{ height: '700px' }} className="bg-gray-50">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                attributionPosition="bottom-left"
              >
                <Background />
                <Controls />
                <Panel position="top-right" className="bg-white p-2 rounded shadow-md">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-blue-100">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      Controllers
                    </Badge>
                    <Badge variant="outline" className="bg-green-100">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      Services
                    </Badge>
                    <Badge variant="outline" className="bg-purple-100">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      Repositories
                    </Badge>
                  </div>
                </Panel>
              </ReactFlow>
            </div>
          </CardContent>
        </Card>

        {/* Legend & Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Controls</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <strong>Drag</strong> - Move nodes around</li>
                  <li>• <strong>Scroll</strong> - Zoom in/out</li>
                  <li>• <strong>Click + Drag</strong> background - Pan the canvas</li>
                  <li>• <strong>Click</strong> node - View function details</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Node Types</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <strong>Blue nodes</strong> - Controller functions (entry points)</li>
                  <li>• <strong>Green nodes</strong> - Service functions (business logic)</li>
                  <li>• <strong>Purple nodes</strong> - Repository functions (data access)</li>
                  <li>• <strong>Arrows</strong> - Function call direction</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
