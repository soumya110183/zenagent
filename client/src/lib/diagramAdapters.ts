import type { AnalysisData, JavaClass, Relationship } from "@shared/schema";
import type { Graph } from "@antv/x6";

export interface X6NodeConfig {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  shape: string;
  attrs?: any;
  data?: any;
}

export interface X6EdgeConfig {
  source: string;
  target: string;
  label?: string;
  attrs?: any;
  router?: any;
}

// Color palette for different component types
const COLOR_MAP = {
  controller: { fill: '#e3f2fd', stroke: '#1976d2', text: '#0d47a1' },
  service: { fill: '#f3e5f5', stroke: '#7b1fa2', text: '#4a148c' },
  repository: { fill: '#e8f5e9', stroke: '#388e3c', text: '#1b5e20' },
  entity: { fill: '#fff3e0', stroke: '#f57c00', text: '#e65100' },
  component: { fill: '#fce4ec', stroke: '#c2185b', text: '#880e4f' },
  config: { fill: '#e0f2f1', stroke: '#00796b', text: '#004d40' },
  model: { fill: '#f1f8e9', stroke: '#689f38', text: '#33691e' },
  default: { fill: '#f5f5f5', stroke: '#616161', text: '#212121' },
};

function getColorForType(type: string) {
  return COLOR_MAP[type as keyof typeof COLOR_MAP] || COLOR_MAP.default;
}

// Flowchart adapter - focuses on relationships and data flow
export function adaptToFlowChart(analysisData: AnalysisData): { nodes: X6NodeConfig[]; edges: X6EdgeConfig[] } {
  const nodes: X6NodeConfig[] = [];
  const edges: X6EdgeConfig[] = [];
  
  const controllers = analysisData.classes.filter(c => c.type === 'controller');
  const services = analysisData.classes.filter(c => c.type === 'service');
  const repositories = analysisData.classes.filter(c => c.type === 'repository');

  // Layout controllers at top
  controllers.forEach((cls, idx) => {
    const colors = getColorForType('controller');
    nodes.push({
      id: cls.name,
      x: 100 + (idx * 250),
      y: 50,
      width: 200,
      height: 80,
      label: cls.name,
      shape: 'rect',
      attrs: {
        body: { fill: colors.fill, stroke: colors.stroke, strokeWidth: 2, rx: 8, ry: 8 },
        label: { fill: colors.text, fontSize: 12, fontWeight: 'bold' }
      },
      data: cls
    });
  });

  // Layout services in middle
  services.forEach((cls, idx) => {
    const colors = getColorForType('service');
    nodes.push({
      id: cls.name,
      x: 100 + (idx * 250),
      y: 200,
      width: 200,
      height: 80,
      label: cls.name,
      shape: 'rect',
      attrs: {
        body: { fill: colors.fill, stroke: colors.stroke, strokeWidth: 2, rx: 8, ry: 8 },
        label: { fill: colors.text, fontSize: 12, fontWeight: 'bold' }
      },
      data: cls
    });
  });

  // Layout repositories at bottom
  repositories.forEach((cls, idx) => {
    const colors = getColorForType('repository');
    nodes.push({
      id: cls.name,
      x: 100 + (idx * 250),
      y: 350,
      width: 200,
      height: 80,
      label: cls.name,
      shape: 'rect',
      attrs: {
        body: { fill: colors.fill, stroke: colors.stroke, strokeWidth: 2, rx: 8, ry: 8 },
        label: { fill: colors.text, fontSize: 12, fontWeight: 'bold' }
      },
      data: cls
    });
  });

  // Add relationships as edges
  analysisData.relationships.forEach(rel => {
    edges.push({
      source: rel.from,
      target: rel.to,
      label: rel.type,
      attrs: {
        line: { stroke: '#666', strokeWidth: 2, targetMarker: { name: 'block', size: 6 } },
        label: { fill: '#666', fontSize: 10 }
      },
      router: { name: 'manhattan' }
    });
  });

  return { nodes, edges };
}

