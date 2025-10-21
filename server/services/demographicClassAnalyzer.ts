/**
 * Demographic Class Analyzer
 * 
 * Analyzes classes containing demographic fields and extracts member functions
 * that use those fields, including function descriptions
 */

export interface FunctionInfo {
  name: string;
  description: string;
  lineNumber: number;
  usedDemographicFields: string[];
  signature: string;
}

export interface ClassInfo {
  fileName: string;
  className: string;
  demographicFields: Array<{
    fieldName: string;
    fieldType: string;
    lineNumber: number;
  }>;
  functions: FunctionInfo[];
}

export interface DemographicClassReport {
  summary: {
    totalClasses: number;
    totalFunctions: number;
    scanDate: string;
  };
  classes: ClassInfo[];
}

export class DemographicClassAnalyzer {
  /**
   * Check if a file is a test file
   */
  private isTestFile(filePath: string): boolean {
    const lowerPath = filePath.toLowerCase();
    return (
      lowerPath.includes('/test/') ||
      lowerPath.includes('/tests/') ||
      lowerPath.includes('\\test\\') ||
      lowerPath.includes('\\tests\\') ||
      lowerPath.endsWith('test.java') ||
      lowerPath.endsWith('test.py') ||
      lowerPath.endsWith('test.ts') ||
      lowerPath.endsWith('test.js') ||
      lowerPath.endsWith('test.kt') ||
      lowerPath.endsWith('test.cs') ||
      lowerPath.endsWith('tests.java') ||
      lowerPath.endsWith('tests.py') ||
      lowerPath.endsWith('tests.ts') ||
      lowerPath.endsWith('tests.js') ||
      lowerPath.endsWith('tests.kt') ||
      lowerPath.endsWith('tests.cs') ||
      lowerPath.includes('spec.') ||
      lowerPath.includes('.spec') ||
      lowerPath.includes('mock') ||
      lowerPath.includes('stub')
    );
  }

  /**
   * Analyze demographic scan results and extract class/function information
   */
  async analyzeClasses(
    scanResults: { [fieldName: string]: Array<{ file: string; line: number; fieldType: string; context: string }> },
    sourceFiles: Array<{ path: string; content: string }>
  ): Promise<DemographicClassReport> {
    const classesMap = new Map<string, ClassInfo>();

    // Group scan results by file
    const fileResults = new Map<string, Array<{ fieldType: string; line: number; context: string }>>();
    
    Object.entries(scanResults).forEach(([fieldName, results]) => {
      results.forEach(result => {
        // Skip test files
        if (this.isTestFile(result.file)) {
          return;
        }

        if (!fileResults.has(result.file)) {
          fileResults.set(result.file, []);
        }
        fileResults.get(result.file)!.push({
          fieldType: result.fieldType,
          line: result.line,
          context: result.context
        });
      });
    });

    // Analyze each file with demographic fields
    const fileResultsArray = Array.from(fileResults.entries());
    for (const [filePath, demographicMatches] of fileResultsArray) {
      const sourceFile = sourceFiles.find(sf => sf.path === filePath);
      if (!sourceFile) continue;

      const classInfo = this.analyzeFile(filePath, sourceFile.content, demographicMatches);
      if (classInfo && classInfo.functions.length > 0) {
        classesMap.set(filePath, classInfo);
      }
    }

    const classes = Array.from(classesMap.values());
    const totalFunctions = classes.reduce((sum, cls) => sum + cls.functions.length, 0);

    return {
      summary: {
        totalClasses: classes.length,
        totalFunctions,
        scanDate: new Date().toISOString()
      },
      classes
    };
  }

  /**
   * Analyze a single file to extract class and function information
   */
  private analyzeFile(
    filePath: string,
    content: string,
    demographicMatches: Array<{ fieldType: string; line: number; context: string }>
  ): ClassInfo | null {
    const lines = content.split('\n');
    const className = this.extractClassName(filePath, content);
    
    // Extract demographic field names from the matches
    const demographicFieldNames = this.extractFieldNames(demographicMatches, content);
    
    // Analyze functions in this file
    const functions = this.extractFunctions(content, demographicFieldNames);

    if (functions.length === 0) {
      return null;
    }

    return {
      fileName: filePath,
      className: className || this.getFileNameWithoutExtension(filePath),
      demographicFields: demographicMatches.map(m => ({
        fieldName: this.extractFieldNameFromContext(m.context),
        fieldType: m.fieldType,
        lineNumber: m.line
      })),
      functions
    };
  }

