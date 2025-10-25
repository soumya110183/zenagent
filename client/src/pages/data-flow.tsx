import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import cytoscape from 'cytoscape';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Network, 
  Download, 
  Info,
  Loader2,
  Upload,
  Github,
  ZoomIn,
  ZoomOut,
  Maximize
} from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@shared/schema';

interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    type: string;
  };
}

interface CytoscapeEdge {
  data: {
    id: string;
    source: string;
    target: string;
  };
}

interface FunctionCallData {
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
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
  const [flowStats, setFlowStats] = useState<FunctionCallData['stats'] | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      }, 3000);
      
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
      
      // Poll for project completion
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
      }, 3000);
      
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

  // Initialize and update Cytoscape graph
  useEffect(() => {
    if (!containerRef.current || !dataFlowData) return;

    // Destroy existing instance
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    // Create Cytoscape instance
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: {
        nodes: dataFlowData.nodes,
        edges: dataFlowData.edges,
      },
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': '#60a5fa',
            'color': '#fff',
            'text-outline-color': '#1e40af',
            'text-outline-width': 2,
            'font-size': '12px',
            'width': 60,
            'height': 60,
          },
        },
        {
          selector: 'node[type = "controller"]',
          style: {
            'background-color': '#3b82f6',
          },
        },
        {
          selector: 'node[type = "service"]',
          style: {
            'background-color': '#10b981',
          },
        },
        {
          selector: 'node[type = "repository"]',
          style: {
            'background-color': '#8b5cf6',
          },
        },
        {
          selector: 'node[type = "entity"]',
          style: {
            'background-color': '#f59e0b',
          },
        },
        {
          selector: 'node[type = "util"]',
          style: {
            'background-color': '#6b7280',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1.5,
          },
        },
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 50,
        spacingFactor: 1.5,
      },
      minZoom: 0.1,
      maxZoom: 3,
      wheelSensitivity: 0.2,
    });

    // Update stats
    setFlowStats(dataFlowData.stats);

    // Cleanup
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [dataFlowData]);

  const handleExport = () => {
    if (!cyRef.current) return;
    
    const png = cyRef.current.png({ scale: 2 });
    const link = document.createElement('a');
    link.href = png;
    link.download = `data-flow-${selectedProjectId}.png`;
    link.click();
  };

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
      cyRef.current.center();
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
      cyRef.current.center();
    }
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit();
    }
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

        {/* Loading Indicator */}
        {isLoadingFlow && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Analyzing data flow patterns...
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
              {cyRef.current && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleZoomIn}
                    variant="outline"
                    size="icon"
                    data-testid="button-zoom-in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleZoomOut}
                    variant="outline"
                    size="icon"
                    data-testid="button-zoom-out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleFit}
                    variant="outline"
                    size="icon"
                    data-testid="button-fit"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleExport}
                    variant="outline"
                    data-testid="button-export"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PNG
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative bg-gray-50">
              <div 
                ref={containerRef} 
                style={{ height: '700px', width: '100%' }}
                data-testid="cytoscape-container"
              />
              
              {/* Legend */}
              {cyRef.current && (
                <div className="absolute top-4 right-4 bg-white p-3 rounded shadow-md space-y-2">
                  <div className="text-sm font-semibold mb-2">Node Types</div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Controllers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Services</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Repositories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Entities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    <span className="text-sm">Utilities</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
