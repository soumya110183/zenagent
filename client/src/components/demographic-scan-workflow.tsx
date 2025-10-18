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
import { FileSearch, Database, Search, AlertTriangle, FileText, BarChart3, Brain } from 'lucide-react';

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
            <div className="font-bold text-white">Source Code Input</div>
            <div className="text-xs text-white opacity-90">Parsed code files</div>
          </div>
        </div>
      )
    },
    position: { x: 50, y: 50 },
    style: { 
      background: '#b8860b',
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
            <div className="font-bold text-white">Pattern Library</div>
            <div className="text-xs text-white opacity-90">39 regex patterns + custom</div>
          </div>
        </div>
      )
    },
    position: { x: 50, y: 180 },
    style: { 
      background: '#8b8d90',
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
            <div className="font-bold text-white">Pattern Matching</div>
            <div className="text-xs text-white opacity-90">Scan for PII/PHI fields</div>
          </div>
        </div>
      )
    },
    position: { x: 320, y: 50 },
    style: { 
      background: '#3b82f6',
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
            <div className="font-bold text-white">Detection Results</div>
            <div className="text-xs text-white opacity-90">Found demographic fields</div>
          </div>
        </div>
      )
    },
    position: { x: 320, y: 180 },
    style: { 
      background: '#1e40af',
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
            <div className="font-bold text-white">Categorization</div>
            <div className="text-xs text-white opacity-90">Group by category & severity</div>
          </div>
        </div>
      )
    },
    position: { x: 590, y: 50 },
    style: { 
      background: '#2563eb',
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
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <Brain className={iconStyle} />
          <div>
            <div className="font-bold text-white">Code Lens LLM</div>
            <div className="text-xs text-white opacity-90">Fine-tuned for demographic data</div>
          </div>
        </div>
      )
    },
    position: { x: 590, y: 180 },
    style: { 
      background: '#3b82f6',
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
    id: '7',
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <Brain className={iconStyle} />
          <div>
            <div className="font-bold text-white">SLM or LLM</div>
            <div className="text-xs text-white opacity-90">Model selection & processing</div>
          </div>
        </div>
      )
    },
    position: { x: 860, y: 50 },
    style: { 
      background: '#06b6d4',
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
    id: '8',
    type: 'output',
    data: { 
      label: (
        <div className="flex items-center gap-2 px-4 py-2">
          <FileText className={iconStyle} />
          <div>
            <div className="font-bold text-white">Compliance Report</div>
            <div className="text-xs text-white opacity-90">PDF with detailed findings</div>
          </div>
        </div>
      )
    },
    position: { x: 860, y: 180 },
    style: { 
      background: '#60a5fa',
      color: 'white',
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
    id: 'e3-4', 
    source: '3', 
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
    style: { stroke: '#06b6d4', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
  },
  { 
    id: 'e7-8', 
    source: '7', 
    target: '8',
    animated: true,
    style: { stroke: '#06b6d4', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
  },
];

export default function DemographicScanWorkflow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg" style={{ height: '300px' }}>
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
