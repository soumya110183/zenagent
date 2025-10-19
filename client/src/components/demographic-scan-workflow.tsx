import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  BackgroundVariant,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FileSearch, Database, Search, AlertTriangle, FileText, BarChart3, Brain, Upload, FileSpreadsheet } from 'lucide-react';

const iconStyle = "w-5 h-5";

const initialNodes: Node[] = [
  // PATH 1: REGEX SCAN (Top Row)
  {
    id: '1',
    type: 'input',
    data: { 
      label: (
        <div className="px-3 py-2">
          <div className="font-bold text-white text-sm">Source Code</div>
        </div>
      )
    },
    position: { x: 30, y: 20 },
    style: { 
      background: '#b8860b',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '8px',
      width: 140,
      fontSize: '12px',
      boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '2',
    type: 'input',
    data: { 
      label: (
        <div className="px-3 py-2">
          <div className="font-bold text-white text-sm">39 Regex Patterns</div>
        </div>
      )
    },
    position: { x: 30, y: 80 },
    style: { 
      background: '#8b8d90',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '8px',
      width: 140,
      fontSize: '12px',
      boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '3',
    data: { 
      label: (
        <div className="px-3 py-2">
          <div className="font-bold text-white text-sm">Regex Scan</div>
          <div className="text-xs text-white mt-0.5">Pattern matching</div>
        </div>
      )
    },
    position: { x: 220, y: 45 },
    style: { 
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '8px',
      width: 160,
      fontSize: '12px',
      boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
    },
  },
  {
    id: 'llm-1',
    data: { 
      label: (
        <div className="px-3 py-2">
          <div className="font-bold text-white text-sm">Code Lens ML</div>
          <div className="text-xs text-white mt-0.5">Traditional ML</div>
        </div>
      )
    },
    position: { x: 430, y: 20 },
    style: { 
      background: '#f97316',
      color: 'white',
      border: '2px dashed white',
      borderRadius: '10px',
      padding: '8px',
      width: 140,
      fontSize: '12px',
      boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
    },
  },
  {
    id: 'report-1',
    type: 'output',
    data: { 
      label: (
        <div className="px-3 py-2">
          <div className="font-bold text-white text-sm">Report</div>
          <div className="text-xs text-white mt-0.5">PDF/DOC/HTML</div>
        </div>
      )
    },
    position: { x: 600, y: 45 },
    style: { 
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '8px',
      width: 140,
      fontSize: '12px',
      boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
    },
  },

  // PATH 2: EXCEL SCAN (Bottom Row)
  {
    id: 'source-2',
    type: 'input',
    data: { 
      label: (
        <div className="px-3 py-2">
          <div className="font-bold text-white text-sm">Source Code</div>
        </div>
      )
    },
    position: { x: 30, y: 180 },
    style: { 
      background: '#b8860b',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '8px',
      width: 140,
      fontSize: '12px',
      boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
    },
  },
  {
    id: 'excel-1',
    type: 'input',
    data: { 
      label: (
        <div className="px-3 py-2">
          <div className="font-bold text-white text-sm">Excel Upload</div>
          <div className="text-xs text-white mt-0.5">table.field</div>
        </div>
      )
    },
    position: { x: 30, y: 240 },
    style: { 
      background: '#b8860b',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '8px',
      width: 140,
      fontSize: '12px',
      boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
    },
  },
  {
    id: 'excel-2',
    data: { 
      label: (
        <div className="px-3 py-2">
          <div className="font-bold text-white text-sm">Excel Scan</div>
          <div className="text-xs text-white mt-0.5">100% exact match</div>
        </div>
      )
    },
    position: { x: 220, y: 205 },
    style: { 
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '8px',
      width: 160,
      fontSize: '12px',
      boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
    },
  },
  {
    id: 'llm-2',
    data: { 
      label: (
        <div className="px-3 py-2">
          <div className="font-bold text-white text-sm">Code Lens ML</div>
          <div className="text-xs text-white mt-0.5">Traditional ML</div>
        </div>
      )
    },
    position: { x: 430, y: 240 },
    style: { 
      background: '#f97316',
      color: 'white',
      border: '2px dashed white',
      borderRadius: '10px',
      padding: '8px',
      width: 140,
      fontSize: '12px',
      boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
    },
  },
  {
    id: 'report-2',
    type: 'output',
    data: { 
      label: (
        <div className="px-3 py-2">
          <div className="font-bold text-white text-sm">Report</div>
          <div className="text-xs text-white mt-0.5">PDF/DOC/HTML</div>
        </div>
      )
    },
    position: { x: 600, y: 205 },
    style: { 
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '8px',
      width: 140,
      fontSize: '12px',
      boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
    },
  },
];

const initialEdges: Edge[] = [
  // ===== PATH 1: REGEX SCAN (Top Row) =====
  // Inputs → Regex Scan
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
  // Regex Scan → Direct to Report
  { 
    id: 'e3-r1', 
    source: '3', 
    target: 'report-1',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  // Regex Scan → Optional Code Lens ML
  { 
    id: 'e3-llm1', 
    source: '3', 
    target: 'llm-1',
    animated: true,
    style: { stroke: '#f97316', strokeWidth: 1.5, strokeDasharray: '4,4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
  },
  // Optional Code Lens ML → Report
  { 
    id: 'ellm1-r1', 
    source: 'llm-1', 
    target: 'report-1',
    animated: true,
    style: { stroke: '#f97316', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
  },
  
  // ===== PATH 2: EXCEL SCAN (Bottom Row) =====
  // Inputs → Excel Scan
  { 
    id: 'es2-e2', 
    source: 'source-2', 
    target: 'excel-2',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  { 
    id: 'ex1-e2', 
    source: 'excel-1', 
    target: 'excel-2',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  // Excel Scan → Direct to Report
  { 
    id: 'e2-r2', 
    source: 'excel-2', 
    target: 'report-2',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  // Excel Scan → Optional Code Lens ML
  { 
    id: 'e2-llm2', 
    source: 'excel-2', 
    target: 'llm-2',
    animated: true,
    style: { stroke: '#f97316', strokeWidth: 1.5, strokeDasharray: '4,4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
  },
  // Optional Code Lens ML → Report
  { 
    id: 'ellm2-r2', 
    source: 'llm-2', 
    target: 'report-2',
    animated: true,
    style: { stroke: '#f97316', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
  },
];

function FlowContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  useEffect(() => {
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 0);
  }, [fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      fitViewOptions={{ padding: 0.2, duration: 300 }}
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
  );
}

export default function DemographicScanWorkflow() {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg w-full" style={{ height: '380px' }}>
      <ReactFlowProvider>
        <FlowContent />
      </ReactFlowProvider>
    </div>
  );
}