  /**
   * Extract class name from file content
   */
  private extractClassName(filePath: string, content: string): string | null {
    // Java class pattern
    const javaMatch = content.match(/(?:public|private|protected)?\s*class\s+(\w+)/);
    if (javaMatch) return javaMatch[1];

    // Python class pattern
    const pythonMatch = content.match(/class\s+(\w+)/);
    if (pythonMatch) return pythonMatch[1];

    // TypeScript/JavaScript class pattern
    const tsMatch = content.match(/(?:export\s+)?class\s+(\w+)/);
    if (tsMatch) return tsMatch[1];

    // C# class pattern
    const csMatch = content.match(/(?:public|private|protected|internal)?\s*class\s+(\w+)/);
    if (csMatch) return csMatch[1];

    // Kotlin class pattern
    const ktMatch = content.match(/(?:data\s+)?class\s+(\w+)/);
    if (ktMatch) return ktMatch[1];

    return null;
  }

  /**
   * Extract field names from demographic matches
   */
  private extractFieldNames(
    matches: Array<{ context: string }>,
    content: string
  ): string[] {
    const fieldNames = new Set<string>();
    
    matches.forEach(match => {
      const fieldName = this.extractFieldNameFromContext(match.context);
      if (fieldName) {
        fieldNames.add(fieldName);
      }
    });

    return Array.from(fieldNames);
  }

  /**
   * Extract field name from context line
   */
  private extractFieldNameFromContext(context: string): string {
    // Try to extract variable/field name from common patterns
    // Java: private String firstName;
    const javaMatch = context.match(/(?:private|public|protected)\s+\w+\s+(\w+)\s*[;=]/);
    if (javaMatch) return javaMatch[1];

    // Python: self.first_name = ...
    const pythonMatch = context.match(/self\.(\w+)\s*=/);
    if (pythonMatch) return pythonMatch[1];

    // General variable assignment
    const varMatch = context.match(/(\w+)\s*[:=]/);
    if (varMatch) return varMatch[1];

    // Fallback: extract any identifier-looking word
    const wordMatch = context.match(/\b([a-z_][a-zA-Z0-9_]*)\b/);
    return wordMatch ? wordMatch[1] : 'unknown';
  }

  /**
   * Extract functions/methods that use demographic fields
   */
  private extractFunctions(content: string, demographicFieldNames: string[]): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const functionInfo = this.parseFunctionDeclaration(line, i + 1);
      
