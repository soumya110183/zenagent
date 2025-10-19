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
  // Input nodes
  {
    id: '1',
    type: 'input',
    data: { 
      label: (
        <div className="px-4 py-3">
          <div className="font-bold text-white text-lg">Source Code Input</div>
          <div className="text-sm text-white mt-1">Parsed code files</div>
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
    type: 'input',
    data: { 
      label: (
        <div className="px-4 py-3">
          <div className="font-bold text-white text-lg">Regex Patterns</div>
          <div className="text-sm text-white mt-1">39 patterns + custom</div>
        </div>
      )
    },
    position: { x: 50, y: 150 },
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
    id: 'excel-1',
    type: 'input',
    data: { 
      label: (
        <div className="px-4 py-3">
          <div className="font-bold text-white text-lg">Excel Upload</div>
          <div className="text-sm text-white mt-1">table_name, field_name</div>
        </div>
      )
    },
    position: { x: 50, y: 250 },
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
  
  // Scanning methods
  {
    id: '3',
    data: { 
      label: (
        <div className="px-4 py-3">
          <div className="font-bold text-white text-lg">Regex Scan</div>
          <div className="text-sm text-white mt-1">Pattern matching</div>
        </div>
      )
    },
    position: { x: 340, y: 100 },
    style: { 
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 200,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: 'excel-2',
    data: { 
      label: (
        <div className="px-4 py-3">
          <div className="font-bold text-white text-lg">Excel Field Scan</div>
          <div className="text-sm text-white mt-1">100% exact match</div>
        </div>
      )
    },
    position: { x: 340, y: 250 },
    style: { 
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 200,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  
  // Optional LLM processing
  {
    id: '5',
    data: { 
      label: (
        <div className="px-4 py-3">
          <div className="font-bold text-white text-lg">SLM / LLM</div>
          <div className="text-sm text-white mt-1">Optional enhancement</div>
        </div>
      )
    },
    position: { x: 630, y: 50 },
    style: { 
      background: '#06b6d4',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 200,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  
  // Report output
  {
    id: '6',
    type: 'output',
    data: { 
      label: (
        <div className="px-4 py-3">
          <div className="font-bold text-white text-lg">Compliance Report</div>
          <div className="text-sm text-white mt-1">PDF/DOCX/HTML export</div>
        </div>
      )
    },
    position: { x: 630, y: 200 },
    style: { 
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 200,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
];

const initialEdges: Edge[] = [
  // PATH 1: Regex Scan
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
  // Regex Scan → Report
  { 
    id: 'e3-6', 
    source: '3', 
    target: '6',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  // Regex Scan → Optional LLM → Report
  { 
    id: 'e3-5', 
    source: '3', 
    target: '5',
    animated: true,
    style: { stroke: '#06b6d4', strokeWidth: 2, strokeDasharray: '5,5' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
    label: 'optional',
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#cffafe', fillOpacity: 0.9 },
    labelStyle: { fontSize: '10px', fill: '#0e7490', fontWeight: 600 },
  },
  
  // PATH 2: Excel Field Scan
  { 
    id: 'excel-e1', 
    source: 'excel-1', 
    target: 'excel-2',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  { 
    id: 'excel-e2', 
    source: '1', 
    target: 'excel-2',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  // Excel Scan → Report
  { 
    id: 'excel-e3', 
    source: 'excel-2', 
    target: '6',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  // Excel Scan → Optional LLM → Report
  { 
    id: 'excel-e4', 
    source: 'excel-2', 
    target: '5',
    animated: true,
    style: { stroke: '#06b6d4', strokeWidth: 2, strokeDasharray: '5,5' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
    label: 'optional',
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#cffafe', fillOpacity: 0.9 },
    labelStyle: { fontSize: '10px', fill: '#0e7490', fontWeight: 600 },
  },
  
  // Optional LLM → Report
  { 
    id: 'e5-6', 
    source: '5', 
    target: '6',
    animated: true,
    style: { stroke: '#06b6d4', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
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
