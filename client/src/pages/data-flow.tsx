import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import cytoscape from 'cytoscape';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  Maximize,
  Filter
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface DataFieldFlowData {
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
  stats: {
    totalFields: number;
    totalAccesses: number;
    sharedFields: number;
  };
}

interface ImpactAnalysisData {
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    impactLevel: string;
    distance: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    type: string;
  }>;
  stats: {
    totalImpacted: number;
    directUpstream: number;
    directDownstream: number;
    maxDepth: number;
    criticalFunctions: string[];
  };
}

interface DependencyGraphData {
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    complexity: number;
    inDegree: number;
    outDegree: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    type: string;
    weight: number;
  }>;
  stats: {
    totalFiles: number;
    totalFunctions: number;
    totalDependencies: number;
    avgComplexity: number;
    cyclicDependencies: number;
    isolatedComponents: number;
  };
}

export default function DataFlow() {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [flowStats, setFlowStats] = useState<FunctionCallData['stats'] | null>(null);
  const [fieldStats, setFieldStats] = useState<DataFieldFlowData['stats'] | null>(null);
  const [githubUrl, setGithubUrl] = useState('https://github.com/kartik1502/Spring-Boot-Microservices-Banking-Application');
  const [githubBranch, setGithubBranch] = useState('main');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFunctions, setSelectedFunctions] = useState<Set<string>>(new Set());
  const [allFunctions, setAllFunctions] = useState<Array<{ id: string; label: string; type: string }>>([]);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [allFields, setAllFields] = useState<Array<{ id: string; label: string; type: string }>>([]);
  const [activeTab, setActiveTab] = useState<'function-call' | 'data-field'>('function-call');
  const [impactStats, setImpactStats] = useState<ImpactAnalysisData['stats'] | null>(null);
  const [depStats, setDepStats] = useState<DependencyGraphData['stats'] | null>(null);
  const [selectedImpactFunctions, setSelectedImpactFunctions] = useState<Set<string>>(new Set());
  const [allImpactFunctions, setAllImpactFunctions] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedDepNodes, setSelectedDepNodes] = useState<Set<string>>(new Set());
  const [allDepNodes, setAllDepNodes] = useState<Array<{ id: string; label: string; type: string }>>([]);
  const [demographicFieldName, setDemographicFieldName] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cyFieldRef = useRef<cytoscape.Core | null>(null);
  const containerFieldRef = useRef<HTMLDivElement>(null);
  const cyImpactRef = useRef<cytoscape.Core | null>(null);
  const containerImpactRef = useRef<HTMLDivElement>(null);
  const cyDepRef = useRef<cytoscape.Core | null>(null);
  const containerDepRef = useRef<HTMLDivElement>(null);

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
            refetchFieldFlow();
            refetchImpact();
            refetchDepGraph();
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
            refetchFieldFlow();
            refetchImpact();
            refetchDepGraph();
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
    queryKey: ['/api/data-flow', selectedProjectId, isFiltered, demographicFieldName],
    queryFn: async () => {
      if (!selectedProjectId) {
        throw new Error('No project selected');
      }
      const url = isFiltered && demographicFieldName 
        ? `/api/data-flow/${selectedProjectId}?fieldName=${encodeURIComponent(demographicFieldName)}`
        : `/api/data-flow/${selectedProjectId}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data flow');
      }
      return response.json();
    },
    enabled: !!selectedProjectId,
  });

  // Fetch data field flow for selected project
  const { data: dataFieldFlowData, isLoading: isLoadingFieldFlow, refetch: refetchFieldFlow } = useQuery<DataFieldFlowData>({
    queryKey: ['/api/data-field-flow', selectedProjectId, isFiltered, demographicFieldName],
    queryFn: async () => {
      if (!selectedProjectId) {
        throw new Error('No project selected');
      }
      const url = isFiltered && demographicFieldName 
        ? `/api/data-field-flow/${selectedProjectId}?fieldName=${encodeURIComponent(demographicFieldName)}`
        : `/api/data-field-flow/${selectedProjectId}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data field flow');
      }
      return response.json();
    },
    enabled: !!selectedProjectId,
  });

  // Fetch impact analysis for selected project
  const { data: impactData, isLoading: isLoadingImpact, refetch: refetchImpact } = useQuery<ImpactAnalysisData>({
    queryKey: ['/api/impact-analysis', selectedProjectId, isFiltered, demographicFieldName],
    queryFn: async () => {
      if (!selectedProjectId) {
        throw new Error('No project selected');
      }
      const url = isFiltered && demographicFieldName 
        ? `/api/impact-analysis/${selectedProjectId}?fieldName=${encodeURIComponent(demographicFieldName)}`
        : `/api/impact-analysis/${selectedProjectId}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch impact analysis');
      }
      return response.json();
    },
    enabled: !!selectedProjectId,
  });

  // Fetch dependency graph for selected project
  const { data: depGraphData, isLoading: isLoadingDepGraph, refetch: refetchDepGraph } = useQuery<DependencyGraphData>({
    queryKey: ['/api/dependency-graph', selectedProjectId, isFiltered, demographicFieldName],
    queryFn: async () => {
      if (!selectedProjectId) {
        throw new Error('No project selected');
      }
      const url = isFiltered && demographicFieldName 
        ? `/api/dependency-graph/${selectedProjectId}?fieldName=${encodeURIComponent(demographicFieldName)}`
        : `/api/dependency-graph/${selectedProjectId}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dependency graph');
      }
      return response.json();
    },
    enabled: !!selectedProjectId,
  });

  // Initialize and update Cytoscape graph
  useEffect(() => {
    if (!containerRef.current || !dataFlowData) return;

    // Extract all functions for checkbox list
    const functions = dataFlowData.nodes.map(node => ({
      id: node.data.id,
      label: node.data.label,
      type: node.data.type,
    }));
    setAllFunctions(functions);
    
    // Always reset with all functions selected when new data arrives
    setSelectedFunctions(new Set(functions.map(f => f.id)));

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

  // Update graph visibility when selected functions change
  useEffect(() => {
    if (!cyRef.current) return;

    try {
      // Show/hide nodes based on selection
      cyRef.current.nodes().forEach((node) => {
        const nodeId = node.data('id');
        if (selectedFunctions.has(nodeId)) {
          node.style('display', 'element');
        } else {
          node.style('display', 'none');
        }
      });

      // Hide edges if source or target is hidden
      cyRef.current.edges().forEach((edge) => {
        const source = edge.data('source');
        const target = edge.data('target');
        if (selectedFunctions.has(source) && selectedFunctions.has(target)) {
          edge.style('display', 'element');
        } else {
          edge.style('display', 'none');
        }
      });
    } catch (error) {
      // Ignore errors during graph recreation
      console.debug('Graph visibility update skipped during recreation');
    }
  }, [selectedFunctions]);

  // Initialize data field flow Cytoscape graph
  useEffect(() => {
    if (!containerFieldRef.current || !dataFieldFlowData) return;

    // Extract all fields for checkbox list
    const fields = dataFieldFlowData.nodes.map(node => ({
      id: node.data.id,
      label: node.data.label,
      type: node.data.type,
    }));
    console.log('Data Field Flow - Nodes loaded:', fields.length, 'Edges:', dataFieldFlowData.edges.length);
    setAllFields(fields);
    
    // Always reset with all fields selected when new data arrives
    setSelectedFields(new Set(fields.map(f => f.id)));

    // Destroy existing instance
    if (cyFieldRef.current) {
      cyFieldRef.current.destroy();
    }

    // Create Cytoscape instance for field flow
    cyFieldRef.current = cytoscape({
      container: containerFieldRef.current,
      elements: {
        nodes: dataFieldFlowData.nodes,
        edges: dataFieldFlowData.edges,
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
          selector: 'node[type = "field"]',
          style: {
            'background-color': '#ec4899',
            'shape': 'rectangle',
          },
        },
        {
          selector: 'node[type = "method"]',
          style: {
            'background-color': '#06b6d4',
            'shape': 'ellipse',
          },
        },
        {
          selector: 'node[type = "parameter"]',
          style: {
            'background-color': '#f59e0b',
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
            'label': 'data(label)',
            'font-size': '10px',
            'text-background-color': '#fff',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
          },
        },
      ],
      layout: {
        name: 'cose',
        padding: 50,
        nodeRepulsion: 8000,
        idealEdgeLength: 100,
      },
      minZoom: 0.1,
      maxZoom: 3,
      wheelSensitivity: 0.2,
    });

    // Update stats
    setFieldStats(dataFieldFlowData.stats);

    // Cleanup
    return () => {
      if (cyFieldRef.current) {
        cyFieldRef.current.destroy();
      }
    };
  }, [dataFieldFlowData]);

  // Update field graph visibility when selected fields change
  useEffect(() => {
    if (!cyFieldRef.current) return;

    try {
      // Show/hide nodes based on selection
      cyFieldRef.current.nodes().forEach((node) => {
        const nodeId = node.data('id');
        if (selectedFields.has(nodeId)) {
          node.style('display', 'element');
        } else {
          node.style('display', 'none');
        }
      });

      // Hide edges if source or target is hidden
      cyFieldRef.current.edges().forEach((edge) => {
        const source = edge.data('source');
        const target = edge.data('target');
        if (selectedFields.has(source) && selectedFields.has(target)) {
          edge.style('display', 'element');
        } else {
          edge.style('display', 'none');
        }
      });
    } catch (error) {
      // Ignore errors during graph recreation
      console.debug('Graph visibility update skipped during recreation');
    }
  }, [selectedFields]);

  // Initialize Impact Analysis Cytoscape graph
  useEffect(() => {
    if (!containerImpactRef.current || !impactData) return;

    const functions = impactData.nodes.map(node => ({
      id: node.id,
      label: node.label,
    }));
    setAllImpactFunctions(functions);
    setSelectedImpactFunctions(new Set(functions.map(f => f.id)));

    if (cyImpactRef.current) {
      cyImpactRef.current.destroy();
    }

    cyImpactRef.current = cytoscape({
      container: containerImpactRef.current,
      elements: {
        nodes: impactData.nodes.map(n => ({ data: n })),
        edges: impactData.edges.map(e => ({ data: { id: `${e.source}-${e.target}`, source: e.source, target: e.target, type: e.type } })),
      },
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': '#3b82f6',
            'color': '#fff',
            'text-outline-color': '#1e40af',
            'text-outline-width': 2,
            'font-size': '11px',
            'width': 55,
            'height': 55,
          },
        },
        {
          selector: 'node[type = "function"]',
          style: {
            'background-color': '#8b5cf6',
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
          },
        },
        {
          selector: 'edge[type = "calls"]',
          style: {
            'line-color': '#10b981',
          },
        },
        {
          selector: 'edge[type = "called-by"]',
          style: {
            'line-color': '#f59e0b',
          },
        },
      ],
      layout: {
        name: 'cose',
        padding: 50,
        nodeRepulsion: 10000,
        idealEdgeLength: 120,
      },
      minZoom: 0.1,
      maxZoom: 3,
      wheelSensitivity: 0.2,
    });

    setImpactStats(impactData.stats);

    return () => {
      if (cyImpactRef.current) {
        cyImpactRef.current.destroy();
      }
    };
  }, [impactData]);

  // Update Impact Analysis graph visibility
  useEffect(() => {
    if (!cyImpactRef.current) return;

    try {
      cyImpactRef.current.nodes().forEach((node) => {
        const nodeId = node.data('id');
        if (selectedImpactFunctions.has(nodeId)) {
          node.style('display', 'element');
        } else {
          node.style('display', 'none');
        }
      });

      cyImpactRef.current.edges().forEach((edge) => {
        const source = edge.data('source');
        const target = edge.data('target');
        if (selectedImpactFunctions.has(source) && selectedImpactFunctions.has(target)) {
          edge.style('display', 'element');
        } else {
          edge.style('display', 'none');
        }
      });
    } catch (error) {
      // Ignore errors during graph recreation
      console.debug('Graph visibility update skipped during recreation');
    }
  }, [selectedImpactFunctions]);

  // Initialize Dependency Graph Cytoscape graph
  useEffect(() => {
    if (!containerDepRef.current || !depGraphData) return;

    const nodes = depGraphData.nodes.map(node => ({
      id: node.id,
      label: node.label,
      type: node.type,
    }));
    setAllDepNodes(nodes);
    setSelectedDepNodes(new Set(nodes.map(n => n.id)));

    if (cyDepRef.current) {
      cyDepRef.current.destroy();
    }

    cyDepRef.current = cytoscape({
      container: containerDepRef.current,
      elements: {
        nodes: depGraphData.nodes.map(n => ({ data: n })),
        edges: depGraphData.edges.map(e => ({ data: { id: `${e.source}-${e.target}`, source: e.source, target: e.target, type: e.type } })),
      },
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': '#06b6d4',
            'color': '#fff',
            'text-outline-color': '#0e7490',
            'text-outline-width': 2,
            'font-size': '10px',
            'width': 50,
            'height': 50,
          },
        },
        {
          selector: 'node[type = "file"]',
          style: {
            'background-color': '#fbbf24',
            'shape': 'rectangle',
          },
        },
        {
          selector: 'node[type = "function"]',
          style: {
            'background-color': '#06b6d4',
            'shape': 'ellipse',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'edge[type = "calls"]',
          style: {
            'line-color': '#3b82f6',
          },
        },
        {
          selector: 'edge[type = "contains"]',
          style: {
            'line-color': '#a855f7',
            'line-style': 'dashed',
          },
        },
        {
          selector: 'edge[type = "imports"]',
          style: {
            'line-color': '#f97316',
          },
        },
      ],
      layout: {
        name: 'cose',
        padding: 50,
        nodeRepulsion: 12000,
        idealEdgeLength: 100,
      },
      minZoom: 0.1,
      maxZoom: 3,
      wheelSensitivity: 0.2,
    });

    setDepStats(depGraphData.stats);

    return () => {
      if (cyDepRef.current) {
        cyDepRef.current.destroy();
      }
    };
  }, [depGraphData]);

  // Update Dependency Graph visibility
  useEffect(() => {
    if (!cyDepRef.current) return;

    try {
      cyDepRef.current.nodes().forEach((node) => {
        const nodeId = node.data('id');
        if (selectedDepNodes.has(nodeId)) {
          node.style('display', 'element');
        } else {
          node.style('display', 'none');
        }
      });

      cyDepRef.current.edges().forEach((edge) => {
        const source = edge.data('source');
        const target = edge.data('target');
        if (selectedDepNodes.has(source) && selectedDepNodes.has(target)) {
          edge.style('display', 'element');
        } else {
          edge.style('display', 'none');
        }
      });
    } catch (error) {
      // Ignore errors during graph recreation
      console.debug('Graph visibility update skipped during recreation');
    }
  }, [selectedDepNodes]);

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

  const toggleFunction = (functionId: string) => {
    setSelectedFunctions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(functionId)) {
        newSet.delete(functionId);
      } else {
        newSet.add(functionId);
      }
      return newSet;
    });
  };

  const selectAllFunctions = () => {
    setSelectedFunctions(new Set(allFunctions.map(f => f.id)));
  };

  const deselectAllFunctions = () => {
    setSelectedFunctions(new Set());
  };

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId);
      } else {
        newSet.add(fieldId);
      }
      return newSet;
    });
  };

  const selectAllFields = () => {
    setSelectedFields(new Set(allFields.map(f => f.id)));
  };

  const deselectAllFields = () => {
    setSelectedFields(new Set());
  };

  const handleFieldExport = () => {
    if (!cyFieldRef.current) return;
    
    const png = cyFieldRef.current.png({ scale: 2 });
    const link = document.createElement('a');
    link.href = png;
    link.download = `data-field-flow-${selectedProjectId}.png`;
    link.click();
  };

  const handleFieldZoomIn = () => {
    if (cyFieldRef.current) {
      cyFieldRef.current.zoom(cyFieldRef.current.zoom() * 1.2);
      cyFieldRef.current.center();
    }
  };

  const handleFieldZoomOut = () => {
    if (cyFieldRef.current) {
      cyFieldRef.current.zoom(cyFieldRef.current.zoom() * 0.8);
      cyFieldRef.current.center();
    }
  };

  const handleFieldFit = () => {
    if (cyFieldRef.current) {
      cyFieldRef.current.fit();
    }
  };

  // Impact Analysis handlers
  const toggleImpactFunction = (funcId: string) => {
    setSelectedImpactFunctions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(funcId)) {
        newSet.delete(funcId);
      } else {
        newSet.add(funcId);
      }
      return newSet;
    });
  };

  const selectAllImpactFunctions = () => {
    setSelectedImpactFunctions(new Set(allImpactFunctions.map(f => f.id)));
  };

  const deselectAllImpactFunctions = () => {
    setSelectedImpactFunctions(new Set());
  };

  const handleImpactExport = () => {
    if (!cyImpactRef.current) return;
    const png = cyImpactRef.current.png({ scale: 2 });
    const link = document.createElement('a');
    link.href = png;
    link.download = `impact-analysis-${selectedProjectId}.png`;
    link.click();
  };

  const handleImpactZoomIn = () => {
    if (cyImpactRef.current) {
      cyImpactRef.current.zoom(cyImpactRef.current.zoom() * 1.2);
      cyImpactRef.current.center();
    }
  };

  const handleImpactZoomOut = () => {
    if (cyImpactRef.current) {
      cyImpactRef.current.zoom(cyImpactRef.current.zoom() * 0.8);
      cyImpactRef.current.center();
    }
  };

  const handleImpactFit = () => {
    if (cyImpactRef.current) {
      cyImpactRef.current.fit();
    }
  };

  // Dependency Graph handlers
  const toggleDepNode = (nodeId: string) => {
    setSelectedDepNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const selectAllDepNodes = () => {
    setSelectedDepNodes(new Set(allDepNodes.map(n => n.id)));
  };

  const deselectAllDepNodes = () => {
    setSelectedDepNodes(new Set());
  };

  const handleDepExport = () => {
    if (!cyDepRef.current) return;
    const png = cyDepRef.current.png({ scale: 2 });
    const link = document.createElement('a');
    link.href = png;
    link.download = `dependency-graph-${selectedProjectId}.png`;
    link.click();
  };

  const handleDepZoomIn = () => {
    if (cyDepRef.current) {
      cyDepRef.current.zoom(cyDepRef.current.zoom() * 1.2);
      cyDepRef.current.center();
    }
  };

  const handleDepZoomOut = () => {
    if (cyDepRef.current) {
      cyDepRef.current.zoom(cyDepRef.current.zoom() * 0.8);
      cyDepRef.current.center();
    }
  };

  const handleDepFit = () => {
    if (cyDepRef.current) {
      cyDepRef.current.fit();
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

  const handleFilterByField = () => {
    if (!demographicFieldName.trim()) {
      toast({
        title: "Field Name Required",
        description: "Please enter a demographic field name to filter",
        variant: "destructive",
      });
      return;
    }
    setIsFiltered(true);
    refetch();
    refetchFieldFlow();
    refetchImpact();
    refetchDepGraph();
    toast({
      title: "Filtering Applied",
      description: `Showing only data related to field: ${demographicFieldName}`,
    });
  };

  const handleShowAll = () => {
    setIsFiltered(false);
    setDemographicFieldName('');
    refetch();
    refetchFieldFlow();
    refetchImpact();
    refetchDepGraph();
    toast({
      title: "Filter Removed",
      description: "Showing all data",
    });
  };

  const handleExportHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Imaging Analysis Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
    h1, h2, h3 { color: #2563eb; }
    .section { margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
    .stat-card { background: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
    .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; }
    .filter-info { background: #dbeafe; padding: 10px; border-radius: 6px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>Data Imaging Analysis Report</h1>
  <p>Generated on: ${new Date().toLocaleString()}</p>
  ${isFiltered ? `<div class="filter-info"><strong>Filtered by field:</strong> ${demographicFieldName}</div>` : ''}
  
  ${flowStats ? `
  <div class="section">
    <h2>Function Call Graph Statistics</h2>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${flowStats.totalFunctions}</div>
        <div class="stat-label">Total Functions</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${flowStats.totalCalls}</div>
        <div class="stat-label">Function Calls</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${flowStats.maxDepth}</div>
        <div class="stat-label">Max Call Depth</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${flowStats.cyclicDependencies}</div>
        <div class="stat-label">Cyclic Dependencies</div>
      </div>
    </div>
  </div>
  ` : ''}
  
  ${fieldStats ? `
  <div class="section">
    <h2>Data Field Flow Statistics</h2>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${fieldStats.totalFields}</div>
        <div class="stat-label">Total Fields</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${fieldStats.totalAccesses}</div>
        <div class="stat-label">Total Accesses</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${fieldStats.sharedFields}</div>
        <div class="stat-label">Shared Fields</div>
      </div>
    </div>
  </div>
  ` : ''}
  
  ${impactStats ? `
  <div class="section">
    <h2>Impact Analysis Statistics</h2>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${impactStats.totalImpacted}</div>
        <div class="stat-label">Total Impacted</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${impactStats.directUpstream}</div>
        <div class="stat-label">Direct Upstream</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${impactStats.directDownstream}</div>
        <div class="stat-label">Direct Downstream</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${impactStats.maxDepth}</div>
        <div class="stat-label">Max Depth</div>
      </div>
    </div>
    ${impactStats.criticalFunctions.length > 0 ? `
    <h3>Critical Functions</h3>
    <table>
      <thead>
        <tr><th>Function Name</th></tr>
      </thead>
      <tbody>
        ${impactStats.criticalFunctions.map(func => `<tr><td>${func}</td></tr>`).join('')}
      </tbody>
    </table>
    ` : ''}
  </div>
  ` : ''}
  
  ${depStats ? `
  <div class="section">
    <h2>Dependency Graph Statistics</h2>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${depStats.totalFiles}</div>
        <div class="stat-label">Total Files</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${depStats.totalFunctions}</div>
        <div class="stat-label">Total Functions</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${depStats.totalDependencies}</div>
        <div class="stat-label">Total Dependencies</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${depStats.avgComplexity.toFixed(2)}</div>
        <div class="stat-label">Avg Complexity</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${depStats.cyclicDependencies}</div>
        <div class="stat-label">Cyclic Dependencies</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${depStats.isolatedComponents}</div>
        <div class="stat-label">Isolated Components</div>
      </div>
    </div>
  </div>
  ` : ''}
  
  <div class="section">
    <p><em>This report was generated by Zengent AI Data Imaging platform.</em></p>
  </div>
</body>
</html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data-imaging-report-${isFiltered ? demographicFieldName + '-' : ''}${new Date().getTime()}.html`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: "HTML report has been downloaded",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3" data-testid="text-page-title">
              <Network className="w-8 h-8 text-blue-600" />
              Data Imaging
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
                      placeholder="https://github.com/kartik1502/Spring-Boot-Microservices-Banking-Application"
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

        {/* Demographic Field Filter */}
        <Card data-testid="card-demographic-filter">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Demographic Field Filter
            </CardTitle>
            <CardDescription>
              Filter analysis by specific demographic field name or view all data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="demographic-field">Demographic Field Name</Label>
                <Input
                  id="demographic-field"
                  type="text"
                  placeholder="e.g., email, phoneNumber, ssn"
                  value={demographicFieldName}
                  onChange={(e) => setDemographicFieldName(e.target.value)}
                  data-testid="input-demographic-field"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleFilterByField}
                  disabled={!demographicFieldName.trim()}
                  variant={isFiltered ? "default" : "outline"}
                  data-testid="button-filter-by-field"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Field
                </Button>
                <Button
                  onClick={handleShowAll}
                  variant={!isFiltered ? "default" : "outline"}
                  data-testid="button-show-all"
                >
                  Show All
                </Button>
                <Button
                  onClick={handleExportHTML}
                  variant="secondary"
                  data-testid="button-export-html"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export HTML
                </Button>
              </div>
            </div>
            {isFiltered && (
              <Alert className="mt-4 bg-blue-50 border-blue-200">
                <Filter className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Currently filtering by field: <strong>{demographicFieldName}</strong>
                </AlertDescription>
              </Alert>
            )}
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
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mt-1">
                    <span>Max Call Depth</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            type="button"
                            className="inline-flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            aria-label="Information about Max Call Depth"
                          >
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>The maximum number of function calls in a chain. For example, if function A calls B, and B calls C, the call depth is 3. Higher depth may indicate complex call chains.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{flowStats.cyclicDependencies}</div>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mt-1">
                    <span>Cyclic Dependencies</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            type="button"
                            className="inline-flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            aria-label="Information about Cyclic Dependencies"
                          >
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Functions that call each other in a circular pattern (A calls B, B calls C, C calls A). Cyclic dependencies can make code harder to maintain and test.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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

        {/* Function Filter */}
        {allFunctions.length > 0 && (
          <Card data-testid="card-function-filter">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter Functions
                  </CardTitle>
                  <CardDescription>
                    Select functions to display in the graph ({selectedFunctions.size} of {allFunctions.length} selected)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={selectAllFunctions}
                    variant="outline"
                    size="sm"
                    data-testid="button-select-all"
                  >
                    Select All
                  </Button>
                  <Button
                    onClick={deselectAllFunctions}
                    variant="outline"
                    size="sm"
                    data-testid="button-deselect-all"
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allFunctions.map((func) => {
                    const typeColors = {
                      controller: 'bg-blue-100 text-blue-800 border-blue-300',
                      service: 'bg-green-100 text-green-800 border-green-300',
                      repository: 'bg-purple-100 text-purple-800 border-purple-300',
                      entity: 'bg-orange-100 text-orange-800 border-orange-300',
                      util: 'bg-gray-100 text-gray-800 border-gray-300',
                    };
                    
                    return (
                      <div
                        key={func.id}
                        className={`flex items-center space-x-3 p-3 rounded border ${
                          selectedFunctions.has(func.id) 
                            ? typeColors[func.type as keyof typeof typeColors] 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        data-testid={`function-item-${func.id}`}
                      >
                        <Checkbox
                          id={`func-${func.id}`}
                          checked={selectedFunctions.has(func.id)}
                          onCheckedChange={() => toggleFunction(func.id)}
                          data-testid={`checkbox-function-${func.id}`}
                        />
                        <label
                          htmlFor={`func-${func.id}`}
                          className="flex-1 text-sm font-medium cursor-pointer truncate"
                          title={func.label}
                        >
                          {func.label}
                        </label>
                        <Badge variant="outline" className="text-xs">
                          {func.type}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Flow Diagram */}
        <Card data-testid="card-flow-diagram">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Function Call / Levels</CardTitle>
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

        {/* Data Field Flow Statistics */}
        {fieldStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">{fieldStats.totalFields}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Fields</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600">{fieldStats.totalAccesses}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Accesses</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{fieldStats.sharedFields}</div>
                  <div className="text-sm text-gray-600 mt-1">Shared Fields</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading Indicator for Field Flow */}
        {isLoadingFieldFlow && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Analyzing data field flow patterns...
            </AlertDescription>
          </Alert>
        )}

        {/* Field Filter */}
        {dataFieldFlowData && dataFieldFlowData.nodes.length > 0 && (
          <Card data-testid="card-field-filter">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter Fields
                  </CardTitle>
                  <CardDescription>
                    Select fields to display in the graph ({selectedFields.size} of {allFields.length} selected)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={selectAllFields}
                    variant="outline"
                    size="sm"
                    data-testid="button-select-all-fields"
                  >
                    Select All
                  </Button>
                  <Button
                    onClick={deselectAllFields}
                    variant="outline"
                    size="sm"
                    data-testid="button-deselect-all-fields"
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allFields.map((field) => {
                    const typeColors = {
                      field: 'bg-pink-100 text-pink-800 border-pink-300',
                      method: 'bg-cyan-100 text-cyan-800 border-cyan-300',
                      parameter: 'bg-orange-100 text-orange-800 border-orange-300',
                    };
                    
                    return (
                      <div
                        key={field.id}
                        className={`flex items-center space-x-3 p-3 rounded border ${
                          selectedFields.has(field.id) 
                            ? typeColors[field.type as keyof typeof typeColors] 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        data-testid={`field-item-${field.id}`}
                      >
                        <Checkbox
                          id={`field-${field.id}`}
                          checked={selectedFields.has(field.id)}
                          onCheckedChange={() => toggleField(field.id)}
                          data-testid={`checkbox-field-${field.id}`}
                        />
                        <label
                          htmlFor={`field-${field.id}`}
                          className="flex-1 text-sm font-medium cursor-pointer truncate"
                          title={field.label}
                        >
                          {field.label}
                        </label>
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Data Field Flow Diagram */}
        {dataFieldFlowData && dataFieldFlowData.nodes.length > 0 && (
          <Card data-testid="card-field-flow-diagram">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Field Flow Graph</CardTitle>
                  <CardDescription>
                    Interactive visualization showing how data fields are accessed by methods
                  </CardDescription>
                </div>
                {cyFieldRef.current && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleFieldZoomIn}
                      variant="outline"
                      size="icon"
                      data-testid="button-field-zoom-in"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleFieldZoomOut}
                      variant="outline"
                      size="icon"
                      data-testid="button-field-zoom-out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleFieldFit}
                      variant="outline"
                      size="icon"
                      data-testid="button-field-fit"
                    >
                      <Maximize className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleFieldExport}
                      variant="outline"
                      data-testid="button-field-export"
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
                  ref={containerFieldRef} 
                  style={{ height: '700px', width: '100%' }}
                  data-testid="cytoscape-field-container"
                />
                
                {/* Legend */}
                {cyFieldRef.current && (
                  <div className="absolute top-4 right-4 bg-white p-3 rounded shadow-md space-y-2">
                    <div className="text-sm font-semibold mb-2">Node Types</div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-pink-500 rounded"></div>
                      <span className="text-sm">Fields</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm">Methods</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Parameters</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Impact Analysis Statistics */}
        {impactStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{impactStats.totalImpacted}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Functions</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{impactStats.directUpstream}</div>
                  <div className="text-sm text-gray-600 mt-1">Upstream Calls</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{impactStats.directDownstream}</div>
                  <div className="text-sm text-gray-600 mt-1">Downstream Calls</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{impactStats.maxDepth}</div>
                  <div className="text-sm text-gray-600 mt-1">Max Call Depth</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading Indicator for Impact Analysis */}
        {isLoadingImpact && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Analyzing impact relationships...
            </AlertDescription>
          </Alert>
        )}

        {/* Impact Analysis Graph */}
        {impactData && impactData.nodes.length > 0 && (
          <Card data-testid="card-impact-analysis" className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Impact Analysis Graph</CardTitle>
                  <CardDescription>
                    Visualize the impact of changing a function - shows upstream and downstream dependencies
                  </CardDescription>
                </div>
                {cyImpactRef.current && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleImpactZoomIn}
                      variant="outline"
                      size="icon"
                      data-testid="button-impact-zoom-in"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleImpactZoomOut}
                      variant="outline"
                      size="icon"
                      data-testid="button-impact-zoom-out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleImpactFit}
                      variant="outline"
                      size="icon"
                      data-testid="button-impact-fit"
                    >
                      <Maximize className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleImpactExport}
                      variant="outline"
                      data-testid="button-impact-export"
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
                  ref={containerImpactRef} 
                  style={{ height: '700px', width: '100%' }}
                  data-testid="cytoscape-impact-container"
                />
                
                {/* Legend */}
                {cyImpactRef.current && (
                  <div className="absolute top-4 right-4 bg-white p-3 rounded shadow-md space-y-2">
                    <div className="text-sm font-semibold mb-2">Edge Types</div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-green-500"></div>
                      <span className="text-sm">Calls</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-orange-500"></div>
                      <span className="text-sm">Called By</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dependency Graph Statistics */}
        {depStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600">{depStats.totalFunctions}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Functions</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{depStats.totalDependencies}</div>
                  <div className="text-sm text-gray-600 mt-1">Dependencies</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{depStats.avgComplexity.toFixed(1)}</div>
                  <div className="text-sm text-gray-600 mt-1">Avg Complexity</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading Indicator for Dependency Graph */}
        {isLoadingDepGraph && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Analyzing code dependencies...
            </AlertDescription>
          </Alert>
        )}

        {/* Dependency Graph */}
        {depGraphData && depGraphData.nodes.length > 0 && (
          <Card data-testid="card-dependency-graph">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Dependency Graph</CardTitle>
                  <CardDescription>
                    Overall code structure showing files, functions, and their relationships
                  </CardDescription>
                </div>
                {cyDepRef.current && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDepZoomIn}
                      variant="outline"
                      size="icon"
                      data-testid="button-dep-zoom-in"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleDepZoomOut}
                      variant="outline"
                      size="icon"
                      data-testid="button-dep-zoom-out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleDepFit}
                      variant="outline"
                      size="icon"
                      data-testid="button-dep-fit"
                    >
                      <Maximize className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleDepExport}
                      variant="outline"
                      data-testid="button-dep-export"
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
                  ref={containerDepRef} 
                  style={{ height: '700px', width: '100%' }}
                  data-testid="cytoscape-dep-container"
                />
                
                {/* Legend */}
                {cyDepRef.current && (
                  <div className="absolute top-4 right-4 bg-white p-3 rounded shadow-md space-y-2">
                    <div className="text-sm font-semibold mb-2">Node Types</div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                      <span className="text-sm">Files</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm">Functions</span>
                    </div>
                    <div className="text-sm font-semibold mt-3 mb-2">Edge Types</div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-blue-500"></div>
                      <span className="text-sm">Calls</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-purple-500" style={{borderStyle: 'dashed'}}></div>
                      <span className="text-sm">Contains</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-orange-500"></div>
                      <span className="text-sm">Imports</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
