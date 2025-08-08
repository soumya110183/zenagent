import { useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { type AnalysisData } from '@shared/schema';
import { type DiagramType, type DiagramNode, type DiagramEdge } from '@/types/analysis';

interface DiagramCanvasProps {
  type: DiagramType;
  analysisData: AnalysisData;
}

const nodeTypes = {
  controller: ({ data }: { data: any }) => (
    <div className="bg-blue-100 border-2 border-primary rounded-lg p-4 min-w-[150px]">
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="font-medium text-sm text-primary text-center">{data.label}</div>
      <div className="text-xs text-gray-600 text-center">{data.annotations[0]}</div>
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
      <div className="text-xs text-gray-600 text-center">{data.annotations[0]}</div>
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
      <div className="text-xs text-gray-600 text-center">{data.annotations[0]}</div>
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
      <div className="text-xs text-gray-600 text-center">{data.annotations[0]}</div>
    </div>
  ),
  default: ({ data }: { data: any }) => (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-4 min-w-[150px]">
      <div className="font-medium text-sm text-center">{data.label}</div>
      <div className="text-xs text-gray-500 text-center">{data.className}</div>
    </div>
  ),
};

export default function DiagramCanvas({ type, analysisData }: DiagramCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { diagramNodes, diagramEdges } = useMemo(() => {
    return generateDiagramData(type, analysisData);
  }, [type, analysisData]);

  useEffect(() => {
    setNodes(diagramNodes);
    setEdges(diagramEdges);
  }, [diagramNodes, diagramEdges, setNodes, setEdges]);

  if (diagramNodes.length === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-muted">
        <div className="text-center text-muted-foreground">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">
            {type === 'flow' && 'Controller → Service → Repository Flow'}
            {type === 'component' && 'Component Architecture'}
            {type === 'sequence' && 'Method Call Sequences'}
            {type === 'class' && 'Class Relationships'}
            {type === 'er' && 'Entity Relationships'}
          </p>
          <p className="text-sm">
            {diagramNodes.length === 0 ? 'No data available for this diagram type' : 'Interactive diagram will appear here'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function generateDiagramData(type: DiagramType, analysisData: AnalysisData): { diagramNodes: Node[], diagramEdges: Edge[] } {
  const diagramNodes: Node[] = [];
  const diagramEdges: Edge[] = [];

  switch (type) {
    case 'flow':
      generateFlowDiagram(analysisData, diagramNodes, diagramEdges);
      break;
    case 'component':
      generateComponentDiagram(analysisData, diagramNodes, diagramEdges);
      break;
    case 'class':
      generateClassDiagram(analysisData, diagramNodes, diagramEdges);
      break;
    case 'er':
      generateERDiagram(analysisData, diagramNodes, diagramEdges);
      break;
    default:
      break;
  }

  return { diagramNodes, diagramEdges };
}

function generateFlowDiagram(analysisData: AnalysisData, nodes: Node[], edges: Edge[]) {
  const controllers = analysisData.classes.filter(c => c.type === 'controller');
  const services = analysisData.classes.filter(c => c.type === 'service');
  const repositories = analysisData.classes.filter(c => c.type === 'repository');

  let yOffset = 0;
  const layerSpacing = 200;
  const nodeSpacing = 180;

  // Add controller nodes
  controllers.forEach((controller, index) => {
    nodes.push({
      id: controller.name,
      type: 'controller',
      position: { x: index * nodeSpacing, y: yOffset },
      data: {
        label: controller.name,
        className: controller.name,
        annotations: controller.annotations,
      },
    });
  });

  yOffset += layerSpacing;

  // Add service nodes
  services.forEach((service, index) => {
    nodes.push({
      id: service.name,
      type: 'service',
      position: { x: index * nodeSpacing, y: yOffset },
      data: {
        label: service.name,
        className: service.name,
        annotations: service.annotations,
      },
    });
  });

  yOffset += layerSpacing;

  // Add repository nodes
  repositories.forEach((repository, index) => {
    nodes.push({
      id: repository.name,
      type: 'repository',
      position: { x: index * nodeSpacing, y: yOffset },
      data: {
        label: repository.name,
        className: repository.name,
        annotations: repository.annotations,
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
          label: rel.method,
          style: { strokeWidth: 2 },
        });
      }
    }
  });
}

function generateComponentDiagram(analysisData: AnalysisData, nodes: Node[], edges: Edge[]) {
  const allClasses = analysisData.classes;
  const gridCols = Math.ceil(Math.sqrt(allClasses.length));
  const nodeSpacing = 200;

  allClasses.forEach((cls, index) => {
    const row = Math.floor(index / gridCols);
    const col = index % gridCols;

    nodes.push({
      id: cls.name,
      type: cls.type,
      position: { x: col * nodeSpacing, y: row * nodeSpacing },
      data: {
        label: cls.name,
        className: cls.name,
        annotations: cls.annotations,
        methods: cls.methods.slice(0, 3), // Show first 3 methods
      },
    });
  });

  // Add all relationship edges
  analysisData.relationships.forEach((rel, index) => {
    const sourceExists = nodes.some(n => n.id === rel.from);
    const targetExists = nodes.some(n => n.id === rel.to);
    
    if (sourceExists && targetExists) {
      edges.push({
        id: `${rel.from}-${rel.to}-${index}`,
        source: rel.from,
        target: rel.to,
        type: rel.type === 'extends' ? 'step' : 'smoothstep',
        animated: rel.type === 'calls',
        label: rel.type === 'calls' ? rel.method : rel.type,
        style: { 
          strokeWidth: rel.type === 'extends' ? 3 : 2,
          strokeDasharray: rel.type === 'implements' ? '5,5' : 'none'
        },
      });
    }
  });
}

function generateClassDiagram(analysisData: AnalysisData, nodes: Node[], edges: Edge[]) {
  // Similar to component diagram but focused on class relationships
  generateComponentDiagram(analysisData, nodes, edges);
}

function generateERDiagram(analysisData: AnalysisData, nodes: Node[], edges: Edge[]) {
  const entities = analysisData.entities;
  const nodeSpacing = 250;
  const gridCols = Math.ceil(Math.sqrt(entities.length));

  entities.forEach((entity, index) => {
    const row = Math.floor(index / gridCols);
    const col = index % gridCols;

    nodes.push({
      id: entity.name,
      type: 'entity',
      position: { x: col * nodeSpacing, y: row * nodeSpacing },
      data: {
        label: entity.name,
        className: entity.name,
        annotations: [`@Entity`],
        fields: entity.fields.slice(0, 5), // Show first 5 fields
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
}
