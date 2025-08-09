import { type User, type InsertUser, type Project, type InsertProject } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<Project>): Promise<Project | undefined>;
  listProjects(): Promise<Project[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      uploadedAt: new Date(),
      status: insertProject.status || 'processing',
      analysisData: insertProject.analysisData || null,
      fileCount: insertProject.fileCount || 0,
      controllerCount: insertProject.controllerCount || 0,
      serviceCount: insertProject.serviceCount || 0,
      repositoryCount: insertProject.repositoryCount || 0,
      entityCount: insertProject.entityCount || 0,
      originalFileName: insertProject.originalFileName || null,
      githubUrl: insertProject.githubUrl || null,
      githubRepo: insertProject.githubRepo || null,
      githubBranch: insertProject.githubBranch || null,
      sourceType: insertProject.sourceType || 'upload',
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async listProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }
}

export const storage = new MemStorage();
