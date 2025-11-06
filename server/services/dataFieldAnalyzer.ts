// Cytoscape format types
interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    type: string;
  };
}

interface CytoscapeEdge {
  data: {
    id: string;
    source: string;
    target: string;
    label?: string;
  };
}

interface FieldNode {
  name: string;
  className: string;
  file: string;
  type: 'field' | 'parameter' | 'variable';
  dataType?: string;
  accessedBy: string[]; // Functions/methods that access this field
  assignedBy: string[]; // Functions/methods that assign to this field
}

interface DataFieldResult {
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
  stats: {
    totalFields: number;
    totalAccesses: number;
    sharedFields: number;
  };
}

export class DataFieldAnalyzer {
  private fields: Map<string, FieldNode> = new Map();
  private accessGraph: Map<string, Set<string>> = new Map();

  async analyzeProject(files: Array<{ path: string; content: string; language: string }>, fieldName?: string): Promise<DataFieldResult> {
    this.fields.clear();
    this.accessGraph.clear();

    // Extract fields from all files
    for (const file of files) {
      this.extractFields(file.path, file.content, file.language);
    }

    // Build access graph
    this.buildAccessGraph();

    // Convert to Cytoscape format
    return this.generateFieldFlowData(fieldName);
  }

  private extractFields(filePath: string, content: string, language: string) {
    if (language === 'java') {
      this.extractJavaFields(filePath, content);
    } else if (language === 'javascript' || language === 'typescript') {
      this.extractJSFields(filePath, content);
    } else if (language === 'python') {
      this.extractPythonFields(filePath, content);
    }
  }

  private extractJavaFields(filePath: string, content: string) {
    // Extract class name
    const classMatch = content.match(/class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : 'Unknown';

    // Extract field declarations (private/public/protected type fieldName)
    const fieldPattern = /(?:private|public|protected|static|final)\s+(?:static\s+)?(?:final\s+)?(\w+(?:<[\w\s,<>]+>)?)\s+(\w+)\s*[;=]/g;
    let match;

    while ((match = fieldPattern.exec(content)) !== null) {
      const dataType = match[1];
      const fieldName = match[2];
      const fieldId = `${className}.${fieldName}`;

      this.fields.set(fieldId, {
        name: fieldName,
        className,
        file: filePath,
        type: 'field',
        dataType,
        accessedBy: [],
        assignedBy: [],
      });
    }

    // Get all field names for this class to detect direct accesses
    const classFieldNames = new Set<string>();
    this.fields.forEach((field, fieldId) => {
      if (fieldId.startsWith(`${className}.`)) {
        classFieldNames.add(field.name);
      }
    });

    // Extract field accesses (this.fieldName, objectName.fieldName, or direct fieldName)
    const methods = this.extractJavaMethods(content);

    methods.forEach(method => {
      const methodBody = content.substring(method.startIndex, method.endIndex);
      
      // Pattern 1: this.fieldName or super.fieldName or objectName.fieldName
      const dotAccessPattern = /(?:this|super)\.(\w+)|(\w+)\.(\w+)/g;
      let accessMatch;

      while ((accessMatch = dotAccessPattern.exec(methodBody)) !== null) {
        const fieldName = accessMatch[1] || accessMatch[3];
        if (fieldName) {
          const fieldId = `${className}.${fieldName}`;
          const field = this.fields.get(fieldId);

          if (field) {
            const matchEnd = accessMatch.index + accessMatch[0].length;
            const afterMatch = methodBody.substring(matchEnd, matchEnd + 10);
            
            if (afterMatch.match(/^\s*=(?!=)/)) {
              if (!field.assignedBy.includes(method.name)) {
                field.assignedBy.push(method.name);
              }
            } else {
              if (!field.accessedBy.includes(method.name)) {
                field.accessedBy.push(method.name);
              }
            }
          }
        }
      }

      // Pattern 2: Direct field access (bare fieldName without "this.")
      classFieldNames.forEach(fieldName => {
        // Match field name as whole word, not part of another identifier
        const directAccessPattern = new RegExp(`\\b${fieldName}\\b`, 'g');
        let match;

        while ((match = directAccessPattern.exec(methodBody)) !== null) {
          const fieldId = `${className}.${fieldName}`;
          const field = this.fields.get(fieldId);

          if (field) {
            // Skip if it's part of "this.fieldName" (already caught above)
            const beforeMatch = methodBody.substring(Math.max(0, match.index - 5), match.index);
            if (beforeMatch.match(/(?:this|super)\.\s*$/)) {
              continue;
            }

            const matchEnd = match.index + match[0].length;
            const afterMatch = methodBody.substring(matchEnd, matchEnd + 10);
            
            if (afterMatch.match(/^\s*=(?!=)/)) {
              if (!field.assignedBy.includes(method.name)) {
                field.assignedBy.push(method.name);
              }
            } else {
              // Only count as access if followed by common access patterns
              if (afterMatch.match(/^[\s.;,)(\[]/) || matchEnd === methodBody.length) {
                if (!field.accessedBy.includes(method.name)) {
                  field.accessedBy.push(method.name);
                }
              }
            }
          }
        }
      });
    });
  }

  private extractJSFields(filePath: string, content: string) {
    // Extract class name
    const classMatch = content.match(/(?:class|export\s+class)\s+(\w+)/);
    const className = classMatch ? classMatch[1] : 'Module';

    // Extract field declarations in constructors and class properties
    const constructorPattern = /constructor\s*\([^)]*\)\s*{([^}]*)}/;
    const constructorMatch = content.match(constructorPattern);

    if (constructorMatch) {
      const constructorBody = constructorMatch[1];
      const fieldPattern = /this\.(\w+)\s*=/g;
      let match;

      while ((match = fieldPattern.exec(constructorBody)) !== null) {
        const fieldName = match[1];
        const fieldId = `${className}.${fieldName}`;

        this.fields.set(fieldId, {
          name: fieldName,
          className,
          file: filePath,
          type: 'field',
          accessedBy: [],
          assignedBy: [],
        });
      }
    }

    // Extract class property declarations (modern syntax)
    const propertyPattern = /(?:public|private|protected|readonly)?\s+(\w+)\s*[:=]/g;
    let match;

    while ((match = propertyPattern.exec(content)) !== null) {
      const fieldName = match[1];
      if (!['constructor', 'function', 'class', 'const', 'let', 'var'].includes(fieldName)) {
        const fieldId = `${className}.${fieldName}`;

        if (!this.fields.has(fieldId)) {
          this.fields.set(fieldId, {
            name: fieldName,
            className,
            file: filePath,
            type: 'field',
            accessedBy: [],
            assignedBy: [],
          });
        }
      }
    }

    // Extract field accesses
    const methods = this.extractJSMethods(content);
    
    methods.forEach(method => {
      const methodBody = content.substring(method.startIndex, method.endIndex);
      const accessPattern = /this\.(\w+)/g;
      let accessMatch;

      while ((accessMatch = accessPattern.exec(methodBody)) !== null) {
        const fieldName = accessMatch[1];
        const fieldId = `${className}.${fieldName}`;
        const field = this.fields.get(fieldId);

        if (field) {
          const matchEnd = accessMatch.index + accessMatch[0].length;
          const afterMatch = methodBody.substring(matchEnd, matchEnd + 10);
          
          // Check if there's a single '=' immediately after (assignment)
          // Exclude ==, ===, !=, etc. (comparisons)
          if (afterMatch.match(/^\s*=(?!=)/)) {
            field.assignedBy.push(method.name);
          } else {
            field.accessedBy.push(method.name);
          }
        }
      }
    });
  }