      if (functionInfo) {
        // Get function body
        const functionBody = this.extractFunctionBody(lines, i);
        
        // Check if function uses any demographic fields
        const usedFields = this.findUsedDemographicFields(functionBody, demographicFieldNames);
        
        if (usedFields.length > 0) {
          // Extract function description from comments above
          const description = this.extractFunctionDescription(lines, i);
          
          functions.push({
            name: functionInfo.name,
            description: description || 'No description available',
            lineNumber: i + 1,
            usedDemographicFields: usedFields,
            signature: functionInfo.signature
          });
        }
      }
    }

    return functions;
  }

  /**
   * Parse function declaration from a line
   */
  private parseFunctionDeclaration(line: string, lineNumber: number): { name: string; signature: string } | null {
    // Java method pattern
    const javaMatch = line.match(/(?:public|private|protected|static|\s)+[\w<>\[\],\s]+\s+(\w+)\s*\([^)]*\)/);
    if (javaMatch) {
      return {
        name: javaMatch[1],
        signature: line.trim()
      };
    }

    // Python method pattern (def)
    const pythonMatch = line.match(/def\s+(\w+)\s*\([^)]*\):/);
    if (pythonMatch) {
      return {
        name: pythonMatch[1],
        signature: line.trim()
      };
    }

    // JavaScript/TypeScript function pattern
    const jsMatch = line.match(/(?:async\s+)?(?:function\s+)?(\w+)\s*(?:<[^>]*>)?\s*\([^)]*\)\s*(?::\s*[\w<>\[\]]+)?/);
    if (jsMatch && (line.includes('function') || line.match(/^\s*(?:async\s+)?(\w+)\s*\(/))) {
      return {
        name: jsMatch[1],
        signature: line.trim()
      };
    }

    // C# method pattern
    const csMatch = line.match(/(?:public|private|protected|internal|static|\s)+[\w<>\[\],\s]+\s+(\w+)\s*\([^)]*\)/);
    if (csMatch) {
      return {
        name: csMatch[1],
        signature: line.trim()
      };
    }

    // Kotlin function pattern
    const ktMatch = line.match(/fun\s+(\w+)\s*\([^)]*\)/);
    if (ktMatch) {
      return {
        name: ktMatch[1],
        signature: line.trim()
      };
    }

    return null;
  }

  /**
   * Extract function body (limited to next 50 lines or until closing brace)
   */
  private extractFunctionBody(lines: string[], startIndex: number): string {
    const maxLines = 50;
    let braceCount = 0;
    let started = false;
    const bodyLines: string[] = [];

    for (let i = startIndex; i < Math.min(startIndex + maxLines, lines.length); i++) {
      const line = lines[i];
      bodyLines.push(line);

      // Count braces to find function end
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          started = true;
        } else if (char === '}') {
          braceCount--;
          if (started && braceCount === 0) {
            return bodyLines.join('\n');
          }
        }
      }

      // For Python, check for decreased indentation
      if (line.match(/def\s+\w+/)) {
        const indentMatch = line.match(/^(\s*)/);
        const baseIndent = indentMatch ? indentMatch[1].length : 0;
        
        for (let j = i + 1; j < Math.min(i + maxLines, lines.length); j++) {
          const nextLine = lines[j];
          if (nextLine.trim() === '') continue;
          
          const nextIndentMatch = nextLine.match(/^(\s*)/);
          const nextIndent = nextIndentMatch ? nextIndentMatch[1].length : 0;
          
          if (nextIndent <= baseIndent && nextLine.trim().length > 0) {
            return lines.slice(i, j).join('\n');
          }
          bodyLines.push(nextLine);
        }
      }
    }

    return bodyLines.join('\n');
  }

  /**
   * Find which demographic fields are used in function body
   */
  private findUsedDemographicFields(functionBody: string, demographicFieldNames: string[]): string[] {
    const usedFields: string[] = [];

    demographicFieldNames.forEach(fieldName => {
      // Create pattern to match field usage
      const pattern = new RegExp(`\\b${this.escapeRegExp(fieldName)}\\b`, 'i');
      if (pattern.test(functionBody)) {
        usedFields.push(fieldName);
      }
    });

    return usedFields;
  }

  /**
   * Extract function description from comments above function
   */
  private extractFunctionDescription(lines: string[], functionIndex: number): string {
    const descriptionLines: string[] = [];
    
    // Look backwards for comments
    for (let i = functionIndex - 1; i >= 0 && i >= functionIndex - 10; i--) {
      const line = lines[i].trim();
      
      // Stop if we hit another function or class declaration
      if (line.match(/(?:class|def|function|public|private|protected)\s+\w+/) && i !== functionIndex) {
        break;
      }

      // JavaDoc style /** ... */
      if (line.includes('*/')) {
        for (let j = i; j >= 0; j--) {
          const commentLine = lines[j].trim();
          descriptionLines.unshift(commentLine);
          if (commentLine.includes('/**')) {
            break;
          }
        }
        break;
      }

      // Single line comments // or #
      if (line.startsWith('//') || line.startsWith('#')) {
        const cleanedComment = line.replace(/^(\/\/|#)\s*/, '');
        if (cleanedComment.length > 0) {
          descriptionLines.unshift(cleanedComment);
        }
      } else if (line.length === 0) {
        // Empty line, continue
        continue;
      } else {
        // Non-comment line, stop
        break;
      }
    }

    if (descriptionLines.length > 0) {
      // Clean up JavaDoc comments
      const cleaned = descriptionLines
        .join(' ')
        .replace(/\/\*\*|\*\/|\*/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      return cleaned;
    }

    return '';
  }

  /**
   * Get filename without extension
   */
  private getFileNameWithoutExtension(filePath: string): string {
    const fileName = filePath.split(/[/\\]/).pop() || filePath;
    return fileName.replace(/\.[^.]+$/, '');
  }

  /**
   * Escape special regex characters
   */
  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export const demographicClassAnalyzer = new DemographicClassAnalyzer();
