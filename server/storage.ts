import {
  users,
  projects,
  sourceFiles,
  customDemographicPatterns,
  excelFieldMappings,
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
  type AIModelConfig,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
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
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return project;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
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
    const [newSourceFile] = await db.insert(sourceFiles).values(sourceFile).returning();
    return newSourceFile;
  }

  async createSourceFiles(sourceFileList: InsertSourceFile[]): Promise<SourceFile[]> {
    if (sourceFileList.length === 0) return [];
    const created = await db.insert(sourceFiles).values(sourceFileList).returning();
    return created;
  }

  async getProjectSourceFiles(projectId: string): Promise<SourceFile[]> {
    return await db.select().from(sourceFiles).where(eq(sourceFiles.projectId, projectId));
  }

  async deleteProjectSourceFiles(projectId: string): Promise<boolean> {
    const result = await db.delete(sourceFiles).where(eq(sourceFiles.projectId, projectId));
    return result.rowCount > 0;
  }

  // AI Configuration
  private aiConfig: AIModelConfig = { type: 'openai' };

  async getAIConfig(): Promise<AIModelConfig> {
    return this.aiConfig;
  }

  async setAIConfig(config: AIModelConfig): Promise<void> {
    this.aiConfig = config;
  }

  // Custom demographic patterns
  async createCustomPattern(pattern: InsertCustomDemographicPattern): Promise<CustomDemographicPattern> {
    const [newPattern] = await db.insert(customDemographicPatterns).values(pattern).returning();
    return newPattern;
  }

  async getCustomPatterns(): Promise<CustomDemographicPattern[]> {
    return await db.select().from(customDemographicPatterns);
  }

  async deleteCustomPattern(id: string): Promise<boolean> {
    const result = await db.delete(customDemographicPatterns).where(eq(customDemographicPatterns.id, id));
    return result.rowCount > 0;
  }

  // Excel field mappings
  async saveExcelMapping(mapping: Omit<InsertExcelFieldMapping, 'id' | 'uploadedAt'>): Promise<ExcelFieldMapping> {
    const [newMapping] = await db.insert(excelFieldMappings).values(mapping).returning();
    return newMapping;
  }

  async getExcelMappings(projectId: string): Promise<ExcelFieldMapping[]> {
    return await db.select().from(excelFieldMappings).where(eq(excelFieldMappings.projectId, projectId));
  }

  async getSourceFilesByProject(projectId: string): Promise<SourceFile[]> {
    return await db.select().from(sourceFiles).where(eq(sourceFiles.projectId, projectId));
  }
}

export const storage = new DatabaseStorage();