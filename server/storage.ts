import {
  users,
  projects,
  sourceFiles,
  customDemographicPatterns,
  excelFieldMappings,
  cweScans,
  cweVulnerabilities,
  qualityMetrics,
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type SourceFile,
  type InsertSourceFile,
  type CustomDemographicPattern,
  type InsertCustomDemographicPattern,
  type ExcelFieldMapping,
  type InsertExcelFieldMapping,
  type CWEScan,
  type InsertCWEScan,
  type CWEVulnerability,
  type InsertCWEVulnerability,
  type QualityMetric,
  type InsertQualityMetric,
  type GithubProject,
} from "@shared/schema";
import { assertDb } from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

// AI Model Configuration Type
export type AIModelConfig = {
  provider: 'openai' | 'ollama';
  model: string;
  apiKey?: string;
  baseUrl?: string;
};

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  validateUser(username: string, password: string): Promise<User | undefined>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // GitHub operations
  createGithubProject(githubData: GithubProject): Promise<Project>;
  
  // Source file operations
  createSourceFile(sourceFile: InsertSourceFile): Promise<SourceFile>;
  createSourceFiles(sourceFiles: InsertSourceFile[]): Promise<SourceFile[]>;
  getProjectSourceFiles(projectId: string): Promise<SourceFile[]>;
  deleteProjectSourceFiles(projectId: string): Promise<boolean>;
  
  // AI Configuration
  getAIConfig(): Promise<AIModelConfig>;
  setAIConfig(config: AIModelConfig): Promise<void>;
  
  // Custom demographic patterns
  createCustomPattern(pattern: InsertCustomDemographicPattern): Promise<CustomDemographicPattern>;
  getCustomPatterns(): Promise<CustomDemographicPattern[]>;
  deleteCustomPattern(id: string): Promise<boolean>;
  
  // Excel field mappings
  saveExcelMapping(mapping: Omit<InsertExcelFieldMapping, 'id' | 'uploadedAt'>): Promise<ExcelFieldMapping>;
  getExcelMappings(projectId: string): Promise<ExcelFieldMapping[]>;
  getSourceFilesByProject(projectId: string): Promise<SourceFile[]>;
  
  // CWE Scan operations
  createCWEScan(scan: InsertCWEScan): Promise<CWEScan>;
  getCWEScan(id: string): Promise<CWEScan | undefined>;
  getCWEScansByProject(projectId: string): Promise<CWEScan[]>;
  updateCWEScan(id: string, updates: Partial<CWEScan>): Promise<CWEScan | undefined>;
  
  // CWE Vulnerability operations
  createCWEVulnerability(vulnerability: InsertCWEVulnerability): Promise<CWEVulnerability>;
  createCWEVulnerabilities(vulnerabilities: InsertCWEVulnerability[]): Promise<CWEVulnerability[]>;
  getCWEVulnerabilitiesByScan(scanId: string): Promise<CWEVulnerability[]>;
  getCWEVulnerabilitiesByProject(projectId: string): Promise<CWEVulnerability[]>;
  
  // Quality Metrics operations
  createQualityMetric(metric: InsertQualityMetric): Promise<QualityMetric>;
  getQualityMetricByProject(projectId: string): Promise<QualityMetric | undefined>;
  updateQualityMetric(projectId: string, updates: Partial<QualityMetric>): Promise<QualityMetric | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private projects: Map<string, Project> = new Map();
  private sourceFiles: Map<string, SourceFile> = new Map();
  private customPatterns: Map<string, CustomDemographicPattern> = new Map();
  private excelMappings: Map<string, ExcelFieldMapping> = new Map();
  private cweScans: Map<string, CWEScan> = new Map();
  private cweVulnerabilities: Map<string, CWEVulnerability> = new Map();
  private qualityMetrics: Map<string, QualityMetric> = new Map();
  private aiConfig: AIModelConfig = { provider: 'openai', model: 'gpt-4o' };
  
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = `user_${Date.now()}`;
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user: User = {
      id,
      username: userData.username,
      password: hashedPassword,
      email: userData.email,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      position: userData.position ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      isActive: userData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async validateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : undefined;
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const id = `proj_${Date.now()}`;
    const newProject: Project = {
      id,
      name: project.name,
      projectType: project.projectType,
      uploadedAt: new Date(),
      status: project.status ?? 'processing',
      analysisData: project.analysisData ?? null,
      fileCount: project.fileCount ?? 0,
      controllerCount: project.controllerCount ?? 0,
      serviceCount: project.serviceCount ?? 0,
      repositoryCount: project.repositoryCount ?? 0,
      entityCount: project.entityCount ?? 0,
      originalFileName: project.originalFileName ?? null,
      githubUrl: project.githubUrl ?? null,
      githubRepo: project.githubRepo ?? null,
      githubBranch: project.githubBranch ?? null,
      sourceType: project.sourceType ?? 'upload',
      userId: project.userId ?? null,
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    const updated = { ...project, ...updates };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  async createGithubProject(githubData: GithubProject): Promise<Project> {
    return this.createProject({
      name: githubData.name || githubData.githubUrl.split('/').pop() || 'Unnamed Project',
      githubUrl: githubData.githubUrl,
      githubRepo: githubData.githubUrl.replace('https://github.com/', ''),
      githubBranch: githubData.githubBranch,
      sourceType: 'github',
      projectType: 'java',
      status: 'processing',
    });
  }

  // Source file operations
  async createSourceFile(sourceFile: InsertSourceFile): Promise<SourceFile> {
    const id = `file_${Date.now()}_${Math.random()}`;
    const newFile: SourceFile = { id, ...sourceFile };
    this.sourceFiles.set(id, newFile);
    return newFile;
  }

  async createSourceFiles(sourceFileList: InsertSourceFile[]): Promise<SourceFile[]> {
    return Promise.all(sourceFileList.map(sf => this.createSourceFile(sf)));
  }

  async getProjectSourceFiles(projectId: string): Promise<SourceFile[]> {
    return Array.from(this.sourceFiles.values()).filter(f => f.projectId === projectId);
  }

  async deleteProjectSourceFiles(projectId: string): Promise<boolean> {
    const files = Array.from(this.sourceFiles.entries()).filter(([_, f]) => f.projectId === projectId);
    files.forEach(([id]) => this.sourceFiles.delete(id));
    return files.length > 0;
  }

  // AI Configuration
  async getAIConfig(): Promise<AIModelConfig> {
    return this.aiConfig;
  }

  async setAIConfig(config: AIModelConfig): Promise<void> {
    this.aiConfig = config;
  }

  // Custom demographic patterns
  async createCustomPattern(pattern: InsertCustomDemographicPattern): Promise<CustomDemographicPattern> {
    const id = `pattern_${Date.now()}`;
    const newPattern: CustomDemographicPattern = { id, ...pattern, createdAt: new Date() };
    this.customPatterns.set(id, newPattern);
    return newPattern;
  }

  async getCustomPatterns(): Promise<CustomDemographicPattern[]> {
    return Array.from(this.customPatterns.values());
  }

  async deleteCustomPattern(id: string): Promise<boolean> {
    return this.customPatterns.delete(id);
  }

  // Excel field mappings
  async saveExcelMapping(mapping: Omit<InsertExcelFieldMapping, 'id' | 'uploadedAt'>): Promise<ExcelFieldMapping> {
    const id = `excel_${Date.now()}`;
    const newMapping: ExcelFieldMapping = { id, ...mapping, uploadedAt: new Date() };
    this.excelMappings.set(id, newMapping);
    return newMapping;
  }

  async getExcelMappings(projectId: string): Promise<ExcelFieldMapping[]> {
    return Array.from(this.excelMappings.values()).filter(m => m.projectId === projectId);
  }

  async getSourceFilesByProject(projectId: string): Promise<SourceFile[]> {
    return this.getProjectSourceFiles(projectId);
  }

  // CWE Scan operations
  async createCWEScan(scan: InsertCWEScan): Promise<CWEScan> {
    const id = `scan_${Date.now()}`;
    const newScan: CWEScan = {
      id,
      projectId: scan.projectId,
      status: scan.status ?? 'pending',
      totalFiles: scan.totalFiles ?? 0,
      scannedFiles: scan.scannedFiles ?? 0,
      vulnerabilitiesFound: scan.vulnerabilitiesFound ?? 0,
      criticalCount: scan.criticalCount ?? 0,
      highCount: scan.highCount ?? 0,
      mediumCount: scan.mediumCount ?? 0,
      lowCount: scan.lowCount ?? 0,
      scanStartedAt: scan.scanStartedAt ?? new Date(),
      scanCompletedAt: scan.scanCompletedAt ?? null,
      errorMessage: scan.errorMessage ?? null,
    };
    this.cweScans.set(id, newScan);
    return newScan;
  }

  async getCWEScan(id: string): Promise<CWEScan | undefined> {
    return this.cweScans.get(id);
  }

  async getCWEScansByProject(projectId: string): Promise<CWEScan[]> {
    return Array.from(this.cweScans.values()).filter(s => s.projectId === projectId);
  }

  async updateCWEScan(id: string, updates: Partial<CWEScan>): Promise<CWEScan | undefined> {
    const scan = this.cweScans.get(id);
    if (!scan) return undefined;
    const updated = { ...scan, ...updates };
    this.cweScans.set(id, updated);
    return updated;
  }

  // CWE Vulnerability operations
  async createCWEVulnerability(vulnerability: InsertCWEVulnerability): Promise<CWEVulnerability> {
    const id = `vuln_${Date.now()}_${Math.random()}`;
    const newVuln: CWEVulnerability = { id, ...vulnerability };
    this.cweVulnerabilities.set(id, newVuln);
    return newVuln;
  }

  async createCWEVulnerabilities(vulnerabilityList: InsertCWEVulnerability[]): Promise<CWEVulnerability[]> {
    return Promise.all(vulnerabilityList.map(v => this.createCWEVulnerability(v)));
  }

  async getCWEVulnerabilitiesByScan(scanId: string): Promise<CWEVulnerability[]> {
    return Array.from(this.cweVulnerabilities.values()).filter(v => v.scanId === scanId);
  }

  async getCWEVulnerabilitiesByProject(projectId: string): Promise<CWEVulnerability[]> {
    return Array.from(this.cweVulnerabilities.values()).filter(v => v.projectId === projectId);
  }

  // Quality Metrics operations
  async createQualityMetric(metric: InsertQualityMetric): Promise<QualityMetric> {
    const id = `metric_${Date.now()}`;
    const newMetric: QualityMetric = {
      id,
      projectId: metric.projectId,
      reliabilityScore: metric.reliabilityScore ?? 0,
      securityScore: metric.securityScore ?? 0,
      maintainabilityScore: metric.maintainabilityScore ?? 0,
      performanceScore: metric.performanceScore ?? 0,
      overallScore: metric.overallScore ?? 0,
      totalViolations: metric.totalViolations ?? 0,
      criticalViolations: metric.criticalViolations ?? 0,
      highViolations: metric.highViolations ?? 0,
      mediumViolations: metric.mediumViolations ?? 0,
      lowViolations: metric.lowViolations ?? 0,
      codeSmells: metric.codeSmells ?? 0,
      technicalDebt: metric.technicalDebt ?? '0h',
      scanDate: metric.scanDate ?? new Date(),
      updatedAt: new Date(),
    };
    this.qualityMetrics.set(id, newMetric);
    return newMetric;
  }

  async getQualityMetricByProject(projectId: string): Promise<QualityMetric | undefined> {
    return Array.from(this.qualityMetrics.values()).find(m => m.projectId === projectId);
  }

  async updateQualityMetric(projectId: string, updates: Partial<QualityMetric>): Promise<QualityMetric | undefined> {
    const metric = await this.getQualityMetricByProject(projectId);
    if (!metric) return undefined;
    const updated = { ...metric, ...updates, updatedAt: new Date() };
    this.qualityMetrics.set(metric.id, updated);
    return updated;
  }
}

export class DatabaseStorage implements IStorage {
  private db = assertDb(); // Ensure db is available at construction time
  
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await this.db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await this.db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async validateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : undefined;
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await this.db.insert(projects).values(project).returning();
    return newProject;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await this.db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjects(): Promise<Project[]> {
    return await this.db.select().from(projects);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const [project] = await this.db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return project;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await this.db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // GitHub operations
  async createGithubProject(githubData: GithubProject): Promise<Project> {
    const projectData = {
      name: githubData.name || githubData.githubUrl.split('/').pop() || 'Unnamed Project',
      githubUrl: githubData.githubUrl,
      githubRepo: githubData.githubUrl.replace('https://github.com/', ''),
      githubBranch: githubData.githubBranch,
      sourceType: 'github' as const,
      projectType: 'java' as const,
      status: 'processing' as const,
    };
    
    return this.createProject(projectData);
  }

  // Source file operations
  async createSourceFile(sourceFile: InsertSourceFile): Promise<SourceFile> {
    const [newSourceFile] = await this.db.insert(sourceFiles).values(sourceFile).returning();
    return newSourceFile;
  }

  async createSourceFiles(sourceFileList: InsertSourceFile[]): Promise<SourceFile[]> {
    if (sourceFileList.length === 0) return [];
    const created = await this.db.insert(sourceFiles).values(sourceFileList).returning();
    return created;
  }

  async getProjectSourceFiles(projectId: string): Promise<SourceFile[]> {
    return await this.db.select().from(sourceFiles).where(eq(sourceFiles.projectId, projectId));
  }

  async deleteProjectSourceFiles(projectId: string): Promise<boolean> {
    const result = await this.db.delete(sourceFiles).where(eq(sourceFiles.projectId, projectId));
    return (result.rowCount ?? 0) > 0;
  }

  // AI Configuration
  private aiConfig: AIModelConfig = { provider: 'openai', model: 'gpt-4o' };

  async getAIConfig(): Promise<AIModelConfig> {
    return this.aiConfig;
  }

  async setAIConfig(config: AIModelConfig): Promise<void> {
    this.aiConfig = config;
  }

  // Custom demographic patterns
  async createCustomPattern(pattern: InsertCustomDemographicPattern): Promise<CustomDemographicPattern> {
    const [newPattern] = await this.db.insert(customDemographicPatterns).values(pattern).returning();
    return newPattern;
  }

  async getCustomPatterns(): Promise<CustomDemographicPattern[]> {
    return await this.db.select().from(customDemographicPatterns);
  }

  async deleteCustomPattern(id: string): Promise<boolean> {
    const result = await this.db.delete(customDemographicPatterns).where(eq(customDemographicPatterns.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Excel field mappings
  async saveExcelMapping(mapping: Omit<InsertExcelFieldMapping, 'id' | 'uploadedAt'>): Promise<ExcelFieldMapping> {
    const [newMapping] = await this.db.insert(excelFieldMappings).values(mapping).returning();
    return newMapping;
  }

  async getExcelMappings(projectId: string): Promise<ExcelFieldMapping[]> {
    return await this.db.select().from(excelFieldMappings).where(eq(excelFieldMappings.projectId, projectId));
  }

  async getSourceFilesByProject(projectId: string): Promise<SourceFile[]> {
    return await this.db.select().from(sourceFiles).where(eq(sourceFiles.projectId, projectId));
  }

  // CWE Scan operations
  async createCWEScan(scan: InsertCWEScan): Promise<CWEScan> {
    const [newScan] = await this.db.insert(cweScans).values(scan).returning();
    return newScan;
  }

  async getCWEScan(id: string): Promise<CWEScan | undefined> {
    const [scan] = await this.db.select().from(cweScans).where(eq(cweScans.id, id));
    return scan;
  }

  async getCWEScansByProject(projectId: string): Promise<CWEScan[]> {
    return await this.db.select().from(cweScans).where(eq(cweScans.projectId, projectId));
  }

  async updateCWEScan(id: string, updates: Partial<CWEScan>): Promise<CWEScan | undefined> {
    const [scan] = await this.db.update(cweScans).set(updates).where(eq(cweScans.id, id)).returning();
    return scan;
  }

  // CWE Vulnerability operations
  async createCWEVulnerability(vulnerability: InsertCWEVulnerability): Promise<CWEVulnerability> {
    const [newVulnerability] = await this.db.insert(cweVulnerabilities).values(vulnerability).returning();
    return newVulnerability;
  }

  async createCWEVulnerabilities(vulnerabilityList: InsertCWEVulnerability[]): Promise<CWEVulnerability[]> {
    if (vulnerabilityList.length === 0) return [];
    const created = await this.db.insert(cweVulnerabilities).values(vulnerabilityList).returning();
    return created;
  }

  async getCWEVulnerabilitiesByScan(scanId: string): Promise<CWEVulnerability[]> {
    return await this.db.select().from(cweVulnerabilities).where(eq(cweVulnerabilities.scanId, scanId));
  }

  async getCWEVulnerabilitiesByProject(projectId: string): Promise<CWEVulnerability[]> {
    return await this.db.select().from(cweVulnerabilities).where(eq(cweVulnerabilities.projectId, projectId));
  }

  // Quality Metrics operations
  async createQualityMetric(metric: InsertQualityMetric): Promise<QualityMetric> {
    const [newMetric] = await this.db.insert(qualityMetrics).values(metric).returning();
    return newMetric;
  }

  async getQualityMetricByProject(projectId: string): Promise<QualityMetric | undefined> {
    const [metric] = await this.db.select().from(qualityMetrics).where(eq(qualityMetrics.projectId, projectId));
    return metric;
  }

  async updateQualityMetric(projectId: string, updates: Partial<QualityMetric>): Promise<QualityMetric | undefined> {
    const [metric] = await this.db.update(qualityMetrics).set({ ...updates, updatedAt: new Date() }).where(eq(qualityMetrics.projectId, projectId)).returning();
    return metric;
  }
}

// Storage factory: returns MemStorage or DatabaseStorage based on DATABASE_URL
export function createStorage(): IStorage {
  if (process.env.DATABASE_URL) {
    console.log('✅ Using DatabaseStorage (PostgreSQL)');
    return new DatabaseStorage();
  } else {
    console.log('✅ Using MemStorage (in-memory)');
    return new MemStorage();
  }
}

// Export singleton storage instance
export const storage = createStorage();