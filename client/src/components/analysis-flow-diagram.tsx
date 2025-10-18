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
            <div className="font-bold">Upload Repository</div>
            <div className="text-xs text-gray-600">ZIP file or GitHub URL</div>
          </div>
        </div>
      )
    },
    position: { x: 50, y: 50 },
    style: { 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            <div className="font-bold">AST Parsing</div>
            <div className="text-xs text-gray-600">Tree-sitter extracts structure</div>
          </div>
        </div>
      )
    },
    position: { x: 50, y: 180 },
    style: { 
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
            <div className="font-bold">Diagram Generation</div>
            <div className="text-xs text-gray-600">Flow, UML, Component diagrams</div>
          </div>
        </div>
      )
    },
    position: { x: 350, y: 50 },
    style: { 
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
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
            <div className="font-bold">Demographic Scanning</div>
            <div className="text-xs text-gray-600">PII/PHI pattern detection</div>
          </div>
        </div>
      )
    },
    position: { x: 350, y: 180 },
    style: { 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            <div className="font-bold">LLM Analysis</div>
            <div className="text-xs text-gray-600">GPT-4o insights & recommendations</div>
          </div>
        </div>
      )
    },
    position: { x: 650, y: 50 },
    style: { 
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
            <div className="font-bold">Quality Analysis</div>
            <div className="text-xs text-gray-600">Code quality & change impact</div>
          </div>
        </div>
      )
    },
    position: { x: 650, y: 180 },
    style: { 
      background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
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
            <div className="font-bold">Report Export</div>
            <div className="text-xs text-gray-600">PDF/DOC with findings</div>
          </div>
        </div>
      )
    },
    position: { x: 950, y: 115 },
    style: { 
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      color: '#1a202c',
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
    style: { stroke: '#667eea', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' },
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3',
    animated: true,
    style: { stroke: '#f093fb', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f093fb' },
  },
  { 
    id: 'e2-4', 
    source: '2', 
    target: '4',
    animated: true,
    style: { stroke: '#f093fb', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f093fb' },
  },
  { 
    id: 'e4-5', 
    source: '4', 
    target: '5',
    animated: true,
    style: { stroke: '#667eea', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' },
  },
  { 
    id: 'e5-6', 
    source: '5', 
    target: '6',
    animated: true,
    style: { stroke: '#4facfe', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#4facfe' },
  },
  { 
    id: 'e6-7', 
    source: '6', 
    target: '7',
    animated: true,
    style: { stroke: '#30cfd0', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#30cfd0' },
  },
  { 
    id: 'e3-7', 
    source: '3', 
    target: '7',
    animated: true,
    style: { stroke: '#fa709a', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#fa709a' },
  },
];

export default function AnalysisFlowDiagram() {
  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg" style={{ height: '320px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        panOnDrag={false}
        zoomOnPinch={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
