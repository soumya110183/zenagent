import mermaid from 'mermaid';
import type { AnalysisData } from '@shared/schema';
import html2canvas from 'html2canvas';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

export interface DiagramImages {
  flow: string | null;
  component: string | null;
  sequence: string | null;
  class: string | null;
}

// Generate Flow Diagram Mermaid Code
function generateFlowchart(analysisData: AnalysisData): string {
  const controllers = analysisData.classes.filter(c => c.type === 'controller');
  const services = analysisData.classes.filter(c => c.type === 'service');
  const repositories = analysisData.classes.filter(c => c.type === 'repository');
  
  let flowchart = 'flowchart TB\n';
  
  flowchart += '  Start([User Request]) --> Router\n';
  
  if (controllers.length > 0) {
    flowchart += '  Router{Route Request} --> Controllers\n';
    
    controllers.forEach((controller, idx) => {
      const cleanName = sanitizeName(controller.name);
      flowchart += `  Controllers --> C${idx}[${cleanName}]\n`;
    });
    
    if (services.length > 0) {
      controllers.forEach((_, idx) => {
        flowchart += `  C${idx} --> ServiceLayer\n`;
      });
      
      flowchart += '  ServiceLayer{Business Logic} --> Services\n';
      
      services.forEach((service, idx) => {
        const cleanName = sanitizeName(service.name);
        flowchart += `  Services --> S${idx}[${cleanName}]\n`;
      });
      
      if (repositories.length > 0) {
        services.forEach((_, idx) => {
          flowchart += `  S${idx} --> DataLayer\n`;
        });
        
        flowchart += '  DataLayer{Data Access} --> Repos\n';
        
        repositories.forEach((repo, idx) => {
          const cleanName = sanitizeName(repo.name);
          flowchart += `  Repos --> R${idx}[(${cleanName})]\n`;
        });
        
        repositories.forEach((_, idx) => {
          flowchart += `  R${idx} --> Database[(Database)]\n`;
        });
      }
    } else if (repositories.length > 0) {
      controllers.forEach((_, idx) => {
        flowchart += `  C${idx} --> DataAccess\n`;
      });
      
      flowchart += '  DataAccess{Data Layer} --> Repos\n';
      
      repositories.forEach((repo, idx) => {
        const cleanName = sanitizeName(repo.name);
        flowchart += `  Repos --> R${idx}[(${cleanName})]\n`;
      });
      
      repositories.forEach((_, idx) => {
        flowchart += `  R${idx} --> Database[(Database)]\n`;
      });
    }
    
    flowchart += '  Database --> Response\n';
    flowchart += '  Response[Process Response] --> End([Return to User])\n';
  } else {
    flowchart += '  Router --> Process[Process Request]\n';
    flowchart += '  Process --> End([Response])\n';
  }
  
  flowchart += '\n  style Start fill:#e1f5e1\n';
  flowchart += '  style End fill:#e1f5e1\n';
  flowchart += '  style Database fill:#fff4e1\n';
  flowchart += '  style Router fill:#e3f2fd\n';
  flowchart += '  style ServiceLayer fill:#f3e5f5\n';
  flowchart += '  style DataLayer fill:#fce4ec\n';
  
  return flowchart;
}

