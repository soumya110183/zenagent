import { useEffect, useRef, useState } from 'react';
import { Graph, Shape } from '@antv/x6';
import type { AnalysisData } from '@shared/schema';
import type { DiagramType } from '@/types/analysis';
import {
  adaptToFlowChart,
  adaptToClassDiagram,
  adaptToComponentDiagram,
  exportGraphToPNG,
  exportGraphToSVG,
  getGraphDataUri,
  type X6NodeConfig,
  type X6EdgeConfig
} from '@/lib/diagramAdapters';

interface DiagramCanvasX6Props {
  type: DiagramType;
  analysisData: AnalysisData;
}

export default function DiagramCanvasX6({ type, analysisData }: DiagramCanvasX6Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create graph instance
    const graph = new Graph({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: 600,
      background: {
        color: '#ffffff',
      },
      grid: {
        visible: true,
        type: 'dot',
        args: {
          color: '#e0e0e0',
          thickness: 1,
        },
      },
      panning: {
        enabled: true,
        modifiers: 'shift',
      },
      mousewheel: {
        enabled: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 2,
      },
      connecting: {
        snap: true,
        allowBlank: false,
        allowLoop: false,
        highlight: true,
      },
      highlighting: {
        magnetAvailable: {
          name: 'stroke',
          args: {
            padding: 4,
            attrs: {
              strokeWidth: 4,
              stroke: '#6a1b9a',
            },
          },
        },
      },
    });

    graphRef.current = graph;

    // Render diagram based on type
    renderDiagram(graph, type, analysisData);
    
    // Auto-fit content
    setTimeout(() => {
      graph.zoomToFit({ padding: 20, maxScale: 1 });
      setIsReady(true);
    }, 100);

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current) {
        graph.resize(containerRef.current.clientWidth, 600);
      }
    };
    window.addEventListener('resize', handleResize);

    // Listen for export events
    const handleExport = async (e: CustomEvent) => {
      const { format } = e.detail;
      if (format === 'png') {
        exportGraphToPNG(graph, `${type}-diagram.png`);
      } else if (format === 'svg') {
        exportGraphToSVG(graph, `${type}-diagram.svg`);
      }
    };
    
    window.addEventListener('exportDiagram', handleExport as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('exportDiagram', handleExport as EventListener);
      graph.dispose();
    };
  }, [type, analysisData]);

  return (
    <div className="relative w-full bg-white dark:bg-card" data-testid={`diagram-${type}`}>
      <div ref={containerRef} className="w-full h-[600px]" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-card/80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Rendering diagram...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function renderDiagram(graph: Graph, type: DiagramType, analysisData: AnalysisData) {
  let diagramData: { nodes: X6NodeConfig[]; edges: X6EdgeConfig[] };

  switch (type) {
    case 'flow':
      diagramData = adaptToFlowChart(analysisData);
      break;
    case 'class':
      diagramData = adaptToClassDiagram(analysisData);
      break;
    case 'component':
      diagramData = adaptToComponentDiagram(analysisData);
      break;
    default:
      diagramData = adaptToFlowChart(analysisData);
  }

  // Clear existing cells
  graph.clearCells();

  // Add nodes
  diagramData.nodes.forEach(nodeConfig => {
    graph.addNode(nodeConfig);
  });

  // Add edges
  diagramData.edges.forEach(edgeConfig => {
    graph.addEdge(edgeConfig);
  });
}

// Hook for getting diagram image for export
export function useDiagramExporter(graph: Graph | null) {
  const getImage = async (): Promise<string | null> => {
    if (!graph) return null;
    try {
      return await getGraphDataUri(graph);
    } catch (error) {
      console.error('Failed to export diagram:', error);
      return null;
    }
  };

  return { getImage };
}