  private extractPythonFields(filePath: string, content: string) {
    // Extract class name
    const classMatch = content.match(/class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : 'Module';

    // Extract field declarations in __init__ method
    const initPattern = /def\s+__init__\s*\([^)]*\):\s*((?:.*\n)*?)(?=\n\s*def|\nclass|\Z)/;
    const initMatch = content.match(initPattern);

    if (initMatch) {
      const initBody = initMatch[1];
      const fieldPattern = /self\.(\w+)\s*=/g;
      let match;

      while ((match = fieldPattern.exec(initBody)) !== null) {
        const fieldName = match[1];
        const fieldId = `${className}.${fieldName}`;

        this.fields.set(fieldId, {
          name: fieldName,
          className,
          file: filePath,
          type: 'field',
          accessedBy: [],
          assignedBy: [],
        });
      }
    }

    // Extract field accesses
    const methods = this.extractPythonMethods(content);
    
    methods.forEach(method => {
      if (method.name === '__init__') return; // Skip constructor
      
      const methodBody = content.substring(method.startIndex, method.endIndex);
      const accessPattern = /self\.(\w+)/g;
      let accessMatch;

      while ((accessMatch = accessPattern.exec(methodBody)) !== null) {
        const fieldName = accessMatch[1];
        const fieldId = `${className}.${fieldName}`;
        const field = this.fields.get(fieldId);

        if (field) {
          const matchEnd = accessMatch.index + accessMatch[0].length;
          const afterMatch = methodBody.substring(matchEnd, matchEnd + 10);
          
          // Check if there's a single '=' immediately after (assignment)
          // Exclude ==, !=, etc. (comparisons)
          if (afterMatch.match(/^\s*=(?!=)/)) {
            field.assignedBy.push(method.name);
          } else {
            field.accessedBy.push(method.name);
          }
        }
      }
    });
  }

  private extractJavaMethods(content: string): Array<{ name: string; startIndex: number; endIndex: number }> {
    const methods: Array<{ name: string; startIndex: number; endIndex: number }> = [];
    const methodPattern = /(?:public|private|protected|static)\s+(?:static\s+)?(?:final\s+)?[\w<>[\],\s]+\s+(\w+)\s*\([^)]*\)\s*{/g;
    let match;

    while ((match = methodPattern.exec(content)) !== null) {
      const methodName = match[1];
      const startIndex = match.index + match[0].length - 1;
      const endIndex = this.findClosingBrace(content, startIndex);

      methods.push({
        name: methodName,
        startIndex,
        endIndex,
      });
    }

    return methods;
  }