// Class diagram adapter - UML-style class representation
export function adaptToClassDiagram(analysisData: AnalysisData): { nodes: X6NodeConfig[]; edges: X6EdgeConfig[] } {
  const nodes: X6NodeConfig[] = [];
  const edges: X6EdgeConfig[] = [];
  
  // Create nodes for all classes with UML-style representation
  analysisData.classes.forEach((cls, idx) => {
    const colors = getColorForType(cls.type);
    const row = Math.floor(idx / 4);
    const col = idx % 4;
    
    // Build UML content
    const methods = cls.methods?.slice(0, 5).map(m => `+ ${m.name}()`).join('\\n') || '';
    const fields = cls.fields?.slice(0, 5).map(f => `- ${f.name}: ${f.type}`).join('\\n') || '';
    
    nodes.push({
      id: cls.name,
      x: 50 + (col * 280),
      y: 50 + (row * 200),
      width: 250,
      height: 150,
      label: `«${cls.type}»\n${cls.name}\n---\n${fields}\n---\n${methods}`,
      shape: 'rect',
      attrs: {
        body: { fill: colors.fill, stroke: colors.stroke, strokeWidth: 2, rx: 4, ry: 4 },
        label: { fill: colors.text, fontSize: 10, textAnchor: 'middle', textVerticalAnchor: 'top', refY: 10 }
      },
      data: cls
    });
  });

  // Add relationships
  analysisData.relationships.forEach(rel => {
    const edgeStyle = getEdgeStyleForRelation(rel.type);
    edges.push({
      source: rel.from,
      target: rel.to,
      label: rel.type,
      attrs: {
        line: { ...edgeStyle, targetMarker: { name: 'block', size: 6 } },
        label: { fill: '#666', fontSize: 9 }
      },
      router: { name: 'orth' }
    });
  });

  return { nodes, edges };
}

// Component diagram adapter - architectural components view
export function adaptToComponentDiagram(analysisData: AnalysisData): { nodes: X6NodeConfig[]; edges: X6EdgeConfig[] } {
  const nodes: X6NodeConfig[] = [];
  const edges: X6EdgeConfig[] = [];
  
  // Group by type for component view
  const componentGroups = {
    'Web Layer': analysisData.classes.filter(c => c.type === 'controller'),
    'Service Layer': analysisData.classes.filter(c => c.type === 'service'),
    'Data Layer': analysisData.classes.filter(c => c.type === 'repository'),
    'Domain Model': analysisData.classes.filter(c => c.type === 'entity')
  };

  let yOffset = 50;
  Object.entries(componentGroups).forEach(([groupName, classes]) => {
    if (classes.length === 0) return;

    const colors = getColorForType(classes[0].type);
    
    // Create component node
    nodes.push({
      id: groupName,
      x: 100,
      y: yOffset,
      width: 300,
      height: 120,
      label: `${groupName}\n(${classes.length} ${classes.length === 1 ? 'class' : 'classes'})`,
      shape: 'rect',
      attrs: {
        body: { fill: colors.fill, stroke: colors.stroke, strokeWidth: 3, rx: 10, ry: 10 },
        label: { fill: colors.text, fontSize: 14, fontWeight: 'bold' }
      },
      data: { classes, type: groupName }
    });

    yOffset += 180;
  });

  // Add inter-layer relationships
  const layers = Object.keys(componentGroups);
  for (let i = 0; i < layers.length - 1; i++) {
    if (componentGroups[layers[i] as keyof typeof componentGroups].length > 0 && 
        componentGroups[layers[i + 1] as keyof typeof componentGroups].length > 0) {
      edges.push({
        source: layers[i],
        target: layers[i + 1],
        label: 'depends on',
        attrs: {
          line: { stroke: '#666', strokeWidth: 3, targetMarker: { name: 'block', size: 8 }, strokeDasharray: '5,5' },
          label: { fill: '#666', fontSize: 11 }
        }
      });
    }
  }

  return { nodes, edges };
}

function getEdgeStyleForRelation(type: string) {
  switch (type) {
    case 'extends':
      return { stroke: '#1976d2', strokeWidth: 2, strokeDasharray: '0' };
    case 'implements':
      return { stroke: '#388e3c', strokeWidth: 2, strokeDasharray: '5,5' };
    case 'calls':
      return { stroke: '#f57c00', strokeWidth: 1.5 };
    case 'uses':
      return { stroke: '#7b1fa2', strokeWidth: 1.5, strokeDasharray: '3,3' };
    default:
      return { stroke: '#666', strokeWidth: 1 };
  }
}

// Export utilities
export function exportGraphToPNG(graph: Graph, filename: string = 'diagram.png') {
  graph.exportPNG(filename, {
    backgroundColor: '#ffffff',
    padding: 20,
  });
}

export function exportGraphToSVG(graph: Graph, filename: string = 'diagram.svg') {
  graph.exportSVG(filename, {
    preserveDimensions: true,
  });
}

export async function getGraphDataUri(graph: Graph): Promise<string> {
  return new Promise((resolve) => {
    graph.toDataURL((dataUri: string) => {
      resolve(dataUri);
    }, {
      backgroundColor: '#ffffff',
      padding: 20,
    });
  });
}
