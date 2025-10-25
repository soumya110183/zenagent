import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Network, 
  RefreshCw, 
  Download, 
  ZoomIn, 
  ZoomOut,
  Info,
  Loader2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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

  // Fetch projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery<any[]>({
    queryKey: ['/api/projects'],
  });

  // Fetch data flow for selected project
  const { data: dataFlowData, isLoading: isLoadingFlow, refetch } = useQuery<FunctionCallData>({
    queryKey: ['/api/data-flow', selectedProjectId],
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

        {/* Project Selection & Controls */}
        <Card data-testid="card-controls">
          <CardHeader>
            <CardTitle>Project Selection</CardTitle>
            <CardDescription>Select a project to analyze its data flow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Select
                  value={selectedProjectId}
                  onValueChange={setSelectedProjectId}
                  disabled={isLoadingProjects}
                >
                  <SelectTrigger data-testid="select-project">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedProjectId || isLoadingFlow}
                  data-testid="button-analyze"
                >
                  {isLoadingFlow ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={!nodes.length}
                  variant="outline"
                  data-testid="button-export"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
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
              Select a project and click "Analyze" to generate an interactive data flow diagram showing how functions call each other.
            </AlertDescription>
          </Alert>
        )}

        {/* Flow Diagram */}
        <Card data-testid="card-flow-diagram">
          <CardHeader>
            <CardTitle>Function Call Graph</CardTitle>
            <CardDescription>
              Interactive visualization of function calls and data flow
            </CardDescription>
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
