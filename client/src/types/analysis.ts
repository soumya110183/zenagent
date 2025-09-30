export interface DiagramNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    className: string;
    annotations: string[];
    methods?: Array<{
      name: string;
      annotations: string[];
    }>;
    fields?: Array<{
      name: string;
      type: string;
      annotations: string[];
    }>;
  };
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

export type DiagramType = 'flow' | 'component' | 'class';
