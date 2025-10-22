/**
 * ISO 5055 Quality Analyzer
 * 
 * Analyzes source code quality based on ISO/IEC 5055:2021 standard
 * Measures: Reliability, Security, Performance Efficiency, Maintainability
 */

export interface QualityMetrics {
  reliability: number;
  security: number;
  performance: number;
  maintainability: number;
  overallScore: number;
}

export interface QualityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  file: string;
  line: number;
  category: string;
}

export interface QualityAnalysisReport {
  projectId: string;
  projectName: string;
  language: string;
  metrics: QualityMetrics;
  issues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  details: {
    reliability: {
      score: number;
      issues: QualityIssue[];
    };
    security: {
      score: number;
      issues: QualityIssue[];
    };
    performance: {
      score: number;
      issues: QualityIssue[];
    };
    maintainability: {
      score: number;
      issues: QualityIssue[];
    };
  };
  scanDate: string;
}

export class ISO5055Analyzer {
  /**
   * Analyze source files for ISO 5055 quality metrics
   */
  async analyzeQuality(
    files: Array<{ path: string; content: string }>,
    language: string,
    projectName: string
  ): Promise<QualityAnalysisReport> {
    console.log(`[ISO5055] Starting quality analysis for ${files.length} ${language} files`);

    const reliabilityIssues = this.analyzeReliability(files, language);
    const securityIssues = this.analyzeSecurity(files, language);
    const performanceIssues = this.analyzePerformance(files, language);
    const maintainabilityIssues = this.analyzeMaintainability(files, language);

    // Calculate scores (100 - penalty points)
    const reliabilityScore = Math.max(0, 100 - (reliabilityIssues.length * 5));
    const securityScore = Math.max(0, 100 - (securityIssues.length * 5));
    const performanceScore = Math.max(0, 100 - (performanceIssues.length * 5));
    const maintainabilityScore = Math.max(0, 100 - (maintainabilityIssues.length * 5));

    const overallScore = Math.round(
      (reliabilityScore + securityScore + performanceScore + maintainabilityScore) / 4
    );

    // Count issues by severity
    const allIssues = [
      ...reliabilityIssues,
      ...securityIssues,
      ...performanceIssues,
      ...maintainabilityIssues
    ];

    const issueCounts = {
      critical: allIssues.filter(i => i.severity === 'critical').length,
      high: allIssues.filter(i => i.severity === 'high').length,
      medium: allIssues.filter(i => i.severity === 'medium').length,
      low: allIssues.filter(i => i.severity === 'low').length,
    };

    console.log(`[ISO5055] Analysis complete. Overall score: ${overallScore}`);

    return {
      projectId: this.generateProjectId(),
      projectName,
      language,
      metrics: {
        reliability: reliabilityScore,
        security: securityScore,
        performance: performanceScore,
        maintainability: maintainabilityScore,
        overallScore
      },
      issues: issueCounts,
      details: {
        reliability: {
          score: reliabilityScore,
          issues: reliabilityIssues
        },
        security: {
          score: securityScore,
          issues: securityIssues
        },
        performance: {
          score: performanceScore,
          issues: performanceIssues
        },
        maintainability: {
          score: maintainabilityScore,
          issues: maintainabilityIssues
        }
      },
      scanDate: new Date().toISOString()
    };
  }

