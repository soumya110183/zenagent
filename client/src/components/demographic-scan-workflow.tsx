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
import { FileSearch, Database, Search, AlertTriangle, FileText, BarChart3 } from 'lucide-react';

const iconStyle = "w-5 h-5";

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <FileSearch className={iconStyle} />
          <div>
            <div className="font-bold">Source Code Input</div>
            <div className="text-xs text-gray-600">Parsed code files</div>
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
      width: 220,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '2',
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <Database className={iconStyle} />
          <div>
            <div className="font-bold">Pattern Library</div>
            <div className="text-xs text-gray-600">39 regex patterns + custom</div>
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
      width: 220,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '3',
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <Search className={iconStyle} />
          <div>
            <div className="font-bold">Pattern Matching</div>
            <div className="text-xs text-gray-600">Scan for PII/PHI fields</div>
          </div>
        </div>
      )
    },
    position: { x: 320, y: 50 },
    style: { 
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 220,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '4',
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <AlertTriangle className={iconStyle} />
          <div>
            <div className="font-bold">Detection Results</div>
            <div className="text-xs text-gray-600">Found demographic fields</div>
          </div>
        </div>
      )
    },
    position: { x: 320, y: 180 },
    style: { 
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 220,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '5',
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <BarChart3 className={iconStyle} />
          <div>
            <div className="font-bold">Categorization</div>
            <div className="text-xs text-gray-600">Group by category & severity</div>
          </div>
        </div>
      )
    },
    position: { x: 590, y: 50 },
    style: { 
      background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 220,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '6',
    type: 'output',
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <FileText className={iconStyle} />
          <div>
            <div className="font-bold">Compliance Report</div>
            <div className="text-xs text-gray-600">PDF with detailed findings</div>
          </div>
        </div>
      )
    },
    position: { x: 590, y: 180 },
    style: { 
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      color: '#1a202c',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 220,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-3', 
    source: '1', 
    target: '3',
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
    id: 'e3-4', 
    source: '3', 
    target: '4',
    animated: true,
    style: { stroke: '#4facfe', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#4facfe' },
  },
  { 
    id: 'e4-5', 
    source: '4', 
    target: '5',
    animated: true,
    style: { stroke: '#fa709a', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#fa709a' },
  },
  { 
    id: 'e5-6', 
    source: '5', 
    target: '6',
    animated: true,
    style: { stroke: '#30cfd0', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#30cfd0' },
  },
];

export default function DemographicScanWorkflow() {
  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg" style={{ height: '300px' }}>
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
