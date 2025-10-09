import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { type AnalysisData } from '@shared/schema';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface MermaidSequenceDiagramProps {
  analysisData: AnalysisData;
}

export default function MermaidSequenceDiagram({ analysisData }: MermaidSequenceDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      sequence: {
        useMaxWidth: true,
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
      },
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || !analysisData) return;

    const renderDiagram = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const sequenceCode = generateSequenceDiagram(analysisData);
        
        const { svg } = await mermaid.render(`seq-${Date.now()}`, sequenceCode);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid sequence diagram error:', err);
        setError('Failed to render sequence diagram. The diagram may be too complex.');
      } finally {
        setIsLoading(false);
      }
    };

    renderDiagram();
  }, [analysisData]);

  return (
    <div className="p-6 bg-white">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div 
        ref={containerRef} 
        className="mermaid-container flex justify-center"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}

function generateSequenceDiagram(analysisData: AnalysisData): string {
  const controllers = analysisData.classes.filter(c => c.type === 'controller');
  const services = analysisData.classes.filter(c => c.type === 'service');
  const repositories = analysisData.classes.filter(c => c.type === 'repository');
  const entities = analysisData.entities || [];
  
  let sequence = 'sequenceDiagram\n';
  sequence += '  participant User\n';
  
  // Analyze relationships to find actual flows
  const flows = findActualFlows(analysisData);
  
  if (flows.length > 0) {
    // Use the first identified flow
    const flow = flows[0];
    
    // Add participants based on actual flow
    const participants = new Set<string>();
    participants.add('User');
    
    if (flow.controller) {
      const ctrlName = sanitizeName(flow.controller.name);
      participants.add(ctrlName);
      sequence += `  participant ${ctrlName}\n`;
    }
    
    if (flow.service) {
      const svcName = sanitizeName(flow.service.name);
      participants.add(svcName);
      sequence += `  participant ${svcName}\n`;
    }
    
    if (flow.repository) {
      const repoName = sanitizeName(flow.repository.name);
      participants.add(repoName);
      sequence += `  participant ${repoName}\n`;
    }
    
    if (flow.repository || entities.length > 0) {
      sequence += '  participant Database\n';
    }
    
    sequence += '\n';
    
    // Generate actual flow
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
          sequence += `  Note over ${svcName}: ${sanitizeName(svcMethod.name)}()\n`;
        }
        
        if (flow.repository) {
          const repoName = sanitizeName(flow.repository.name);
          const repoMethod = flow.repositoryMethod || (flow.repository.methods && flow.repository.methods[0]);
          
          sequence += `  ${svcName}->>${repoName}: Data Access\n`;
          sequence += `  activate ${repoName}\n`;
          
          if (repoMethod) {
            sequence += `  Note over ${repoName}: ${sanitizeName(repoMethod.name)}()\n`;
          }
          
          sequence += `  ${repoName}->>Database: SQL Query\n`;
          sequence += '  activate Database\n';
          
          if (flow.entity) {
            sequence += `  Database-->>${repoName}: ${sanitizeName(flow.entity.name)} Data\n`;
          } else {
            sequence += `  Database-->>${repoName}: Query Result\n`;
          }
          
          sequence += '  deactivate Database\n';
          sequence += `  ${repoName}-->>${svcName}: Entity/DTO\n`;
          sequence += `  deactivate ${repoName}\n`;
        }
        
        sequence += `  ${svcName}-->>${ctrlName}: Business Data\n`;
        sequence += `  deactivate ${svcName}\n`;
      }
      
      sequence += `  ${ctrlName}-->>User: JSON Response\n`;
      sequence += `  deactivate ${ctrlName}\n`;
    }
  } else {
    // Fallback to basic structure if no flows detected
    if (controllers.length > 0 && services.length > 0) {
      const ctrl = controllers[0];
      const svc = services[0];
      const ctrlName = sanitizeName(ctrl.name);
      const svcName = sanitizeName(svc.name);
      
      sequence += `  participant ${ctrlName}\n`;
      sequence += `  participant ${svcName}\n`;
      
      if (repositories.length > 0) {
        const repo = repositories[0];
        const repoName = sanitizeName(repo.name);
        sequence += `  participant ${repoName}\n`;
        sequence += '  participant Database\n\n';
        
        sequence += '  User->>User: Initiate Request\n';
        sequence += `  User->>${ctrlName}: HTTP Request\n`;
        sequence += `  ${ctrlName}->>${svcName}: Process\n`;
        sequence += `  ${svcName}->>${repoName}: Query\n`;
        sequence += `  ${repoName}->>Database: SQL\n`;
        sequence += `  Database-->>${repoName}: Data\n`;
        sequence += `  ${repoName}-->>${svcName}: Entity\n`;
        sequence += `  ${svcName}-->>${ctrlName}: Result\n`;
        sequence += `  ${ctrlName}-->>User: Response\n`;
      } else {
        sequence += '\n  User->>User: Initiate Request\n';
        sequence += `  User->>${ctrlName}: HTTP Request\n`;
        sequence += `  ${ctrlName}->>${svcName}: Process\n`;
        sequence += `  ${svcName}-->>${ctrlName}: Result\n`;
        sequence += `  ${ctrlName}-->>User: Response\n`;
      }
    } else {
      sequence += '  participant Application\n\n';
      sequence += '  User->>Application: Request\n';
      sequence += '  Application-->>User: Response\n';
    }
  }
  
  return sequence;
}

