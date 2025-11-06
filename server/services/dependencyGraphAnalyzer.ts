interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

interface FunctionInfo {
  name: string;
  file: string;
  body: string;
  complexity?: number;
}

interface DependencyNode {
  id: string;
  label: string;
  type: 'class' | 'function' | 'file';
  complexity: number;
  inDegree: number;
  outDegree: number;
}

interface DependencyEdge {
  source: string;
  target: string;
  type: 'calls' | 'contains' | 'imports';
  weight: number;
}

export interface DependencyGraphResult {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  stats: {
    totalFiles: number;
    totalFunctions: number;
    totalDependencies: number;
    avgComplexity: number;
    cyclicDependencies: number;
    isolatedComponents: number;
  };
}

export class DependencyGraphAnalyzer {
  private functions: Map<string, FunctionInfo> = new Map();

  analyze(files: ProjectFile[], fieldName?: string): DependencyGraphResult {
    const parsedFiles = this.extractFunctions(files);
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];
    const functionCallCounts = new Map<string, number>();
    const inDegreeMap = new Map<string, number>();
    const outDegreeMap = new Map<string, number>();

    // Create file nodes and function nodes
    for (const file of parsedFiles) {
      const fileId = `file::${file.fileName}`;
      
      // Add file node
      nodes.push({
        id: fileId,
        label: file.fileName,
        type: 'file',
        complexity: file.functions.length,
        inDegree: 0,
        outDegree: 0
      });

      // Add function nodes
      for (const func of file.functions) {
        const funcId = `${file.fileName}::${func.name}`;
        
        nodes.push({
          id: funcId,
          label: func.name,
          type: 'function',
          complexity: func.complexity || 0,
          inDegree: 0,
          outDegree: 0
        });

        // Add containment edge
        edges.push({
          source: fileId,
          target: funcId,
          type: 'contains',
          weight: 1
        });
      }
    }

    // Build function call relationships
    for (const file of parsedFiles) {
      for (const func of file.functions) {
        const funcId = `${file.fileName}::${func.name}`;
        
        // Extract function calls
        const calls = this.extractFunctionCalls(func.body, parsedFiles);
        calls.forEach(calledFunc => {
          // Add call edge
          edges.push({
            source: funcId,
            target: calledFunc,
            type: 'calls',
            weight: 1
          });

          // Track call counts
          functionCallCounts.set(calledFunc, (functionCallCounts.get(calledFunc) || 0) + 1);

          // Update in/out degrees
          outDegreeMap.set(funcId, (outDegreeMap.get(funcId) || 0) + 1);
          inDegreeMap.set(calledFunc, (inDegreeMap.get(calledFunc) || 0) + 1);
        });
      }
    }

    // Update node degrees
    nodes.forEach(node => {
      if (node.type === 'function') {
        node.inDegree = inDegreeMap.get(node.id) || 0;
        node.outDegree = outDegreeMap.get(node.id) || 0;
      }
    });

    // Detect file-level dependencies
    this.addFileDependencies(parsedFiles, edges, nodes);

    // Calculate statistics
    const totalComplexity = nodes
      .filter(n => n.type === 'function')
      .reduce((sum, n) => sum + n.complexity, 0);
    const functionCount = nodes.filter(n => n.type === 'function').length;
    const avgComplexity = functionCount > 0 ? totalComplexity / functionCount : 0;

    const cyclicDeps = this.detectCyclicDependencies(nodes, edges);
    const isolatedComponents = this.countIsolatedComponents(nodes, edges);

    return {
      nodes,
      edges,
      stats: {
        totalFiles: parsedFiles.length,
        totalFunctions: functionCount,
        totalDependencies: edges.filter(e => e.type === 'calls').length,
        avgComplexity: Math.round(avgComplexity * 10) / 10,
        cyclicDependencies: cyclicDeps,
        isolatedComponents
      }
    };
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

