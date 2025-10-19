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
  // PATH 1: REGEX SCAN (Top)
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

  // PATH 2: EXCEL SCAN (Bottom)
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

  // SHARED: Code Lens ML (Center - Optional)
  {
    id: 'llm-shared',
    data: { 
      label: (
        <div className="px-3 py-2">
          <div className="font-bold text-white text-sm">Code Lens ML</div>
          <div className="text-xs text-white mt-0.5">Traditional ML</div>
        </div>
      )
    },
    position: { x: 470, y: 125 },
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

  // SHARED: Report (Right side)
  {
    id: 'report-shared',
    type: 'output',
    data: { 
      label: (
        <div className="px-3 py-2">
          <div className="font-bold text-white text-sm">Report</div>
          <div className="text-xs text-white mt-0.5">PDF/DOC/HTML</div>
        </div>
      )
    },
    position: { x: 670, y: 125 },
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
  // ===== REGEX SCAN PATH =====
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
  
  // ===== EXCEL SCAN PATH =====
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

  // ===== CONVERGED PATHS =====
  // Both scans → Direct to Report (main path)
  { 
    id: 'e3-report', 
    source: '3', 
    target: 'report-shared',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  { 
    id: 'excel-report', 
    source: 'excel-2', 
    target: 'report-shared',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },

  // Both scans → Optional Code Lens ML (if needed)
  { 
    id: 'e3-llm', 
    source: '3', 
    target: 'llm-shared',
    animated: true,
    label: 'if needed',
    labelStyle: { fill: '#f97316', fontWeight: 600, fontSize: '11px' },
    labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
    labelBgPadding: [4, 4],
    style: { stroke: '#f97316', strokeWidth: 1.5, strokeDasharray: '4,4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
  },
  { 
    id: 'excel-llm', 
    source: 'excel-2', 
    target: 'llm-shared',
    animated: true,
    label: 'if needed',
    labelStyle: { fill: '#f97316', fontWeight: 600, fontSize: '11px' },
    labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
    labelBgPadding: [4, 4],
    style: { stroke: '#f97316', strokeWidth: 1.5, strokeDasharray: '4,4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
  },

  // Code Lens ML → Report
  { 
    id: 'llm-report', 
    source: 'llm-shared', 
    target: 'report-shared',
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