  private extractJSMethods(content: string): Array<{ name: string; startIndex: number; endIndex: number }> {
    const methods: Array<{ name: string; startIndex: number; endIndex: number }> = [];
    const methodPattern = /(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/g;
    let match;

    while ((match = methodPattern.exec(content)) !== null) {
      const methodName = match[1];
      if (['if', 'for', 'while', 'switch', 'catch', 'function'].includes(methodName)) {
        continue;
      }

      const startIndex = match.index + match[0].length - 1;
      const endIndex = this.findClosingBrace(content, startIndex);

      methods.push({
        name: methodName,
        startIndex,
        endIndex,
      });
    }

    return methods;
  }

  private extractPythonMethods(content: string): Array<{ name: string; startIndex: number; endIndex: number }> {
    const methods: Array<{ name: string; startIndex: number; endIndex: number }> = [];
    const methodPattern = /def\s+(\w+)\s*\([^)]*\):/g;
    let match;

    while ((match = methodPattern.exec(content)) !== null) {
      const methodName = match[1];
      const startIndex = match.index;
      
      // Find end of method (next 'def' or end of class/file)
      const nextDefMatch = content.substring(startIndex + match[0].length).search(/\ndef\s+\w+/);
      const endIndex = nextDefMatch === -1 
        ? content.length 
        : startIndex + match[0].length + nextDefMatch;

      methods.push({
        name: methodName,
        startIndex,
        endIndex,
      });
    }

    return methods;
  }

  private findClosingBrace(content: string, startIndex: number): number {
    let depth = 1;
    let i = startIndex + 1;
    
    while (i < content.length && depth > 0) {
      if (content[i] === '{') depth++;
      if (content[i] === '}') depth--;
      i++;
    }
    
    return depth === 0 ? i - 1 : startIndex;
  }

  private buildAccessGraph() {
    // Build relationships between fields and methods that access them
    this.fields.forEach((field, fieldId) => {
      const accessSet = new Set<string>();

      // Add all methods that access or assign this field
      [...field.accessedBy, ...field.assignedBy].forEach(methodName => {
        accessSet.add(`${field.className}.${methodName}`);
      });

      this.accessGraph.set(fieldId, accessSet);
    });
  }

  private generateFieldFlowData(fieldName?: string): DataFieldResult {
    const nodes: CytoscapeNode[] = [];
    const edges: CytoscapeEdge[] = [];

    // Filter fields if fieldName is provided
    let filteredFields = this.fields;
    let filteredAccessGraph = this.accessGraph;

    if (fieldName) {
      const relevantFieldIds = new Set<string>();
      
      // Find fields matching the fieldName
      this.fields.forEach((field, fieldId) => {
        if (field.name.toLowerCase().includes(fieldName.toLowerCase())) {
          relevantFieldIds.add(fieldId);
        }
      });

      // Filter fields map
      filteredFields = new Map(
        Array.from(this.fields.entries()).filter(([fieldId]) => relevantFieldIds.has(fieldId))
      );

      // Filter access graph
      filteredAccessGraph = new Map(
        Array.from(this.accessGraph.entries()).filter(([fieldId]) => relevantFieldIds.has(fieldId))
      );
    }

    // Create nodes for each field
    filteredFields.forEach((field, fieldId) => {
      const node: CytoscapeNode = {
        data: {
          id: fieldId,
          label: `${field.name}\n(${field.className})`,
          type: field.type,
        },
      };
      nodes.push(node);
    });

    // Create nodes for methods and edges
    const methodNodes = new Set<string>();
    let edgeIndex = 0;

    filteredAccessGraph.forEach((methods, fieldId) => {
      methods.forEach(methodId => {
        // Create method node if it doesn't exist
        if (!methodNodes.has(methodId)) {
          const node: CytoscapeNode = {
            data: {
              id: methodId,
              label: methodId.split('.').pop() || methodId,
              type: 'method',
            },
          };
          nodes.push(node);
          methodNodes.add(methodId);
        }

        // Create edge from method to field
        const edge: CytoscapeEdge = {
          data: {
            id: `edge-${edgeIndex++}`,
            source: methodId,
            target: fieldId,
            label: 'accesses',
          },
        };
        edges.push(edge);
      });
    });

    // Calculate statistics
    const sharedFields = Array.from(filteredFields.values()).filter(
      f => f.accessedBy.length + f.assignedBy.length > 1
    ).length;

    const stats = {
      totalFields: filteredFields.size,
      totalAccesses: Array.from(filteredAccessGraph.values()).reduce((sum, set) => sum + set.size, 0),
      sharedFields,
    };

    return {
      nodes,
      edges,
      stats,
    };
  }
}
