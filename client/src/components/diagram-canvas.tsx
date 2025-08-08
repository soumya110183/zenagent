import { useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { type AnalysisData } from '@shared/schema';
import { type DiagramType } from '@/types/analysis';

interface DiagramCanvasProps {
  type: DiagramType;
  analysisData: AnalysisData;
}

// Enhanced node types for better flow visualization
const nodeTypes = {
  flowNode: ({ data }: { data: any }) => {
    const getNodeColor = (type: string) => {
      switch (type) {
        case 'controller': return { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white' };
        case 'service': return { bg: 'bg-green-500', border: 'border-green-600', text: 'text-white' };
        case 'repository': return { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-white' };
        case 'entity': return { bg: 'bg-orange-500', border: 'border-orange-600', text: 'text-white' };
        default: return { bg: 'bg-gray-500', border: 'border-gray-600', text: 'text-white' };
      }
    };
    
    const colors = getNodeColor(data.nodeType);
    
    return (
      <div className={`${colors.bg} ${colors.border} border-2 rounded-xl shadow-lg min-w-[140px] max-w-[200px]`}>
        <div className="p-3">
          <div className={`font-bold text-sm ${colors.text} text-center mb-1`}>
            {data.label}
          </div>
          <div className="text-xs bg-white bg-opacity-20 rounded px-2 py-1 text-center">
            {data.nodeType}
          </div>
          {data.methods && data.methods.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white border-opacity-30">
              <div className="text-xs text-white opacity-80">
                {data.methods.slice(0, 2).map((method: any, idx: number) => (
                  <div key={idx} className="truncate">
                    {method.name}()
                  </div>
                ))}
                {data.methods.length > 2 && (
                  <div>+{data.methods.length - 2} more</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
  class: ({ data }: { data: any }) => (
    <div className="bg-white border-2 border-gray-800 shadow-lg min-w-[250px]">
      {/* Class Header */}
      <div className="bg-gray-800 text-white p-3 text-center font-bold">
        {data.label}
      </div>
      
      {/* Fields Section */}
      {data.fields && data.fields.length > 0 && (
        <div className="border-b border-gray-800">
          <div className="p-3">
            {data.fields.slice(0, 5).map((field: any, idx: number) => (
              <div key={idx} className="text-sm font-mono text-gray-700">
                {field.visibility || '+'} {field.name}: {field.type}
              </div>
            ))}
            {data.fields.length > 5 && (
              <div className="text-xs text-gray-500 mt-1">
                +{data.fields.length - 5} more fields
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Methods Section */}
      {data.methods && data.methods.length > 0 && (
        <div className="p-3">
          {data.methods.slice(0, 5).map((method: any, idx: number) => (
            <div key={idx} className="text-sm font-mono text-gray-700">
              {method.visibility || '+'} {method.name}(): {method.returnType || 'void'}
            </div>
          ))}
          {data.methods.length > 5 && (
            <div className="text-xs text-gray-500 mt-1">
              +{data.methods.length - 5} more methods
            </div>
          )}
        </div>
      )}
    </div>
  ),
  controller: ({ data }: { data: any }) => (
    <div className="bg-blue-100 border-2 border-primary rounded-lg p-4 min-w-[150px]">
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="font-medium text-sm text-primary text-center">{data.label}</div>
      <div className="text-xs text-gray-600 text-center">{data.annotations?.[0]}</div>
    </div>
  ),
  service: ({ data }: { data: any }) => (
    <div className="bg-green-100 border-2 border-accent rounded-lg p-4 min-w-[150px]">
      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="font-medium text-sm text-accent text-center">{data.label}</div>
      <div className="text-xs text-gray-600 text-center">{data.annotations?.[0]}</div>
    </div>
  ),
  repository: ({ data }: { data: any }) => (
    <div className="bg-purple-100 border-2 border-purple-600 rounded-lg p-4 min-w-[150px]">
      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      </div>
      <div className="font-medium text-sm text-purple-600 text-center">{data.label}</div>
      <div className="text-xs text-gray-600 text-center">{data.annotations?.[0]}</div>
    </div>
  ),
  entity: ({ data }: { data: any }) => (
    <div className="bg-orange-100 border-2 border-orange-600 rounded-lg p-4 min-w-[150px]">
      <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </div>
      <div className="font-medium text-sm text-orange-600 text-center">{data.label}</div>
      <div className="text-xs text-gray-600 text-center">{data.annotations?.[0]}</div>
    </div>
  ),
};

// Dagre layout utility for automatic node positioning
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 150 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 150 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;
    
    // Adjust position to match React Flow anchor point
    node.position = {
      x: nodeWithPosition.x - 100,
      y: nodeWithPosition.y - 75,
    };

    return node;
  });

  return { nodes, edges };
};

function generateDiagram(type: DiagramType, analysisData: AnalysisData) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  switch (type) {
    case 'flow':
      generateFlowDiagram(analysisData, nodes, edges);
      break;
    case 'component':
      generateComponentDiagram(analysisData, nodes, edges);
      break;
    case 'class':
      generateClassDiagram(analysisData, nodes, edges);
      break;
    case 'sequence':
      generateSequenceDiagram(analysisData, nodes, edges);
      break;
    case 'er':
      generateERDiagram(analysisData, nodes, edges);
      break;
    default:
      break;
  }

  return { diagramNodes: nodes, diagramEdges: edges };
}

function generateFlowDiagram(analysisData: AnalysisData, nodes: Node[], edges: Edge[]) {
  const controllers = analysisData.classes.filter(c => c.type === 'controller');
  const services = analysisData.classes.filter(c => c.type === 'service');
  const repositories = analysisData.classes.filter(c => c.type === 'repository');

  // Create flow nodes for each layer
  [...controllers, ...services, ...repositories].forEach((cls) => {
    nodes.push({
      id: cls.name,
      type: 'flowNode',
      position: { x: 0, y: 0 }, // Will be set by dagre layout
      data: {
        label: cls.name,
        nodeType: cls.type,
        annotations: cls.annotations,
        methods: cls.methods,
      },
    });
  });

  // Add edges based on relationships
  analysisData.relationships.forEach((rel, index) => {
    if (rel.type === 'injects' || rel.type === 'calls') {
      const sourceExists = nodes.some(n => n.id === rel.from);
      const targetExists = nodes.some(n => n.id === rel.to);
      
      if (sourceExists && targetExists) {
        edges.push({
          id: `${rel.from}-${rel.to}-${index}`,
          source: rel.from,
          target: rel.to,
          type: 'smoothstep',
          animated: rel.type === 'calls',
          label: rel.method || rel.type,
          style: { 
            strokeWidth: 2,
            stroke: rel.type === 'calls' ? '#10b981' : '#3b82f6'
          },
          markerEnd: {
            type: 'arrowclosed',
            color: rel.type === 'calls' ? '#10b981' : '#3b82f6',
          },
        });
      }
    }
  });

  // Apply automatic layout
  const layouted = getLayoutedElements(nodes, edges, 'TB');
  nodes.splice(0, nodes.length, ...layouted.nodes);
  edges.splice(0, edges.length, ...layouted.edges);
}

function generateComponentDiagram(analysisData: AnalysisData, nodes: Node[], edges: Edge[]) {
  const allClasses = analysisData.classes;
  
  // Create component nodes with enhanced styling
  allClasses.forEach((cls) => {
    nodes.push({
      id: cls.name,
      type: 'flowNode',
      position: { x: 0, y: 0 }, // Will be set by dagre layout
      data: {
        label: cls.name,
        nodeType: cls.type,
        annotations: cls.annotations,
        methods: cls.methods,
        fields: cls.fields,
      },
    });
  });
  
  // Add edges with better styling based on relationship types
  analysisData.relationships.forEach((rel, index) => {
    const sourceExists = nodes.some(n => n.id === rel.from);
    const targetExists = nodes.some(n => n.id === rel.to);
    
    if (sourceExists && targetExists) {
      const getEdgeStyle = (relType: string) => {
        switch (relType) {
          case 'injects':
            return { stroke: '#10b981', strokeWidth: 3, strokeDasharray: '5,5' };
          case 'calls':
            return { stroke: '#3b82f6', strokeWidth: 2 };
          case 'extends':
            return { stroke: '#8b5cf6', strokeWidth: 2 };
          case 'implements':
            return { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '3,3' };
          default:
            return { stroke: '#6b7280', strokeWidth: 1 };
        }
      };
      
      edges.push({
        id: `${rel.from}-${rel.to}-${index}`,
        source: rel.from,
        target: rel.to,
        type: rel.type === 'extends' || rel.type === 'implements' ? 'straight' : 'smoothstep',
        animated: rel.type === 'calls',
        label: rel.type,
        style: getEdgeStyle(rel.type),
        markerEnd: {
          type: 'arrowclosed',
          color: getEdgeStyle(rel.type).stroke,
        },
      });
    }
  });
  
  // Apply automatic layout with left-to-right for components
  const layouted = getLayoutedElements(nodes, edges, 'LR');
  nodes.splice(0, nodes.length, ...layouted.nodes);
  edges.splice(0, edges.length, ...layouted.edges);
}

function generateClassDiagram(analysisData: AnalysisData, nodes: Node[], edges: Edge[]) {
  const allClasses = analysisData.classes;

  allClasses.forEach((cls) => {
    nodes.push({
      id: cls.name,
      type: 'class',
      position: { x: 0, y: 0 }, // Will be set by dagre layout
      data: {
        label: cls.name,
        className: cls.name,
        annotations: cls.annotations,
        methods: cls.methods,
        fields: cls.fields,
      },
    });
  });

  // Add relationship edges with UML-style styling
  analysisData.relationships.forEach((rel, index) => {
    const sourceExists = nodes.some(n => n.id === rel.from);
    const targetExists = nodes.some(n => n.id === rel.to);
    
    if (sourceExists && targetExists) {
      const getEdgeStyle = (relType: string) => {
        switch (relType) {
          case 'extends':
            return { strokeWidth: 2, stroke: '#000000' };
          case 'implements':
            return { strokeWidth: 2, stroke: '#000000', strokeDasharray: '8,4' };
          case 'injects':
            return { strokeWidth: 1, stroke: '#666666', strokeDasharray: '4,2' };
          default:
            return { strokeWidth: 1, stroke: '#cccccc' };
        }
      };
      
      edges.push({
        id: `${rel.from}-${rel.to}-${index}`,
        source: rel.from,
        target: rel.to,
        type: 'smoothstep',
        label: rel.type,
        style: getEdgeStyle(rel.type),
        markerEnd: {
          type: 'arrowclosed',
          color: getEdgeStyle(rel.type).stroke,
        },
      });
    }
  });

  // Apply automatic layout
  const layouted = getLayoutedElements(nodes, edges, 'TB');
  nodes.splice(0, nodes.length, ...layouted.nodes);
  edges.splice(0, edges.length, ...layouted.edges);
}

function generateSequenceDiagram(analysisData: AnalysisData, nodes: Node[], edges: Edge[]) {
  // Simplified sequence diagram - vertical layout
  const allClasses = analysisData.classes;
  
  allClasses.forEach((cls, index) => {
    nodes.push({
      id: cls.name,
      type: cls.type,
      position: { x: index * 200, y: 0 },
      data: {
        label: cls.name,
        className: cls.name,
        annotations: cls.annotations,
      },
    });
  });

  // Add method call edges
  analysisData.relationships.forEach((rel, index) => {
    if (rel.type === 'calls') {
      const sourceExists = nodes.some(n => n.id === rel.from);
      const targetExists = nodes.some(n => n.id === rel.to);
      
      if (sourceExists && targetExists) {
        edges.push({
          id: `${rel.from}-${rel.to}-${index}`,
          source: rel.from,
          target: rel.to,
          type: 'straight',
          animated: true,
          label: rel.method,
          style: { strokeWidth: 2 },
        });
      }
    }
  });
}

function generateERDiagram(analysisData: AnalysisData, nodes: Node[], edges: Edge[]) {
  const entities = analysisData.entities;

  entities.forEach((entity) => {
    nodes.push({
      id: entity.name,
      type: 'entity',
      position: { x: 0, y: 0 }, // Will be set by dagre layout
      data: {
        label: entity.name,
        className: entity.name,
        annotations: [`@Entity`],
        fields: entity.fields.slice(0, 5),
      },
    });
  });

  // Add relationship edges between entities
  entities.forEach(entity => {
    entity.fields.forEach((field, fieldIndex) => {
      if (field.relationship && field.targetEntity) {
        const targetExists = nodes.some(n => n.id === field.targetEntity);
        if (targetExists) {
          edges.push({
            id: `${entity.name}-${field.targetEntity}-${fieldIndex}`,
            source: entity.name,
            target: field.targetEntity,
            type: 'smoothstep',
            label: field.relationship,
            style: { strokeWidth: 2 },
          });
        }
      }
    });
  });

  // Apply automatic layout
  const layouted = getLayoutedElements(nodes, edges, 'TB');
  nodes.splice(0, nodes.length, ...layouted.nodes);
  edges.splice(0, edges.length, ...layouted.edges);
}

export default function DiagramCanvas({ type, analysisData }: DiagramCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { diagramNodes, diagramEdges } = useMemo(() => {
    return generateDiagram(type, analysisData);
  }, [type, analysisData]);

  useEffect(() => {
    setNodes(diagramNodes);
    setEdges(diagramEdges);
  }, [diagramNodes, diagramEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.2}
        maxZoom={2}
        panOnScroll
        zoomOnDoubleClick={false}
      >
        <Background 
          variant="dots" 
          gap={20} 
          size={1} 
          color="#e5e7eb"
          className="bg-gray-50" 
        />
        <Controls 
          position="top-right"
          showInteractive={false}
          className="bg-white shadow-lg border border-gray-200 rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}