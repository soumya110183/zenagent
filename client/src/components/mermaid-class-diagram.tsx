import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import type { AnalysisData } from '@shared/schema';

interface MermaidClassDiagramProps {
  analysisData: AnalysisData;
}

export default function MermaidClassDiagram({ analysisData }: MermaidClassDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      themeVariables: {
        primaryColor: '#e3f2fd',
        primaryTextColor: '#0d47a1',
        primaryBorderColor: '#1976d2',
        lineColor: '#666',
        secondaryColor: '#f3e5f5',
        tertiaryColor: '#e8f5e9',
      },
      classDiagram: {
        htmlLabels: true,
      },
    });

    // Generate Mermaid syntax from analysis data
    const mermaidSyntax = generateMermaidClassDiagram(analysisData);

    if (containerRef.current) {
      containerRef.current.innerHTML = `<div class="mermaid">${mermaidSyntax}</div>`;
      mermaid.contentLoaded();
    }
  }, [analysisData]);

  return (
    <div 
      ref={containerRef} 
      className="w-full p-6 bg-white overflow-auto"
      data-testid="mermaid-class-diagram"
      style={{ minHeight: '600px' }}
    />
  );
}

function generateMermaidClassDiagram(analysisData: AnalysisData): string {
  const lines: string[] = ['classDiagram'];

  // Add classes with their members
  analysisData.classes.forEach(cls => {
    // Clean class name - replace problematic characters
    const cleanClassName = cls.name.replace(/[^a-zA-Z0-9_]/g, '_');
    
    // Class definition with stereotype
    lines.push(`  class ${cleanClassName} {`);
    lines.push(`    <<${cls.type}>>`);
    
    // Add fields (limit to 6 for readability)
    if (cls.fields && cls.fields.length > 0) {
      cls.fields.slice(0, 6).forEach(field => {
        // Clean type and field names - remove generic brackets and special chars
        const cleanType = field.type.replace(/[<>[\]]/g, '').substring(0, 20);
        const cleanFieldName = field.name.replace(/[^a-zA-Z0-9_]/g, '_');
        lines.push(`    -${cleanType} ${cleanFieldName}`);
      });
    }
    
    // Add methods (limit to 6 for readability)
    if (cls.methods && cls.methods.length > 0) {
      cls.methods.slice(0, 6).forEach(method => {
        const cleanMethodName = method.name.replace(/[^a-zA-Z0-9_]/g, '_');
        lines.push(`    +${cleanMethodName}()`);
      });
    }
    
    lines.push(`  }`);
  });

  // Add relationships
  analysisData.relationships.forEach(rel => {
    const cleanFrom = rel.from.replace(/[^a-zA-Z0-9_]/g, '_');
    const cleanTo = rel.to.replace(/[^a-zA-Z0-9_]/g, '_');
    
    // Map relationship types to Mermaid syntax
    let mermaidRel = '-->';
    switch (rel.type) {
      case 'extends':
        mermaidRel = '--|>'; // Inheritance
        break;
      case 'implements':
        mermaidRel = '..|>'; // Implementation
        break;
      case 'uses':
        mermaidRel = '..>'; // Dependency
        break;
      case 'calls':
        mermaidRel = '-->'; // Association
        break;
      case 'has':
      case 'contains':
        mermaidRel = '--*'; // Composition
        break;
      default:
        mermaidRel = '-->'; // Default association
    }
    
    lines.push(`  ${cleanFrom} ${mermaidRel} ${cleanTo}`);
  });

  return lines.join('\n');
}