  private addFileDependencies(
    parsedFiles: Array<{ fileName: string; functions: FunctionInfo[]; content: string }>,
    edges: DependencyEdge[],
    nodes: DependencyNode[]
  ) {
    const fileDependencies = new Map<string, Set<string>>();

    // Analyze imports/includes in each file
    for (const file of parsedFiles) {
      const fileId = `file::${file.fileName}`;
      
      if (!fileDependencies.has(fileId)) {
        fileDependencies.set(fileId, new Set());
      }

      // Extract import statements
      const imports = this.extractImports(file.content);
      
      // Match imports to other files in the project
      for (const otherFile of parsedFiles) {
        if (otherFile.fileName !== file.fileName) {
          const otherFileBaseName = otherFile.fileName.split('/').pop()?.replace(/\.(java|py|js|ts)$/, '');
          
          if (otherFileBaseName && imports.some(imp => imp.includes(otherFileBaseName))) {
            const targetFileId = `file::${otherFile.fileName}`;
            fileDependencies.get(fileId)!.add(targetFileId);
          }
        }
      }
    }

    // Add file dependency edges
    fileDependencies.forEach((targets, source) => {
      targets.forEach(target => {
        edges.push({
          source,
          target,
          type: 'imports',
          weight: 1
        });
      });
    });
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    
    // Java imports
    const javaImports = content.match(/import\s+[\w.]+;/g) || [];
    imports.push(...javaImports.map(i => i.replace(/import\s+/, '').replace(';', '')));

    // Python imports
    const pythonImports = content.match(/(?:from\s+[\w.]+\s+)?import\s+[\w.,\s]+/g) || [];
    imports.push(...pythonImports.map(i => i.replace(/from\s+/, '').replace(/import\s+/, '')));

    // JavaScript/TypeScript imports
    const jsImports = content.match(/import\s+.*?\s+from\s+['"].*?['"]/g) || [];
    imports.push(...jsImports.map(i => i.replace(/.*from\s+['"]/, '').replace(/['"]/, '')));

    return imports;
  }

  private detectCyclicDependencies(nodes: DependencyNode[], edges: DependencyEdge[]): number {
    const graph = new Map<string, string[]>();
    
    // Build adjacency list for function calls only
    edges.forEach(edge => {
      if (edge.type === 'calls') {
        if (!graph.has(edge.source)) {
          graph.set(edge.source, []);
        }
        graph.get(edge.source)!.push(edge.target);
      }
    });

    let cyclicCount = 0;
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      visited.add(node);
      recStack.add(node);

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            return true;
          }
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(node);
      return false;
    };

    nodes.forEach(node => {
      if (node.type === 'function' && !visited.has(node.id)) {
        if (hasCycle(node.id)) {
          cyclicCount++;
        }
      }
    });

    return cyclicCount;
  }

  private countIsolatedComponents(nodes: DependencyNode[], edges: DependencyEdge[]): number {
    const graph = new Map<string, string[]>();
    const functionNodes = nodes.filter(n => n.type === 'function');

    // Build undirected graph
    edges.forEach(edge => {
      if (edge.type === 'calls') {
        if (!graph.has(edge.source)) graph.set(edge.source, []);
        if (!graph.has(edge.target)) graph.set(edge.target, []);
        
        graph.get(edge.source)!.push(edge.target);
        graph.get(edge.target)!.push(edge.source);
      }
    });

    const visited = new Set<string>();
    let componentCount = 0;

    const dfs = (node: string) => {
      visited.add(node);
      const neighbors = graph.get(node) || [];
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        }
      });
    };

    functionNodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id);
        componentCount++;
      }
    });

    return componentCount;
  }

  private extractFunctions(files: ProjectFile[]): Array<{ fileName: string; functions: FunctionInfo[]; content: string }> {
    this.functions.clear();
    const result: Array<{ fileName: string; functions: FunctionInfo[]; content: string }> = [];

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

      result.push({ fileName: file.path, functions: fileFunctions, content: file.content });
      
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
        body,
        complexity: this.calculateComplexity(body)
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
        body,
        complexity: this.calculateComplexity(body)
      });
    }

    // Arrow functions
    const arrowPattern = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g;
    while ((match = arrowPattern.exec(content)) !== null) {
      const funcName = match[1];
      const startIndex = match.index;
      const body = content.substring(startIndex, Math.min(startIndex + 500, content.length));
      
      functions.push({
        name: funcName,
        file: filePath,
        body,
        complexity: this.calculateComplexity(body)
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
        body,
        complexity: this.calculateComplexity(body)
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

  private calculateComplexity(body: string): number {
    let complexity = 1;
    const patterns = [/\bif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bcase\b/g, /\bcatch\b/g, /\b&&\b/g, /\b\|\|\b/g];
    
    for (const pattern of patterns) {
      const matches = body.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }
}
