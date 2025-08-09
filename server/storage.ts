import {
  users,
  projects,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type GithubProject,
  type AIModelConfig,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // GitHub operations
  createGithubProject(githubData: GithubProject): Promise<Project>;
  
  // AI Configuration
  getAIConfig(): Promise<AIModelConfig>;
  setAIConfig(config: AIModelConfig): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
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

  // AI Configuration
  private aiConfig: AIModelConfig = { type: 'openai' };

  async getAIConfig(): Promise<AIModelConfig> {
    return this.aiConfig;
  }

  async setAIConfig(config: AIModelConfig): Promise<void> {
    this.aiConfig = config;
  }
}

export const storage = new DatabaseStorage();