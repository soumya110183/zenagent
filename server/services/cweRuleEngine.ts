import { CWEVulnerabilityDetail } from "@shared/schema";

export interface CWERule {
  id: string;
  name: string;
  cweId: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  owasp?: string;
  description: string;
  recommendation: string;
  patterns: {
    regex: RegExp;
    context?: string;
  }[];
  languages: string[];
  confidence: 'high' | 'medium' | 'low';
}

export const CWE_RULES: CWERule[] = [
  {
    id: "cwe-89",
    name: "SQL Injection",
    cweId: "CWE-89",
    severity: "critical",
    category: "injection",
    owasp: "A03:2021 - Injection",
    description: "Improper neutralization of special elements used in an SQL Command",
    recommendation: "Use parameterized queries or prepared statements instead of string concatenation",
    patterns: [
      { regex: /executeQuery\s*\(\s*["\`].*?\+.*?["\`]\s*\)/gi, context: "Java/JDBC" },
      { regex: /createQuery\s*\(\s*["\`].*?\+.*?["\`]\s*\)/gi, context: "JPA" },
      { regex: /Statement\s*=.*?createStatement\(\)/gi, context: "JDBC Statement" },
      { regex: /execute\s*\(\s*["\`].*?%s.*?["\`].*?%/gi, context: "Python string formatting" },
      { regex: /execute\s*\(\s*["\`].*?\+.*?["\`]\s*\)/gi, context: "Python concatenation" },
      { regex: /\$conn->query\s*\(\s*["\`].*?\$.*?["\`]\s*\)/gi, context: "PHP" },
      { regex: /db\.query\s*\(\s*["\`].*?\+.*?["\`]\s*\)/gi, context: "Node.js" },
      { regex: /db\.exec\s*\(\s*f["\`].*?\{.*?\}.*?["\`]\s*\)/gi, context: "Python f-string" },
    ],
    languages: ["java", "python", "javascript", "typescript", "php", "csharp"],
    confidence: "high",
  },
  {
    id: "cwe-79",
    name: "Cross-Site Scripting (XSS)",
    cweId: "CWE-79",
    severity: "high",
    category: "xss",
    owasp: "A03:2021 - Injection",
    description: "Improper neutralization of input during web page generation",
    recommendation: "Sanitize user input and use context-aware output encoding",
    patterns: [
      { regex: /innerHTML\s*=\s*(?!['"`])/gi, context: "JavaScript DOM manipulation" },
      { regex: /document\.write\s*\(\s*(?!['"`])/gi, context: "JavaScript document.write" },
      { regex: /\.html\s*\(\s*(?!['"`])/gi, context: "jQuery HTML injection" },
      { regex: /dangerouslySetInnerHTML/gi, context: "React unsafe HTML" },
      { regex: /\$\{.*?req\.(query|params|body).*?\}/gi, context: "Template literal injection" },
      { regex: /response\.getWriter\(\)\.write\(.*?request\.getParameter/gi, context: "Java Servlet XSS" },
    ],
    languages: ["javascript", "typescript", "java", "html"],
    confidence: "high",
  },
  {
    id: "cwe-78",
    name: "OS Command Injection",
    cweId: "CWE-78",
    severity: "critical",
    category: "injection",
    owasp: "A03:2021 - Injection",
    description: "Improper neutralization of special elements used in an OS Command",
    recommendation: "Avoid using shell execution with user input. Use safe alternatives or strict input validation",
    patterns: [
      { regex: /Runtime\.getRuntime\(\)\.exec\s*\(\s*(?!['"`])/gi, context: "Java Runtime.exec" },
      { regex: /ProcessBuilder\s*\(.*?\+.*?\)/gi, context: "Java ProcessBuilder" },
      { regex: /exec\s*\(\s*(?!['"`])/gi, context: "Node.js exec" },
      { regex: /child_process\.(exec|spawn)\s*\(\s*["\`].*?\$\{/gi, context: "Node.js child_process" },
      { regex: /os\.system\s*\(\s*(?!['"`])/gi, context: "Python os.system" },
      { regex: /subprocess\.(call|Popen|run)\s*\(\s*["\`].*?\+/gi, context: "Python subprocess" },
      { regex: /shell_exec\s*\(\s*(?!['"`])/gi, context: "PHP shell_exec" },
    ],
    languages: ["java", "python", "javascript", "typescript", "php"],
    confidence: "high",
  },
  {
    id: "cwe-22",
    name: "Path Traversal",
    cweId: "CWE-22",
    severity: "high",
    category: "path-traversal",
    owasp: "A01:2021 - Broken Access Control",
    description: "Improper limitation of a pathname to a restricted directory",
    recommendation: "Validate and sanitize file paths. Use allowlists for file access",
    patterns: [
      { regex: /new\s+File\s*\(\s*(?!['"`])[^)]*\)/gi, context: "Java File creation" },
      { regex: /Files\.readAllBytes\s*\(\s*Paths\.get\s*\(\s*(?!['"`])/gi, context: "Java NIO" },
      { regex: /open\s*\(\s*(?!['"`])[^)]*\)/gi, context: "Python file open" },
      { regex: /readFile\s*\(\s*(?!['"`])/gi, context: "Node.js fs.readFile" },
      { regex: /file_get_contents\s*\(\s*\$_GET/gi, context: "PHP file_get_contents" },
      { regex: /\.\.\//g, context: "Directory traversal pattern" },
    ],
    languages: ["java", "python", "javascript", "typescript", "php"],
    confidence: "medium",
  },
  {
    id: "cwe-798",
    name: "Hard-coded Credentials",
    cweId: "CWE-798",
    severity: "critical",
    category: "authentication",
    owasp: "A07:2021 - Identification and Authentication Failures",
    description: "Use of hard-coded credentials",
    recommendation: "Use environment variables or secure secret management systems",
    patterns: [
      { regex: /password\s*=\s*["\`][^"\`]+["\`]/gi, context: "Hard-coded password" },
      { regex: /apiKey\s*=\s*["\`][^"\`]+["\`]/gi, context: "Hard-coded API key" },
      { regex: /secret\s*=\s*["\`][^"\`]+["\`]/gi, context: "Hard-coded secret" },
      { regex: /token\s*=\s*["\`][a-zA-Z0-9]{20,}["\`]/gi, context: "Hard-coded token" },
      { regex: /jdbc:.*:\/\/.*:.*@/gi, context: "JDBC URL with credentials" },
      { regex: /mongodb:\/\/[^:]+:[^@]+@/gi, context: "MongoDB connection string" },
    ],
    languages: ["java", "python", "javascript", "typescript", "php", "csharp"],
    confidence: "medium",
  },
  {
    id: "cwe-327",
    name: "Weak Cryptographic Algorithm",
    cweId: "CWE-327",
    severity: "high",
    category: "cryptography",
    owasp: "A02:2021 - Cryptographic Failures",
    description: "Use of a broken or risky cryptographic algorithm",
    recommendation: "Use strong cryptographic algorithms like AES-256, SHA-256, or better",
    patterns: [
      { regex: /MessageDigest\.getInstance\s*\(\s*["\`](MD5|SHA1?)["\`]\s*\)/gi, context: "Java weak hash" },
      { regex: /Cipher\.getInstance\s*\(\s*["\`]DES["\`]\s*\)/gi, context: "Java DES cipher" },
      { regex: /hashlib\.(md5|sha1)\s*\(/gi, context: "Python weak hash" },
      { regex: /crypto\.createHash\s*\(\s*["\`](md5|sha1)["\`]\s*\)/gi, context: "Node.js weak hash" },
      { regex: /md5\s*\(/gi, context: "MD5 usage" },
      { regex: /\bDES\b|\bRC4\b/gi, context: "Weak cipher" },
    ],
    languages: ["java", "python", "javascript", "typescript", "csharp"],
    confidence: "high",
  },
  {
    id: "cwe-502",
    name: "Deserialization of Untrusted Data",
    cweId: "CWE-502",
    severity: "critical",
    category: "deserialization",
    owasp: "A08:2021 - Software and Data Integrity Failures",
    description: "Unsafe deserialization of untrusted data",
    recommendation: "Avoid deserializing untrusted data. Use safe serialization formats like JSON",
    patterns: [
      { regex: /ObjectInputStream\s*\(\s*(?!new\s+ByteArrayInputStream\()/gi, context: "Java ObjectInputStream" },
      { regex: /readObject\s*\(\s*\)/gi, context: "Java readObject" },
      { regex: /pickle\.loads?\s*\(/gi, context: "Python pickle" },
      { regex: /eval\s*\(/gi, context: "JavaScript eval" },
      { regex: /unserialize\s*\(/gi, context: "PHP unserialize" },
      { regex: /yaml\.load\s*\(\s*(?!.*Loader=yaml\.SafeLoader)/gi, context: "Python unsafe YAML" },
    ],
    languages: ["java", "python", "javascript", "typescript", "php"],
    confidence: "high",
  },
  {
    id: "cwe-306",
    name: "Missing Authentication",
    cweId: "CWE-306",
    severity: "critical",
    category: "authentication",
    owasp: "A07:2021 - Identification and Authentication Failures",
    description: "Missing authentication for critical function",
    recommendation: "Implement proper authentication checks for sensitive operations",
    patterns: [
      { regex: /@(Delete|Post|Put)Mapping[^@]*(?!@PreAuthorize|@Secured)/gi, context: "Spring Boot unprotected endpoints" },
      { regex: /app\.(post|put|delete)\s*\(\s*["\`]\/api\/[^"\`]*["\`]\s*,\s*(?!.*authenticate)/gi, context: "Express unprotected routes" },
      { regex: /router\.(post|put|delete)\s*\(\s*["\`][^"\`]*["\`]\s*,\s*(?!.*auth)/gi, context: "Router without auth" },
    ],
    languages: ["java", "javascript", "typescript", "python"],
    confidence: "medium",
  },
  {
    id: "cwe-601",
    name: "Open Redirect",
    cweId: "CWE-601",
    severity: "medium",
    category: "redirect",
    owasp: "A01:2021 - Broken Access Control",
    description: "URL redirection to untrusted site",
    recommendation: "Validate redirect URLs against an allowlist",
    patterns: [
      { regex: /response\.sendRedirect\s*\(\s*request\.getParameter/gi, context: "Java Servlet redirect" },
      { regex: /window\.location\s*=\s*(?!['"`])/gi, context: "JavaScript redirect" },
      { regex: /res\.redirect\s*\(\s*req\.(query|params|body)/gi, context: "Express redirect" },
      { regex: /header\s*\(\s*["\`]Location["\`]\s*,\s*\$_GET/gi, context: "PHP header redirect" },
    ],
    languages: ["java", "javascript", "typescript", "php"],
    confidence: "medium",
  },
  {
    id: "cwe-326",
    name: "Inadequate Encryption Strength",
    cweId: "CWE-326",
    severity: "high",
    category: "cryptography",
    owasp: "A02:2021 - Cryptographic Failures",
    description: "Inadequate encryption strength",
    recommendation: "Use strong encryption with appropriate key sizes (AES-256, RSA-2048+)",
    patterns: [
      { regex: /KeyGenerator\.getInstance\s*\(\s*["\`]AES["\`]\s*\).*?init\s*\(\s*12[0-8]/gi, context: "Java weak AES key" },
      { regex: /KeyPairGenerator\.getInstance\s*\(\s*["\`]RSA["\`]\s*\).*?initialize\s*\(\s*102[0-4]/gi, context: "Java weak RSA key" },
      { regex: /cipher\s*=\s*AES\.new\s*\(.*?,.*?AES\.MODE_ECB/gi, context: "Python AES ECB mode" },
    ],
    languages: ["java", "python", "csharp"],
    confidence: "high",
  },
  {
    id: "cwe-918",
    name: "Server-Side Request Forgery (SSRF)",
    cweId: "CWE-918",
    severity: "high",
    category: "ssrf",
    owasp: "A10:2021 - Server-Side Request Forgery",
    description: "Server-side request forgery",
    recommendation: "Validate and sanitize URLs. Use allowlists for external requests",
    patterns: [
      { regex: /fetch\s*\(\s*(?!['"`])[^)]*req\.(query|params|body)/gi, context: "Node.js fetch SSRF" },
      { regex: /axios\.(get|post)\s*\(\s*(?!['"`])[^)]*req\./gi, context: "Axios SSRF" },
      { regex: /requests\.(get|post)\s*\(\s*(?!['"`])/gi, context: "Python requests SSRF" },
      { regex: /URL\s*\(\s*request\.getParameter/gi, context: "Java URL SSRF" },
    ],
    languages: ["javascript", "typescript", "python", "java"],
    confidence: "medium",
  },
  {
    id: "cwe-732",
    name: "Incorrect Permission Assignment",
    cweId: "CWE-732",
    severity: "medium",
    category: "permissions",
    owasp: "A01:2021 - Broken Access Control",
    description: "Incorrect permission assignment for critical resource",
    recommendation: "Set appropriate file and directory permissions",
    patterns: [
      { regex: /chmod\s*\(\s*["\`][^"\`]*["\`]\s*,\s*0?777\s*\)/gi, context: "Overly permissive chmod" },
      { regex: /setReadable\s*\(\s*true\s*,\s*false\s*\)/gi, context: "Java world-readable" },
      { regex: /setWritable\s*\(\s*true\s*,\s*false\s*\)/gi, context: "Java world-writable" },
    ],
    languages: ["python", "java", "php"],
    confidence: "medium",
  },
  {
    id: "cwe-611",
    name: "XML External Entity (XXE)",
    cweId: "CWE-611",
    severity: "high",
    category: "xxe",
    owasp: "A05:2021 - Security Misconfiguration",
    description: "Improper restriction of XML external entity reference",
    recommendation: "Disable external entity processing in XML parsers",
    patterns: [
      { regex: /DocumentBuilderFactory\.newInstance\(\)(?![\s\S]*setFeature.*?XMLConstants\.FEATURE_SECURE_PROCESSING)/gi, context: "Java unsafe XML parser" },
      { regex: /SAXParserFactory\.newInstance\(\)(?![\s\S]*setFeature.*?disallow-doctype-decl)/gi, context: "Java unsafe SAX parser" },
      { regex: /etree\.XMLParser\(\s*\)(?!.*resolve_entities\s*=\s*False)/gi, context: "Python lxml XXE" },
    ],
    languages: ["java", "python"],
    confidence: "high",
  },
  {
    id: "cwe-564",
    name: "SQL Injection via Hibernate",
    cweId: "CWE-564",
    severity: "critical",
    category: "injection",
    owasp: "A03:2021 - Injection",
    description: "SQL Injection via Hibernate",
    recommendation: "Use parameterized HQL/JPQL queries",
    patterns: [
      { regex: /session\.createQuery\s*\(\s*["\`].*?\+.*?["\`]\s*\)/gi, context: "Hibernate createQuery" },
      { regex: /entityManager\.createNativeQuery\s*\(\s*["\`].*?\+.*?["\`]\s*\)/gi, context: "JPA native query" },
    ],
    languages: ["java"],
    confidence: "high",
  },
  {
    id: "cwe-209",
    name: "Information Exposure Through Error Messages",
    cweId: "CWE-209",
    severity: "low",
    category: "information-disclosure",
    owasp: "A05:2021 - Security Misconfiguration",
    description: "Sensitive information in error messages",
    recommendation: "Use generic error messages for users. Log detailed errors securely",
    patterns: [
      { regex: /catch\s*\([^)]+\)\s*\{[^}]*(?:printStackTrace|e\.getMessage\(\))[^}]*\}/gi, context: "Exception details exposed" },
      { regex: /res\.(send|json)\s*\(\s*err/gi, context: "Node.js error exposure" },
    ],
    languages: ["java", "javascript", "typescript", "python"],
    confidence: "low",
  },
  {
    id: "cwe-400",
    name: "Regular Expression Denial of Service (ReDoS)",
    cweId: "CWE-400",
    severity: "medium",
    category: "dos",
    owasp: "A05:2021 - Security Misconfiguration",
    description: "Inefficient regular expression complexity",
    recommendation: "Avoid complex regex patterns with nested quantifiers",
    patterns: [
      { regex: /new\s+RegExp\s*\([^)]*(\*\+|\+\*|\{\d+,\}\+)/gi, context: "Potentially catastrophic regex" },
      { regex: /\/.*?(\(.*?\*.*?\)|\[.*?\*.*?\])\+.*?\//gi, context: "Nested quantifiers" },
    ],
    languages: ["javascript", "typescript", "python", "java"],
    confidence: "low",
  },
];

export class CWERuleEngine {
  private rules: CWERule[];

  constructor() {
    this.rules = CWE_RULES;
  }

  scanFile(filePath: string, content: string, language: string): CWEVulnerabilityDetail[] {
    const vulnerabilities: CWEVulnerabilityDetail[] = [];
    const lines = content.split('\n');
    const normalizedLanguage = this.normalizeLanguage(language);

    for (const rule of this.rules) {
      if (!rule.languages.includes(normalizedLanguage)) {
        continue;
      }

      for (const pattern of rule.patterns) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const matches = line.match(pattern.regex);

          if (matches) {
            const vulnerability: CWEVulnerabilityDetail = {
              id: `${rule.cweId}-${filePath}-${i + 1}`,
              cweId: rule.cweId,
              cweName: rule.name,
              severity: rule.severity,
              category: rule.category,
              filePath,
              lineNumber: i + 1,
              codeSnippet: this.getCodeSnippet(lines, i, 2),
              description: `${rule.description}${pattern.context ? ` (${pattern.context})` : ''}`,
              recommendation: rule.recommendation,
              owasp: rule.owasp,
              confidence: rule.confidence,
            };

            vulnerabilities.push(vulnerability);
          }
        }
      }
    }

    return vulnerabilities;
  }

  private normalizeLanguage(language: string): string {
    const langMap: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      rb: 'ruby',
      cs: 'csharp',
      cpp: 'cpp',
      c: 'c',
    };

    const lower = language.toLowerCase();
    return langMap[lower] || lower;
  }

  private getCodeSnippet(lines: string[], lineIndex: number, contextLines: number = 2): string {
    const start = Math.max(0, lineIndex - contextLines);
    const end = Math.min(lines.length - 1, lineIndex + contextLines);
    
    const snippetLines = [];
    for (let i = start; i <= end; i++) {
      const marker = i === lineIndex ? '>>>' : '   ';
      snippetLines.push(`${marker} ${i + 1}: ${lines[i]}`);
    }
    
    return snippetLines.join('\n');
  }

  getRulesBySeverity(severity: 'critical' | 'high' | 'medium' | 'low' | 'info'): CWERule[] {
    return this.rules.filter(rule => rule.severity === severity);
  }

  getRulesByCategory(category: string): CWERule[] {
    return this.rules.filter(rule => rule.category === category);
  }

  getAllRules(): CWERule[] {
    return this.rules;
  }

  getSupportedLanguages(): string[] {
    const languages = new Set<string>();
    this.rules.forEach(rule => {
      rule.languages.forEach(lang => languages.add(lang));
    });
    return Array.from(languages).sort();
  }
}