function findActualFlows(analysisData: AnalysisData): any[] {
  const flows: any[] = [];
  const controllers = analysisData.classes.filter(c => c.type === 'controller');
  
  controllers.forEach(controller => {
    // Find services this controller depends on
    const controllerDeps = controller.dependencies || [];
    const services = analysisData.classes.filter(c => 
      c.type === 'service' && controllerDeps.some(dep => dep.includes(c.name))
    );
    
    services.forEach(service => {
      // Find repositories this service depends on
      const serviceDeps = service.dependencies || [];
      const repositories = analysisData.classes.filter(c => 
        c.type === 'repository' && serviceDeps.some(dep => dep.includes(c.name))
      );
      
      if (repositories.length > 0) {
        const repo = repositories[0];
        // Find related entity
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
    
    // If controller has no service dependencies, check for direct repository access
    if (services.length === 0) {
      const repositories = analysisData.classes.filter(c => 
        c.type === 'repository' && controllerDeps.some(dep => dep.includes(c.name))
      );
      
      if (repositories.length > 0) {
        flows.push({
          controller,
          controllerMethod: controller.methods?.[0],
          repository: repositories[0],
          repositoryMethod: repositories[0].methods?.[0]
        });
      }
    }
  });
  
  return flows;
}

function detectHttpMethod(method: any): string {
  const name = method.name.toLowerCase();
  const annotations = method.annotations || [];
  
  if (annotations.some((a: string) => a.includes('GetMapping') || a.includes('GET'))) return 'GET';
  if (annotations.some((a: string) => a.includes('PostMapping') || a.includes('POST'))) return 'POST';
  if (annotations.some((a: string) => a.includes('PutMapping') || a.includes('PUT'))) return 'PUT';
  if (annotations.some((a: string) => a.includes('DeleteMapping') || a.includes('DELETE'))) return 'DELETE';
  
  if (name.startsWith('get') || name.startsWith('find') || name.startsWith('list')) return 'GET';
  if (name.startsWith('create') || name.startsWith('add') || name.startsWith('save')) return 'POST';
  if (name.startsWith('update') || name.startsWith('modify')) return 'PUT';
  if (name.startsWith('delete') || name.startsWith('remove')) return 'DELETE';
  
  return 'GET';
}

function sanitizeName(name: string): string {
  return name
    .replace(/[<>]/g, '')
    .replace(/[^\w]/g, '')
    .substring(0, 20);
}
