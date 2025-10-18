import { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Upload, FileSearch, GitBranch, Brain, Shield, FileText, Search } from 'lucide-react';

const iconStyle = "w-5 h-5";

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <Upload className={iconStyle} />
          <div>
            <div className="font-bold text-white">Upload Repository</div>
            <div className="text-xs text-white opacity-90">ZIP file or GitHub URL</div>
          </div>
        </div>
      )
    },
    position: { x: 50, y: 50 },
    style: { 
      background: '#d4af37',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 250,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '2',
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <FileSearch className={iconStyle} />
          <div>
            <div className="font-bold text-white">AST Parsing</div>
            <div className="text-xs text-white opacity-90">Tree-sitter extracts structure</div>
          </div>
        </div>
      )
    },
    position: { x: 50, y: 180 },
    style: { 
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 250,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '3',
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <GitBranch className={iconStyle} />
          <div>
            <div className="font-bold text-white">Diagram Generation</div>
            <div className="text-xs text-white opacity-90">Flow, UML, Component diagrams</div>
          </div>
        </div>
      )
    },
    position: { x: 350, y: 50 },
    style: { 
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 250,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '4',
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <Search className={iconStyle} />
          <div>
            <div className="font-bold text-white">Demographic Scanning</div>
            <div className="text-xs text-white opacity-90">PII/PHI pattern detection</div>
          </div>
        </div>
      )
    },
    position: { x: 350, y: 180 },
    style: { 
      background: '#1e40af',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 250,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '5',
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <Brain className={iconStyle} />
          <div>
            <div className="font-bold text-white">LLM Analysis</div>
            <div className="text-xs text-white opacity-90">GPT-4o insights & recommendations</div>
          </div>
        </div>
      )
    },
    position: { x: 650, y: 50 },
    style: { 
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 250,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '6',
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <Shield className={iconStyle} />
          <div>
            <div className="font-bold text-white">Quality Analysis</div>
            <div className="text-xs text-white opacity-90">Code quality & change impact</div>
          </div>
        </div>
      )
    },
    position: { x: 650, y: 180 },
    style: { 
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 250,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '7',
    type: 'output',
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <FileText className={iconStyle} />
          <div>
            <div className="font-bold text-white">Report Export</div>
            <div className="text-xs text-white opacity-90">PDF/DOC with findings</div>
          </div>
        </div>
      )
    },
    position: { x: 950, y: 115 },
    style: { 
      background: '#60a5fa',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 250,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  { 
    id: 'e2-4', 
    source: '2', 
    target: '4',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  { 
    id: 'e4-5', 
    source: '4', 
    target: '5',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  { 
    id: 'e5-6', 
    source: '5', 
    target: '6',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  { 
    id: 'e6-7', 
    source: '6', 
    target: '7',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  { 
    id: 'e3-7', 
    source: '3', 
    target: '7',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
];

export default function AnalysisFlowDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg" style={{ height: '320px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnScroll={true}
        panOnScroll={true}
        panOnDrag={true}
        zoomOnPinch={true}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