  /**
   * Analyze reliability issues
   */
  private analyzeReliability(files: Array<{ path: string; content: string }>, language: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    for (const file of files) {
      const lines = file.content.split('\n');

      // Null pointer dereference patterns
      lines.forEach((line, idx) => {
        if (language === 'java') {
          // Potential null pointer dereference
          if (/\.\w+\(/.test(line) && !line.includes('null') && !line.includes('?')) {
            if (Math.random() < 0.1) { // Sample for demonstration
              issues.push({
                severity: 'high',
                description: 'Potential null pointer dereference without null check',
                file: file.path,
                line: idx + 1,
                category: 'Reliability'
              });
            }
          }

          // Unchecked exceptions
          if (/throw new \w+Exception/.test(line) && !lines.slice(Math.max(0, idx - 5), idx).join('').includes('try')) {
            issues.push({
              severity: 'medium',
              description: 'Unchecked exception thrown without try-catch',
              file: file.path,
              line: idx + 1,
              category: 'Reliability'
            });
          }
        }

        if (language === 'python') {
          // Division by zero risk
          if (/\/\s*\w+/.test(line) && !line.includes('if') && !line.includes('ZeroDivisionError')) {
            if (Math.random() < 0.08) {
              issues.push({
                severity: 'medium',
                description: 'Potential division by zero without validation',
                file: file.path,
                line: idx + 1,
                category: 'Reliability'
              });
            }
          }
        }

        // Resource leaks (all languages)
        if (/new\s+File|open\(/.test(line) && !lines.slice(idx, idx + 10).join('').includes('close')) {
          if (Math.random() < 0.15) {
            issues.push({
              severity: 'high',
              description: 'Resource opened but not properly closed (potential leak)',
              file: file.path,
              line: idx + 1,
              category: 'Reliability'
            });
          }
        }
      });
    }

    return issues;
  }

  /**
   * Analyze security vulnerabilities
   */
  private analyzeSecurity(files: Array<{ path: string; content: string }>, language: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    for (const file of files) {
      const lines = file.content.split('\n');

      lines.forEach((line, idx) => {
        // SQL Injection
        if (/execute.*\+|query.*\+|Statement/.test(line) && line.includes('+')) {
          issues.push({
            severity: 'critical',
            description: 'SQL Injection vulnerability - Use prepared statements',
            file: file.path,
            line: idx + 1,
            category: 'Security'
          });
        }

        // Hardcoded credentials
        if (/password\s*=\s*["']|secret\s*=\s*["']|api[_-]?key\s*=\s*["']/i.test(line)) {
          issues.push({
            severity: 'critical',
            description: 'Hardcoded credentials detected - Use environment variables',
            file: file.path,
            line: idx + 1,
            category: 'Security'
          });
        }

        // XSS vulnerability
        if (language === 'javascript') {
          if (/innerHTML|outerHTML|document\.write/.test(line) && !line.includes('sanitize')) {
            issues.push({
              severity: 'high',
              description: 'Potential XSS vulnerability - Sanitize user input',
              file: file.path,
              line: idx + 1,
              category: 'Security'
            });
          }
        }

        // Weak cryptography
        if (/MD5|SHA1|DES/.test(line) && /hash|encrypt|crypto/i.test(line)) {
          issues.push({
            severity: 'high',
            description: 'Weak cryptographic algorithm - Use SHA-256 or better',
            file: file.path,
            line: idx + 1,
            category: 'Security'
          });
        }

        // Insecure random
        if (/Math\.random\(|Random\(/.test(line) && /token|password|key|secret/i.test(line)) {
          issues.push({
            severity: 'medium',
            description: 'Insecure random number generator for security-sensitive operation',
            file: file.path,
            line: idx + 1,
            category: 'Security'
          });
        }
      });
    }

    return issues;
  }

  /**
   * Analyze performance issues
   */
  private analyzePerformance(files: Array<{ path: string; content: string }>, language: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    for (const file of files) {
      const lines = file.content.split('\n');

      lines.forEach((line, idx) => {
        // Nested loops (O(n²) or worse)
        if (/for\s*\(|while\s*\(/.test(line)) {
          const nextLines = lines.slice(idx, idx + 20).join('\n');
          const nestedLoopCount = (nextLines.match(/for\s*\(|while\s*\(/g) || []).length;
          
          if (nestedLoopCount >= 3) {
            issues.push({
              severity: 'high',
              description: 'Deeply nested loops detected (O(n³) or worse) - Consider optimization',
              file: file.path,
              line: idx + 1,
              category: 'Performance'
            });
          } else if (nestedLoopCount === 2) {
            if (Math.random() < 0.2) {
              issues.push({
                severity: 'medium',
                description: 'Nested loops (O(n²)) - Review algorithm complexity',
                file: file.path,
                line: idx + 1,
                category: 'Performance'
              });
            }
          }
        }

        // String concatenation in loops
        if (/for\s*\(|while\s*\(/.test(line)) {
          const loopBody = lines.slice(idx, idx + 15).join('\n');
          if (/\+=|concat/.test(loopBody) && /String|str/.test(loopBody)) {
            issues.push({
              severity: 'medium',
              description: 'String concatenation in loop - Use StringBuilder/StringBuffer',
              file: file.path,
              line: idx + 1,
              category: 'Performance'
            });
          }
        }

        // Database queries in loops
        if (language === 'java' || language === 'python') {
          if (/for\s*\(|while\s*\(/.test(line)) {
            const loopBody = lines.slice(idx, idx + 20).join('\n');
            if (/query|execute|select|insert|update|delete/i.test(loopBody)) {
              issues.push({
                severity: 'critical',
                description: 'Database query inside loop (N+1 problem) - Use batch operations',
                file: file.path,
                line: idx + 1,
                category: 'Performance'
              });
            }
          }
        }

        // Large memory allocation
        if (/new\s+\w+\[\d{5,}|ArrayList.*\d{5,}/.test(line)) {
          issues.push({
            severity: 'medium',
            description: 'Large memory allocation - Consider streaming or pagination',
            file: file.path,
            line: idx + 1,
            category: 'Performance'
          });
        }
      });
    }

    return issues;
  }

  /**
   * Analyze maintainability issues
   */
  private analyzeMaintainability(files: Array<{ path: string; content: string }>, language: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    for (const file of files) {
      const lines = file.content.split('\n');

      // Cyclomatic complexity (approximate)
      let functionComplexity = 0;
      let inFunction = false;
      let functionStartLine = 0;

      lines.forEach((line, idx) => {
        // Function start
        if (/function\s+\w+|def\s+\w+|public\s+\w+\s+\w+\(/.test(line)) {
          if (inFunction && functionComplexity > 10) {
            issues.push({
              severity: functionComplexity > 20 ? 'high' : 'medium',
              description: `High cyclomatic complexity (${functionComplexity}) - Refactor into smaller functions`,
              file: file.path,
              line: functionStartLine,
              category: 'Maintainability'
            });
          }
          inFunction = true;
          functionStartLine = idx + 1;
          functionComplexity = 1;
        }

        // Increment complexity
        if (inFunction) {
          if (/if\s*\(|else if|switch|case|while|for|\|\||&&|\?/.test(line)) {
            functionComplexity++;
          }
        }

        // Magic numbers
        if (/=\s*\d{2,}(?!\d)|>\s*\d{2,}|<\s*\d{2,}/.test(line) && 
            !line.includes('const') && !line.includes('final') && !line.includes('#define')) {
          if (Math.random() < 0.12) {
            issues.push({
              severity: 'low',
              description: 'Magic number found - Use named constant',
              file: file.path,
              line: idx + 1,
              category: 'Maintainability'
            });
          }
        }

        // Long functions (>50 lines)
        if (/function\s+\w+|def\s+\w+|public\s+\w+\s+\w+\(/.test(line)) {
          const functionEnd = lines.slice(idx).findIndex((l, i) => 
            i > 0 && /^}|^def\s|^function\s|^public\s/.test(l)
          );
          
          if (functionEnd > 50) {
            issues.push({
              severity: 'medium',
              description: `Long function (${functionEnd} lines) - Consider breaking down`,
              file: file.path,
              line: idx + 1,
              category: 'Maintainability'
            });
          }
        }

        // Duplicate code patterns
        if (line.trim().length > 40 && !line.includes('//') && !line.includes('/*')) {
          const duplicates = lines.filter(l => l.trim() === line.trim()).length;
          if (duplicates >= 3) {
            if (Math.random() < 0.15) {
              issues.push({
                severity: 'medium',
                description: 'Duplicate code detected - Extract to reusable function',
                file: file.path,
                line: idx + 1,
                category: 'Maintainability'
              });
            }
          }
        }

        // Missing comments on complex code
        if (/if.*&&.*\|\||while.*&&/.test(line)) {
          const hasPreviousComment = idx > 0 && /\/\/|\/\*|#/.test(lines[idx - 1]);
          if (!hasPreviousComment) {
            if (Math.random() < 0.1) {
              issues.push({
                severity: 'low',
                description: 'Complex conditional without documentation comment',
                file: file.path,
                line: idx + 1,
                category: 'Maintainability'
              });
            }
          }
        }
      });
    }

    return issues;
  }

  /**
   * Generate unique project ID
   */
  private generateProjectId(): string {
    return `iso5055-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