// Generate Sequence Diagram Mermaid Code
function generateSequenceDiagram(analysisData: AnalysisData): string {
  const flows = findActualFlows(analysisData);
  const entities = analysisData.entities || [];
  
  let sequence = 'sequenceDiagram\n';
  sequence += '  participant User\n';
  
  if (flows.length > 0) {
    const flow = flows[0];
    
    if (flow.controller) {
      const ctrlName = sanitizeName(flow.controller.name);
      sequence += `  participant ${ctrlName}\n`;
    }
    
    if (flow.service) {
      const svcName = sanitizeName(flow.service.name);
      sequence += `  participant ${svcName}\n`;
    }
    
    if (flow.repository) {
      const repoName = sanitizeName(flow.repository.name);
      sequence += `  participant ${repoName}\n`;
    }
    
    if (flow.repository || entities.length > 0) {
      sequence += '  participant Database\n';
    }
    
    sequence += '\n';
    sequence += '  User->>User: Initiate Request\n';
    
    if (flow.controller) {
      const ctrlName = sanitizeName(flow.controller.name);
      const method = flow.controllerMethod || (flow.controller.methods && flow.controller.methods[0]);
      
      if (method) {
        const methodName = sanitizeName(method.name);
        const httpMethod = detectHttpMethod(method);
        sequence += `  User->>${ctrlName}: ${httpMethod} Request\n`;
        sequence += `  activate ${ctrlName}\n`;
        sequence += `  Note over ${ctrlName}: ${methodName}()\n`;
      } else {
        sequence += `  User->>${ctrlName}: HTTP Request\n`;
        sequence += `  activate ${ctrlName}\n`;
      }
      
      if (flow.service) {
        const svcName = sanitizeName(flow.service.name);
        const svcMethod = flow.serviceMethod || (flow.service.methods && flow.service.methods[0]);
        
        sequence += `  ${ctrlName}->>${svcName}: Delegate to Service\n`;
        sequence += `  activate ${svcName}\n`;
        
        if (svcMethod) {
          const methodName = sanitizeName(svcMethod.name);
          sequence += `  Note over ${svcName}: ${methodName}()\n`;
        }
        
        if (flow.repository) {
          const repoName = sanitizeName(flow.repository.name);
          const repoMethod = flow.repositoryMethod || (flow.repository.methods && flow.repository.methods[0]);
          
          sequence += `  ${svcName}->>${repoName}: Access Data\n`;
          sequence += `  activate ${repoName}\n`;
          
          if (repoMethod) {
            const methodName = sanitizeName(repoMethod.name);
            sequence += `  Note over ${repoName}: ${methodName}()\n`;
          }
          
          sequence += `  ${repoName}->>Database: Query/Update\n`;
          sequence += `  Database-->>${repoName}: Data\n`;
          sequence += `  deactivate ${repoName}\n`;
          sequence += `  ${repoName}-->>${svcName}: Result\n`;
        }
        
        sequence += `  deactivate ${svcName}\n`;
        sequence += `  ${svcName}-->>${ctrlName}: Processed Data\n`;
      }
      
      sequence += `  deactivate ${ctrlName}\n`;
      sequence += `  ${ctrlName}->>User: Response\n`;
    }
  } else {
    sequence += '  participant System\n';
    sequence += '  User->>System: Request\n';
    sequence += '  activate System\n';
    sequence += '  System->>Database: Query\n';
    sequence += '  Database-->>System: Data\n';
    sequence += '  deactivate System\n';
    sequence += '  System->>User: Response\n';
  }
  
  return sequence;
}

// Generate Class Diagram Mermaid Code
function generateClassDiagram(analysisData: AnalysisData): string {
  const lines: string[] = ['classDiagram'];
  const classesToShow = analysisData.classes.slice(0, 30);
  
  classesToShow.forEach(cls => {
    const cleanClassName = cls.name.replace(/[^a-zA-Z0-9]/g, '');
    if (!cleanClassName) return;
    
    lines.push(`  class ${cleanClassName} {`);
    lines.push(`    <<${cls.type}>>`);
    
    if (cls.fields && cls.fields.length > 0) {
      cls.fields.slice(0, 5).forEach(field => {
        const cleanType = field.type.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15);
        const cleanFieldName = field.name.replace(/[^a-zA-Z0-9]/g, '');
        if (cleanType && cleanFieldName) {
          lines.push(`    -${cleanType} ${cleanFieldName}`);
        }
      });
    }
    
    if (cls.methods && cls.methods.length > 0) {
      cls.methods.slice(0, 5).forEach(method => {
        const cleanMethodName = method.name.replace(/[^a-zA-Z0-9]/g, '');
        if (cleanMethodName) {
          lines.push(`    +${cleanMethodName}()`);
        }
      });
    }
    
    lines.push(`  }`);
  });
  
  const validClassNames = new Set(
    classesToShow.map(cls => cls.name.replace(/[^a-zA-Z0-9]/g, '')).filter(Boolean)
  );
  
  analysisData.relationships.forEach(rel => {
    const cleanFrom = rel.from.replace(/[^a-zA-Z0-9]/g, '');
    const cleanTo = rel.to.replace(/[^a-zA-Z0-9]/g, '');
    
    if (!validClassNames.has(cleanFrom) || !validClassNames.has(cleanTo)) {
      return;
    }
    
    let mermaidRel = '-->';
    switch (rel.type) {
      case 'extends':
        mermaidRel = '--|>';
        break;
      case 'implements':
        mermaidRel = '..|>';
        break;
      case 'uses':
        mermaidRel = '..>';
        break;
      case 'calls':
        mermaidRel = '-->';
        break;
      default:
        mermaidRel = '-->';
    }
    
    lines.push(`  ${cleanFrom} ${mermaidRel} ${cleanTo}`);
  });
  
  return lines.join('\n');
}

