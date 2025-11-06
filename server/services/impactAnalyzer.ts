interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

interface FunctionInfo {
  name: string;
  file: string;
  body: string;
}

interface ImpactNode {
  id: string;
  label: string;
  type: 'function' | 'source' | 'impacted';
  impactLevel: 'direct' | 'indirect';
  distance: number;
}

interface ImpactEdge {
  source: string;
  target: string;
  type: 'calls' | 'called-by';
}

export interface ImpactAnalysisResult {
  nodes: ImpactNode[];
  edges: ImpactEdge[];
  stats: {
    totalImpacted: number;
    directUpstream: number;
    directDownstream: number;
    maxDepth: number;
    criticalFunctions: string[];
  };
}

export class ImpactAnalyzer {
  private functionCallMap: Map<string, Set<string>> = new Map();
  private functionCalledByMap: Map<string, Set<string>> = new Map();
  private functions: Map<string, FunctionInfo> = new Map();

  analyze(files: ProjectFile[], fieldName?: string): ImpactAnalysisResult {
    const parsedFiles = this.extractFunctions(files);
    this.buildCallMaps(parsedFiles);

    const nodes: ImpactNode[] = [];
    const edges: ImpactEdge[] = [];
    const functionImpactScores: Map<string, number> = new Map();

    // Build nodes for all functions
    for (const file of parsedFiles) {
      for (const func of file.functions) {
        const funcId = `${file.fileName}::${func.name}`;
        
        // Calculate impact score (how many functions would be affected)
        const upstreamCount = this.functionCalledByMap.get(funcId)?.size || 0;
        const downstreamCount = this.functionCallMap.get(funcId)?.size || 0;
        const totalImpact = upstreamCount + downstreamCount;
        
        functionImpactScores.set(funcId, totalImpact);

        nodes.push({
          id: funcId,
          label: func.name,
          type: 'function',
          impactLevel: 'direct',
          distance: 0
        });
      }
    }

    // Build edges from call relationships
    this.functionCallMap.forEach((targets, source) => {
      targets.forEach(target => {
        edges.push({
          source,
          target,
          type: 'calls'
        });
      });
    });

    // Find critical functions (top 10% by impact score)
    const sortedByImpact = Array.from(functionImpactScores.entries())
      .sort((a, b) => b[1] - a[1]);
    const criticalCount = Math.max(5, Math.floor(sortedByImpact.length * 0.1));
    const criticalFunctions = sortedByImpact
      .slice(0, criticalCount)
      .map(([funcId]) => funcId);

    // Calculate max depth
    const maxDepth = this.calculateMaxDepth();

    // Calculate statistics
    const allUpstream = new Set<string>();
    const allDownstream = new Set<string>();
    
    this.functionCalledByMap.forEach((callers) => {
      callers.forEach(caller => allUpstream.add(caller));
    });
    
    this.functionCallMap.forEach((callees) => {
      callees.forEach(callee => allDownstream.add(callee));
    });

    return {
      nodes,
      edges,
      stats: {
        totalImpacted: nodes.length,
        directUpstream: allUpstream.size,
        directDownstream: allDownstream.size,
        maxDepth,
        criticalFunctions
      }
    };
  }

  private buildCallMaps(parsedFiles: Array<{ fileName: string; functions: FunctionInfo[] }>) {
    this.functionCallMap.clear();
    this.functionCalledByMap.clear();

    // Build function call relationships
    for (const file of parsedFiles) {
      for (const func of file.functions) {
        const funcId = `${file.fileName}::${func.name}`;
        
        if (!this.functionCallMap.has(funcId)) {
          this.functionCallMap.set(funcId, new Set());
        }

        // Parse function body for calls
        const calls = this.extractFunctionCalls(func.body, parsedFiles);
        calls.forEach(calledFunc => {
          this.functionCallMap.get(funcId)!.add(calledFunc);
          
          // Build reverse map
          if (!this.functionCalledByMap.has(calledFunc)) {
            this.functionCalledByMap.set(calledFunc, new Set());
          }
          this.functionCalledByMap.get(calledFunc)!.add(funcId);
        });
      }
    }
  }

  private extractFunctionCalls(functionBody: string, parsedFiles: Array<{ fileName: string; functions: FunctionInfo[] }>): string[] {
    const calls: string[] = [];
    const functionsByName = new Map<string, string[]>();

    // Build a map of function names to their full IDs (can have multiple per name)
    for (const file of parsedFiles) {
      for (const func of file.functions) {
        if (!functionsByName.has(func.name)) {
          functionsByName.set(func.name, []);
        }
        functionsByName.get(func.name)!.push(`${file.fileName}::${func.name}`);
      }
    }

    // Look for function calls in the body
    functionsByName.forEach((fullIds, funcName) => {
      const callPattern = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
      if (callPattern.test(functionBody)) {
        // Only create edges for unambiguous function names
        // (names that appear exactly once in the entire project)
        // This prevents spurious edges between unrelated functions with duplicate names
        if (fullIds.length === 1) {
          calls.push(fullIds[0]);
        }
        // For ambiguous names (multiple functions with same name), skip them
        // to avoid creating incorrect cross-file dependencies
        // A full implementation would use import/package analysis to disambiguate
      }
    });

    return calls;
  }

  private calculateMaxDepth(): number {
    let maxDepth = 0;

    // Use BFS to find maximum depth from any node
    this.functionCallMap.forEach((_, startNode) => {
      const depth = this.bfsDepth(startNode);
      maxDepth = Math.max(maxDepth, depth);
    });

    return maxDepth;
  }

