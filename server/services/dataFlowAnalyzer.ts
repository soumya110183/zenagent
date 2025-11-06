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
  };
}

interface FunctionNode {
  name: string;
  file: string;
  className?: string;
  type: 'controller' | 'service' | 'repository' | 'util' | 'entity';
  calls: string[];
  lineNumber?: number;
  startIndex?: number;
  endIndex?: number;
}

interface DataFlowResult {
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
  stats: {
    totalFunctions: number;
    totalCalls: number;
    maxDepth: number;
    cyclicDependencies: number;
  };
}

export class DataFlowAnalyzer {
  private functions: Map<string, FunctionNode> = new Map();
  private callGraph: Map<string, Set<string>> = new Map();

  async analyzeProject(files: Array<{ path: string; content: string; language: string }>, fieldName?: string): Promise<DataFlowResult> {
    this.functions.clear();
    this.callGraph.clear();

    // Extract functions from all files
    for (const file of files) {
      this.extractFunctions(file.path, file.content, file.language);
    }

    // Build call graph
    this.buildCallGraph();

    // Convert to Cytoscape format
    return this.generateFlowData(files, fieldName);
  }

  private extractFunctions(filePath: string, content: string, language: string) {
    const fileType = this.determineFileType(filePath);

    if (language === 'java') {
      this.extractJavaFunctions(filePath, content, fileType);
    } else if (language === 'javascript' || language === 'typescript') {
      this.extractJSFunctions(filePath, content, fileType);
    } else if (language === 'python') {
      this.extractPythonFunctions(filePath, content, fileType);
    }
  }

  private determineFileType(filePath: string): 'controller' | 'service' | 'repository' | 'util' | 'entity' {
    const lowerPath = filePath.toLowerCase();
    
    if (lowerPath.includes('controller')) return 'controller';
    if (lowerPath.includes('service')) return 'service';
    if (lowerPath.includes('repository') || lowerPath.includes('dao')) return 'repository';
    if (lowerPath.includes('entity') || lowerPath.includes('model')) return 'entity';
    return 'util';
  }

  private extractJavaFunctions(filePath: string, content: string, fileType: string) {
    // Extract class name first
    const classMatch = /class\s+(\w+)/.exec(content);
    const className = classMatch ? classMatch[1] : 'UnknownClass';

    // Enhanced pattern to catch public, private, protected, static, constructors
    const methodPattern = /(public|private|protected)(\s+static)?\s+([\w<>[\]]+)\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
    const constructorPattern = /(public|private|protected)\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
    
    let match;

    // Extract regular methods
    while ((match = methodPattern.exec(content)) !== null) {
      const methodName = match[4];
      const startIndex = match.index + match[0].length - 1; // Start after opening brace
      const endIndex = this.findClosingBrace(content, startIndex);
      
      if (endIndex > startIndex) {
        const methodBody = content.substring(startIndex, endIndex);
        const calls = this.extractCallsFromBody(methodBody);
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        const functionKey = `${filePath}::${className}::${methodName}`;

        this.functions.set(functionKey, {
          name: methodName,
          file: filePath,
          className,
          type: fileType as any,
          calls,
          lineNumber,
          startIndex,
          endIndex,
        });
      }
    }

    // Extract constructors
    while ((match = constructorPattern.exec(content)) !== null) {
      const constructorName = match[2];
      // Only treat as constructor if it matches class name
      if (constructorName === className) {
        const startIndex = match.index + match[0].length - 1;
        const endIndex = this.findClosingBrace(content, startIndex);
        
        if (endIndex > startIndex) {
          const methodBody = content.substring(startIndex, endIndex);
          const calls = this.extractCallsFromBody(methodBody);
          const lineNumber = content.substring(0, match.index).split('\n').length;
          
          const functionKey = `${filePath}::${className}::<init>`;

          this.functions.set(functionKey, {
            name: '<init>',
            file: filePath,
            className,
            type: fileType as any,
            calls,
            lineNumber,
            startIndex,
            endIndex,
          });
        }
      }
    }
  }