// Helper functions
function findActualFlows(analysisData: AnalysisData): any[] {
  const flows: any[] = [];
  const controllers = analysisData.classes.filter(c => c.type === 'controller');
  const relationships = analysisData.relationships || [];
  
  controllers.forEach(controller => {
    const controllerCalls = relationships.filter(r => 
      r.from === controller.name && r.type === 'calls'
    );
    
    const services = analysisData.classes.filter(c => 
      c.type === 'service' && controllerCalls.some(call => call.to === c.name || call.to.includes(c.name))
    );
    
    if (services.length > 0) {
      services.forEach(service => {
        const serviceCalls = relationships.filter(r => 
          r.from === service.name && r.type === 'calls'
        );
        
        const repositories = analysisData.classes.filter(c => 
          c.type === 'repository' && serviceCalls.some(call => call.to === c.name || call.to.includes(c.name))
        );
        
        if (repositories.length > 0) {
          const repo = repositories[0];
          const entity = analysisData.entities?.find(e => 
            repo.name.toLowerCase().includes(e.name.toLowerCase()) ||
            e.name.toLowerCase().includes(repo.name.toLowerCase().replace('repository', ''))
          );
          
          flows.push({
            controller,
            controllerMethod: controller.methods?.[0],
            service,
            serviceMethod: service.methods?.[0],
            repository: repo,
            repositoryMethod: repo.methods?.[0],
            entity
          });
        } else {
          flows.push({
            controller,
            controllerMethod: controller.methods?.[0],
            service,
            serviceMethod: service.methods?.[0]
          });
        }
      });
    }
  });
  
  return flows;
}

function detectHttpMethod(method: any): string {
  const name = method.name.toLowerCase();
  const annotations = method.annotations || [];
  
  if (annotations.some((a: string) => a.includes('@GetMapping'))) return 'GET';
  if (annotations.some((a: string) => a.includes('@PostMapping'))) return 'POST';
  if (annotations.some((a: string) => a.includes('@PutMapping'))) return 'PUT';
  if (annotations.some((a: string) => a.includes('@DeleteMapping'))) return 'DELETE';
  
  if (name.startsWith('get')) return 'GET';
  if (name.startsWith('create') || name.startsWith('add') || name.startsWith('save')) return 'POST';
  if (name.startsWith('update') || name.startsWith('edit')) return 'PUT';
  if (name.startsWith('delete') || name.startsWith('remove')) return 'DELETE';
  
  return 'GET';
}

function sanitizeName(name: string): string {
  return name
    .replace(/[<>]/g, '')
    .replace(/[^\w]/g, '')
    .substring(0, 20);
}

// Helper to render SVG to data URL (base64 encoded SVG)
async function svgToDataUrl(svgString: string): Promise<string> {
  try {
    // Clean and encode SVG as base64
    const base64 = btoa(unescape(encodeURIComponent(svgString)));
    return `data:image/svg+xml;base64,${base64}`;
  } catch (error) {
    console.error('Error encoding SVG:', error);
    throw error;
  }
}

// Main export function
export async function generateAllDiagramImages(analysisData: AnalysisData): Promise<DiagramImages> {
  const images: DiagramImages = {
    flow: null,
    component: null,
    sequence: null,
    class: null
  };
  
  try {
    // Generate Flow Diagram
    const flowCode = generateFlowchart(analysisData);
    const flowResult = await mermaid.render(`flow-export-${Date.now()}`, flowCode);
    images.flow = await svgToDataUrl(flowResult.svg);
  } catch (error) {
    console.error('Error generating flow diagram:', error);
  }
  
  try {
    // Generate Sequence Diagram
    const sequenceCode = generateSequenceDiagram(analysisData);
    const sequenceResult = await mermaid.render(`sequence-export-${Date.now()}`, sequenceCode);
    images.sequence = await svgToDataUrl(sequenceResult.svg);
  } catch (error) {
    console.error('Error generating sequence diagram:', error);
  }
  
  try {
    // Generate Class Diagram
    const classCode = generateClassDiagram(analysisData);
    const classResult = await mermaid.render(`class-export-${Date.now()}`, classCode);
    images.class = await svgToDataUrl(classResult.svg);
  } catch (error) {
    console.error('Error generating class diagram:', error);
  }
  
  // Component diagram needs to be captured from X6 canvas
  try {
    const componentElement = document.querySelector('[data-testid="diagram-component"] .x6-graph-svg');
    if (componentElement) {
      const canvas = await html2canvas(componentElement as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false
      });
      images.component = canvas.toDataURL('image/png');
    }
  } catch (error) {
    console.error('Error capturing component diagram:', error);
  }
  
  return images;
}