  private bfsDepth(startNode: string): number {
    const visited = new Set<string>();
    const queue: Array<{ node: string; depth: number }> = [{ node: startNode, depth: 0 }];
    let maxDepth = 0;

    while (queue.length > 0) {
      const { node, depth } = queue.shift()!;
      
      if (visited.has(node)) continue;
      visited.add(node);
      maxDepth = Math.max(maxDepth, depth);

      const callees = this.functionCallMap.get(node);
      if (callees) {
        callees.forEach(callee => {
          if (!visited.has(callee)) {
            queue.push({ node: callee, depth: depth + 1 });
          }
        });
      }
    }

    return maxDepth;
  }

  // Get impact for a specific function
  getImpactForFunction(functionId: string): {
    upstream: string[];
    downstream: string[];
    allImpacted: string[];
  } {
    const upstream = this.getTransitiveCallers(functionId);
    const downstream = this.getTransitiveCallees(functionId);
    const allImpacted = Array.from(new Set([...upstream, ...downstream]));

    return { upstream, downstream, allImpacted };
  }

  private extractFunctions(files: ProjectFile[]): Array<{ fileName: string; functions: FunctionInfo[] }> {
    this.functions.clear();
    const result: Array<{ fileName: string; functions: FunctionInfo[] }> = [];

    for (const file of files) {
      const fileFunctions: FunctionInfo[] = [];

      if (file.language === 'java') {
        const javaFunctions = this.extractJavaFunctions(file.content, file.path);
        fileFunctions.push(...javaFunctions);
      } else if (file.language === 'javascript' || file.language === 'typescript') {
        const jsFunctions = this.extractJSFunctions(file.content, file.path);
        fileFunctions.push(...jsFunctions);
      } else if (file.language === 'python') {
        const pyFunctions = this.extractPythonFunctions(file.content, file.path);
        fileFunctions.push(...pyFunctions);
      }

      result.push({ fileName: file.path, functions: fileFunctions });
      
      // Store in map for easy access
      fileFunctions.forEach(func => {
        this.functions.set(`${file.path}::${func.name}`, func);
      });
    }

    return result;
  }

  private extractJavaFunctions(content: string, filePath: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    const methodPattern = /(?:public|private|protected)?\s+(?:static\s+)?(?:final\s+)?[\w<>\[\]]+\s+(\w+)\s*\([^)]*\)\s*(?:throws\s+[\w,\s]+)?\s*\{/g;
    
    let match;
    while ((match = methodPattern.exec(content)) !== null) {
      const methodName = match[1];
      const startIndex = match.index;
      const body = this.extractMethodBody(content, startIndex);
      
      functions.push({
        name: methodName,
        file: filePath,
        body
      });
    }

    return functions;
  }

  private extractJSFunctions(content: string, filePath: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    
    // Function declarations
    const funcPattern = /function\s+(\w+)\s*\([^)]*\)\s*\{/g;
    let match;
    while ((match = funcPattern.exec(content)) !== null) {
      const funcName = match[1];
      const startIndex = match.index;
      const body = this.extractMethodBody(content, startIndex);
      
      functions.push({
        name: funcName,
        file: filePath,
        body
      });
    }

    // Arrow functions and method definitions
    const arrowPattern = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g;
    while ((match = arrowPattern.exec(content)) !== null) {
      const funcName = match[1];
      const startIndex = match.index;
      const body = content.substring(startIndex, Math.min(startIndex + 500, content.length));
      
      functions.push({
        name: funcName,
        file: filePath,
        body
      });
    }

    return functions;
  }

  private extractPythonFunctions(content: string, filePath: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    const funcPattern = /def\s+(\w+)\s*\([^)]*\):/g;
    
    let match;
    while ((match = funcPattern.exec(content)) !== null) {
      const funcName = match[1];
      const startIndex = match.index;
      const body = this.extractPythonMethodBody(content, startIndex);
      
      functions.push({
        name: funcName,
        file: filePath,
        body
      });
    }

    return functions;
  }

  private extractMethodBody(content: string, startIndex: number): string {
    let braceCount = 0;
    let inBody = false;
    let endIndex = startIndex;

    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        inBody = true;
      } else if (content[i] === '}') {
        braceCount--;
        if (inBody && braceCount === 0) {
          endIndex = i;
          break;
        }
      }
    }

    return content.substring(startIndex, endIndex + 1);
  }

  private extractPythonMethodBody(content: string, startIndex: number): string {
    const lines = content.substring(startIndex).split('\n');
    let bodyLines = [lines[0]];
    
    if (lines.length > 1) {
      const indent = lines[1].match(/^\s*/)?.[0].length || 0;
      
      for (let i = 1; i < lines.length; i++) {
        const currentIndent = lines[i].match(/^\s*/)?.[0].length || 0;
        if (lines[i].trim() === '') continue;
        if (currentIndent <= indent && lines[i].trim().length > 0) break;
        bodyLines.push(lines[i]);
      }
    }

    return bodyLines.join('\n');
  }

  private getTransitiveCallers(functionId: string): string[] {
    const callers = new Set<string>();
    const visited = new Set<string>();
    const queue = [functionId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const directCallers = this.functionCalledByMap.get(current);
      if (directCallers) {
        directCallers.forEach(caller => {
          callers.add(caller);
          if (!visited.has(caller)) {
            queue.push(caller);
          }
        });
      }
    }

    return Array.from(callers);
  }

  private getTransitiveCallees(functionId: string): string[] {
    const callees = new Set<string>();
    const visited = new Set<string>();
    const queue = [functionId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const directCallees = this.functionCallMap.get(current);
      if (directCallees) {
        directCallees.forEach(callee => {
          callees.add(callee);
          if (!visited.has(callee)) {
            queue.push(callee);
          }
        });
      }
    }

    return Array.from(callees);
  }
}