  private extractJSFunctions(filePath: string, content: string, fileType: string) {
    // Extract function declarations (both function keyword and arrow functions)
    const functionPatterns = [
      /function\s+(\w+)\s*\([^)]*\)\s*\{/g,
      /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\{/g,
      /async\s+function\s+(\w+)\s*\([^)]*\)\s*\{/g,
    ];

    functionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const methodName = match[1];
        const startIndex = match.index + match[0].length - 1;
        const endIndex = this.findClosingBrace(content, startIndex);
        
        if (endIndex > startIndex) {
          const functionBody = content.substring(startIndex, endIndex);
          const calls = this.extractCallsFromBody(functionBody);
          const lineNumber = content.substring(0, match.index).split('\n').length;
          
          const functionKey = `${filePath}::${methodName}`;

          this.functions.set(functionKey, {
            name: methodName,
            file: filePath,
            type: fileType as any,
            calls,
            lineNumber,
            startIndex,
            endIndex,
          });
        }
      }
    });
  }

  private extractPythonFunctions(filePath: string, content: string, fileType: string) {
    // Extract Python function definitions
    // Python uses indentation, so we need a different approach
    const functionPattern = /def\s+(\w+)\s*\([^)]*\):/g;
    let match;

    while ((match = functionPattern.exec(content)) !== null) {
      const methodName = match[1];
      const startIndex = match.index + match[0].length;
      const endIndex = this.findPythonFunctionEnd(content, startIndex);
      
      if (endIndex > startIndex) {
        const functionBody = content.substring(startIndex, endIndex);
        const calls = this.extractCallsFromBody(functionBody);
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        const functionKey = `${filePath}::${methodName}`;

        this.functions.set(functionKey, {
          name: methodName,
          file: filePath,
          type: fileType as any,
          calls,
          lineNumber,
          startIndex,
          endIndex,
        });
      }
    }
  }

  // Find end of Python function based on indentation
  private findPythonFunctionEnd(content: string, startIndex: number): number {
    const lines = content.substring(startIndex).split('\n');
    if (lines.length === 0) return startIndex;
    
    // Find base indentation of function body
    let baseIndent = -1;
    for (const line of lines) {
      const trimmed = line.trimStart();
      if (trimmed.length > 0 && !trimmed.startsWith('#')) {
        baseIndent = line.length - trimmed.length;
        break;
      }
    }
    
    if (baseIndent === -1) return startIndex;
    
    // Find where indentation returns to lower level
    let endIndex = startIndex;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trimStart();
      
      if (trimmed.length === 0 || trimmed.startsWith('#')) {
        endIndex += line.length + 1; // +1 for newline
        continue;
      }
      
      const indent = line.length - trimmed.length;
      if (indent < baseIndent) {
        break;
      }
      
      endIndex += line.length + 1;
    }
    
    return endIndex;
  }

  // Find matching closing brace for a given opening brace
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

  // Extract function calls from a specific function body
  private extractCallsFromBody(functionBody: string): string[] {
    const calls: string[] = [];
    
    // Pattern to find method invocations
    const methodCallPattern = /(\w+)\s*\(/g;
    const objectMethodPattern = /\.(\w+)\s*\(/g;
    
    let match;
    
    // Find direct function calls
    while ((match = methodCallPattern.exec(functionBody)) !== null) {
      const calledFunction = match[1];
      // Filter out common keywords and control flow
      if (!this.isKeyword(calledFunction)) {
        calls.push(calledFunction);
      }
    }
    
    // Reset regex
    objectMethodPattern.lastIndex = 0;
    
    // Find object method calls
    while ((match = objectMethodPattern.exec(functionBody)) !== null) {
      const calledMethod = match[1];
      if (!this.isKeyword(calledMethod)) {
        calls.push(calledMethod);
      }
    }

    return Array.from(new Set(calls)); // Remove duplicates
  }

  // Check if a word is a language keyword
  private isKeyword(word: string): boolean {
    const keywords = new Set([
      'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'return', 
      'new', 'this', 'super', 'try', 'catch', 'finally', 'throw',
      'class', 'extends', 'implements', 'interface', 'import', 'package',
      'public', 'private', 'protected', 'static', 'final', 'abstract',
      'void', 'int', 'long', 'double', 'float', 'boolean', 'char', 'String',
      'true', 'false', 'null', 'undefined', 'var', 'let', 'const',
      'function', 'async', 'await', 'yield', 'break', 'continue',
      'def', 'lambda', 'pass', 'None', 'True', 'False', 'and', 'or', 'not'
    ]);
    return keywords.has(word);
  }

  private buildCallGraph() {
    this.functions.forEach((func, key) => {
      const callSet = new Set<string>();
      
      func.calls.forEach(calledName => {
        // Find matching function definitions
        this.functions.forEach((targetFunc, targetKey) => {
          if (targetFunc.name === calledName && targetKey !== key) {
            callSet.add(targetKey);
          }
        });
      });

      this.callGraph.set(key, callSet);
    });
  }

  private generateFlowData(files: Array<{ path: string; content: string; language: string }>, fieldName?: string): DataFlowResult {
    const nodes: CytoscapeNode[] = [];
    const edges: CytoscapeEdge[] = [];

    // Filter functions if fieldName is provided
    let filteredFunctions = this.functions;
    let filteredCallGraph = this.callGraph;

    if (fieldName) {
      const relevantFunctionKeys = new Set<string>();
      
      // Find functions that reference the field
      this.functions.forEach((func, key) => {
        const file = files.find(f => f.path === func.file);
        if (file && file.content) {
          // Check if the function's content contains the field name
          const patterns = [
            new RegExp(`\\b${fieldName}\\b`, 'i'),
            new RegExp(`get${fieldName}\\(`, 'i'),
            new RegExp(`set${fieldName}\\(`, 'i'),
            new RegExp(`\\.${fieldName}\\b`, 'i'),
          ];
          
          const functionContent = file.content.substring(func.startIndex || 0, func.endIndex || file.content.length);
          const hasFieldReference = patterns.some(pattern => pattern.test(functionContent));
          
          if (hasFieldReference) {
            relevantFunctionKeys.add(key);
          }
        }
      });

      // Filter functions map
      filteredFunctions = new Map(
        Array.from(this.functions.entries()).filter(([key]) => relevantFunctionKeys.has(key))
      );

      // Filter call graph to only include edges between relevant functions
      filteredCallGraph = new Map(
        Array.from(this.callGraph.entries())
          .filter(([source]) => relevantFunctionKeys.has(source))
          .map(([source, targets]) => [
            source,
            new Set(Array.from(targets).filter(target => relevantFunctionKeys.has(target)))
          ])
      );
    }

    // Generate nodes in Cytoscape format
    filteredFunctions.forEach((func, key) => {
      const node: CytoscapeNode = {
        data: {
          id: key,
          label: `${func.name}\n${this.getFileName(func.file)}`,
          type: func.type,
        },
      };
      nodes.push(node);
    });

    // Generate edges in Cytoscape format
    let edgeIndex = 0;
    filteredCallGraph.forEach((targets, source) => {
      targets.forEach(target => {
        const edge: CytoscapeEdge = {
          data: {
            id: `edge-${edgeIndex++}`,
            source,
            target,
          },
        };
        edges.push(edge);
      });
    });

    // Calculate statistics with filtered data
    const stats = this.calculateStatsForFiltered(filteredFunctions, filteredCallGraph);

    return {
      nodes,
      edges,
      stats,
    };
  }

  private calculateStatsForFiltered(functions: Map<string, FunctionNode>, callGraph: Map<string, Set<string>>) {
    let totalCalls = 0;
    callGraph.forEach(targets => {
      totalCalls += targets.size;
    });

    // Calculate max call depth using DFS
    const maxDepth = this.calculateMaxDepthForGraph(callGraph);

    // Detect cyclic dependencies
    const cyclicDependencies = this.detectCyclesForGraph(callGraph);

    return {
      totalFunctions: functions.size,
      totalCalls,
      maxDepth,
      cyclicDependencies,
    };
  }

  private calculateMaxDepthForGraph(callGraph: Map<string, Set<string>>): number {
    let maxDepth = 0;
    const visited = new Set<string>();

    const dfs = (node: string, depth: number) => {
      if (visited.has(node)) return;
      visited.add(node);
      maxDepth = Math.max(maxDepth, depth);

      const targets = callGraph.get(node);
      if (targets) {
        targets.forEach(target => dfs(target, depth + 1));
      }
      
      visited.delete(node);
    };

    callGraph.forEach((_, key) => {
      dfs(key, 1);
    });

    return maxDepth;
  }

  private detectCyclesForGraph(callGraph: Map<string, Set<string>>): number {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    let cycleCount = 0;

    const hasCycle = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);

      const targets = callGraph.get(node);
      if (targets) {
        for (const target of targets) {
          if (!visited.has(target)) {
            if (hasCycle(target)) {
              cycleCount++;
              return true;
            }
          } else if (recursionStack.has(target)) {
            cycleCount++;
            return true;
          }
        }
      }

      recursionStack.delete(node);
      return false;
    };

    callGraph.forEach((_, key) => {
      if (!visited.has(key)) {
        hasCycle(key);
      }
    });

    return cycleCount;
  }

  private calculateNodePositions(): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>();
    
    // Group functions by type
    const typeGroups: Map<string, string[]> = new Map();
    this.functions.forEach((func, key) => {
      const type = func.type;
      if (!typeGroups.has(type)) {
        typeGroups.set(type, []);
      }
      typeGroups.get(type)!.push(key);
    });

    // Layout: arrange by type in columns
    const columnWidth = 300;
    const rowHeight = 100;
    const types = ['controller', 'service', 'repository', 'entity', 'util'];
    
    types.forEach((type, colIndex) => {
      const funcs = typeGroups.get(type) || [];
      funcs.forEach((key, rowIndex) => {
        positions.set(key, {
          x: colIndex * columnWidth,
          y: rowIndex * rowHeight,
        });
      });
    });

    return positions;
  }

  private getNodeColor(type: string): string {
    const colors: Record<string, string> = {
      controller: '#3b82f6', // blue
      service: '#10b981',    // green
      repository: '#8b5cf6', // purple
      entity: '#f59e0b',     // amber
      util: '#6b7280',       // gray
    };
    return colors[type] || '#6b7280';
  }

  private getFileName(filePath: string): string {
    const parts = filePath.split('/');
    return parts[parts.length - 1];
  }

  private calculateStats() {
    let totalCalls = 0;
    this.callGraph.forEach(targets => {
      totalCalls += targets.size;
    });

    // Calculate max call depth using DFS
    const maxDepth = this.calculateMaxDepth();

    // Detect cyclic dependencies
    const cyclicDependencies = this.detectCycles();

    return {
      totalFunctions: this.functions.size,
      totalCalls,
      maxDepth,
      cyclicDependencies,
    };
  }

  private calculateMaxDepth(): number {
    let maxDepth = 0;

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string, depth: number): number => {
      if (recursionStack.has(node)) return depth; // Cycle detected
      if (visited.has(node)) return depth;

      visited.add(node);
      recursionStack.add(node);

      let localMax = depth;
      const targets = this.callGraph.get(node) || new Set();
      
      targets.forEach(target => {
        const targetDepth = dfs(target, depth + 1);
        localMax = Math.max(localMax, targetDepth);
      });

      recursionStack.delete(node);
      return localMax;
    };

    this.callGraph.forEach((_, node) => {
      const depth = dfs(node, 1);
      maxDepth = Math.max(maxDepth, depth);
    });

    return maxDepth;
  }

  private detectCycles(): number {
    let cycleCount = 0;
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      if (recursionStack.has(node)) {
        cycleCount++;
        return true;
      }
      if (visited.has(node)) return false;

      visited.add(node);
      recursionStack.add(node);

      const targets = this.callGraph.get(node) || new Set();
      const targetArray = Array.from(targets);
      for (const target of targetArray) {
        if (hasCycle(target)) {
          recursionStack.delete(node);
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    this.callGraph.forEach((_, node) => {
      if (!visited.has(node)) {
        hasCycle(node);
      }
    });

    return cycleCount;
  }
}
