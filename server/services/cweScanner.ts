import { CWERuleEngine } from './cweRuleEngine';
import { CWEVulnerabilityDetail, CWEScanResult, ISO25010Result } from '@shared/schema';

export interface ScanOptions {
  projectId: string;
  files: Array<{ path: string; content: string; language: string }>;
  scanType?: 'full' | 'quick' | 'custom';
}

export class CWEScanner {
  private ruleEngine: CWERuleEngine;

  constructor() {
    this.ruleEngine = new CWERuleEngine();
  }

  async scanProject(options: ScanOptions): Promise<{
    vulnerabilities: CWEVulnerabilityDetail[];
    summary: {
      totalFiles: number;
      scannedFiles: number;
      totalVulnerabilities: number;
      criticalCount: number;
      highCount: number;
      mediumCount: number;
      lowCount: number;
      infoCount: number;
    };
  }> {
    const vulnerabilities: CWEVulnerabilityDetail[] = [];
    let scannedFiles = 0;

    for (const file of options.files) {
      try {
        const fileVulnerabilities = this.ruleEngine.scanFile(
          file.path,
          file.content,
          file.language
        );
        vulnerabilities.push(...fileVulnerabilities);
        scannedFiles++;
      } catch (error) {
        console.error(`Error scanning file ${file.path}:`, error);
      }
    }

    const summary = this.calculateSummary(vulnerabilities, options.files.length, scannedFiles);

    return {
      vulnerabilities,
      summary,
    };
  }

  private calculateSummary(
    vulnerabilities: CWEVulnerabilityDetail[],
    totalFiles: number,
    scannedFiles: number
  ) {
    const summary = {
      totalFiles,
      scannedFiles,
      totalVulnerabilities: vulnerabilities.length,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      infoCount: 0,
    };

    vulnerabilities.forEach((vuln) => {
      switch (vuln.severity) {
        case 'critical':
          summary.criticalCount++;
          break;
        case 'high':
          summary.highCount++;
          break;
        case 'medium':
          summary.mediumCount++;
          break;
        case 'low':
          summary.lowCount++;
          break;
        case 'info':
          summary.infoCount++;
          break;
      }
    });

    return summary;
  }

  calculateISO25010Quality(vulnerabilities: CWEVulnerabilityDetail[], fileCount: number): ISO25010Result {
    const criticalCount = vulnerabilities.filter((v) => v.severity === 'critical').length;
    const highCount = vulnerabilities.filter((v) => v.severity === 'high').length;
    const mediumCount = vulnerabilities.filter((v) => v.severity === 'medium').length;
    const lowCount = vulnerabilities.filter((v) => v.severity === 'low').length;

    const securityScore = this.calculateSecurityScore(
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      fileCount
    );

    const categoryScores = this.analyzeCategoryImpacts(vulnerabilities);

    const functionalSuitability = Math.max(0, 100 - (categoryScores.injection * 2 + categoryScores.auth * 3));
    const performanceEfficiency = Math.max(0, 100 - (categoryScores.dos * 5));
    const compatibility = Math.max(0, 100 - (categoryScores.deserialization * 3));
    const usability = Math.max(0, 100 - (categoryScores['information-disclosure'] * 2));
    const reliability = Math.max(0, 100 - (categoryScores.injection + categoryScores.dos) * 2);
    const security = securityScore;
    const maintainability = Math.max(0, 100 - (vulnerabilities.length / fileCount) * 10);
    const portability = Math.max(0, 100 - (categoryScores.cryptography * 2));

    const overallScore = Math.round(
      (functionalSuitability +
        performanceEfficiency +
        compatibility +
        usability +
        reliability +
        security +
        maintainability +
        portability) / 8
    );

    const securityGrade = this.calculateGrade(security);

    const recommendations = this.generateRecommendations(vulnerabilities, categoryScores);

    return {
      functionalSuitability: Math.round(functionalSuitability),
      performanceEfficiency: Math.round(performanceEfficiency),
      compatibility: Math.round(compatibility),
      usability: Math.round(usability),
      reliability: Math.round(reliability),
      security: Math.round(security),
      maintainability: Math.round(maintainability),
      portability: Math.round(portability),
      overallScore,
      securityGrade,
      recommendations,
    };
  }

  private calculateSecurityScore(
    critical: number,
    high: number,
    medium: number,
    low: number,
    fileCount: number
  ): number {
    const weightedVulnerabilities = critical * 10 + high * 5 + medium * 2 + low * 1;
    const maxScore = 100;
    const penalty = Math.min(maxScore, (weightedVulnerabilities / fileCount) * 20);
    return Math.max(0, maxScore - penalty);
  }

  private analyzeCategoryImpacts(vulnerabilities: CWEVulnerabilityDetail[]): Record<string, number> {
    const categories: Record<string, number> = {};

    vulnerabilities.forEach((vuln) => {
      const weight = this.getSeverityWeight(vuln.severity);
      categories[vuln.category] = (categories[vuln.category] || 0) + weight;
    });

    return categories;
  }

  private getSeverityWeight(severity: string): number {
    const weights: Record<string, number> = {
      critical: 10,
      high: 5,
      medium: 2,
      low: 1,
      info: 0.5,
    };
    return weights[severity] || 1;
  }

  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private generateRecommendations(
    vulnerabilities: CWEVulnerabilityDetail[],
    categoryScores: Record<string, number>
  ): string[] {
    const recommendations: string[] = [];

    const topCategories = Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat]) => cat);

    const categoryRecommendations: Record<string, string> = {
      injection: 'Implement parameterized queries and input validation to prevent injection attacks',
      xss: 'Use output encoding and Content Security Policy to prevent Cross-Site Scripting',
      authentication: 'Strengthen authentication mechanisms and protect credentials',
      cryptography: 'Use strong encryption algorithms (AES-256, SHA-256) and proper key management',
      deserialization: 'Avoid deserializing untrusted data; use safe serialization formats like JSON',
      'path-traversal': 'Validate and sanitize file paths against allowlists',
      ssrf: 'Validate and restrict URLs for server-side requests',
      xxe: 'Disable XML external entity processing in all XML parsers',
      permissions: 'Set appropriate file and directory permissions',
      dos: 'Implement rate limiting and input validation to prevent denial of service',
      redirect: 'Validate redirect URLs against an allowlist',
      'information-disclosure': 'Use generic error messages and secure logging practices',
    };

    topCategories.forEach((category) => {
      if (categoryRecommendations[category]) {
        recommendations.push(categoryRecommendations[category]);
      }
    });

    const criticalVulns = vulnerabilities.filter((v) => v.severity === 'critical');
    if (criticalVulns.length > 0) {
      recommendations.unshift(
        `Address ${criticalVulns.length} critical vulnerabilities immediately - these pose severe security risks`
      );
    }

    const highVulns = vulnerabilities.filter((v) => v.severity === 'high');
    if (highVulns.length > 5) {
      recommendations.push(
        `Prioritize fixing ${highVulns.length} high-severity vulnerabilities to improve security posture`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('No major security issues detected - maintain current security practices');
      recommendations.push('Consider implementing additional security controls like SAST/DAST in CI/CD');
      recommendations.push('Regularly update dependencies and review security advisories');
    }

    return recommendations.slice(0, 10);
  }

  getSupportedLanguages(): string[] {
    return this.ruleEngine.getSupportedLanguages();
  }

  getAllRules() {
    return this.ruleEngine.getAllRules();
  }
}

export const cweScanner = new CWEScanner();
