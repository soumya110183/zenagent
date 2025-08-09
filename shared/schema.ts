import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  originalFileName: text("original_file_name"),
  githubUrl: text("github_url"),
  githubRepo: text("github_repo"), // format: "owner/repo"
  githubBranch: text("github_branch").default("main"),
  sourceType: text("source_type").notNull().default("upload"), // 'upload', 'github'
  projectType: text("project_type").default("java"), // 'java', 'python', 'pyspark', 'mainframe'
  status: text("status").notNull().default("processing"), // 'processing', 'completed', 'failed'
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  analysisData: jsonb("analysis_data"),
  fileCount: integer("file_count").default(0),
  controllerCount: integer("controller_count").default(0),
  serviceCount: integer("service_count").default(0),
  repositoryCount: integer("repository_count").default(0),
  entityCount: integer("entity_count").default(0),
});

export type UpsertUser = typeof users.$inferInsert;

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  uploadedAt: true,
});

export const githubProjectSchema = z.object({
  githubUrl: z.string().url(),
  name: z.string().optional(),
  githubBranch: z.string().default("main"),
});

export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type GithubProject = z.infer<typeof githubProjectSchema>;

// AI Model Configuration Schema
export const aiModelConfigSchema = z.object({
  type: z.enum(['openai', 'local']),
  localEndpoint: z.string().optional(),
  modelName: z.string().optional(),
});

export type AIModelConfig = z.infer<typeof aiModelConfigSchema>;

// AI Analysis types
export interface AIInsight {
  id: string;
  type: 'overview' | 'module_description' | 'function_description' | 'architecture_suggestion';
  title: string;
  content: string;
  confidence: number;
  tags: string[];
  relatedComponents: string[];
}

export interface AIAnalysisResult {
  projectOverview: string;
  architectureInsights: string[];
  moduleInsights: Record<string, AIInsight>;
  suggestions: string[];
  qualityScore: number;
}

// Analysis result types
export const AnalysisDataSchema = z.object({
  classes: z.array(z.object({
    name: z.string(),
    package: z.string(),
    type: z.enum(['controller', 'service', 'repository', 'entity', 'component', 'configuration', 'other']),
    annotations: z.array(z.string()),
    methods: z.array(z.object({
      name: z.string(),
      annotations: z.array(z.string()),
      parameters: z.array(z.string()),
      returnType: z.string(),
    })),
    fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      annotations: z.array(z.string()),
    })),
    extends: z.string().optional(),
    implements: z.array(z.string()).default([]),
  })),
  relationships: z.array(z.object({
    from: z.string(),
    to: z.string(),
    type: z.enum(['calls', 'extends', 'implements', 'injects', 'references']),
    method: z.string().optional(),
  })),
  patterns: z.array(z.object({
    name: z.string(),
    type: z.string(),
    classes: z.array(z.string()),
    description: z.string(),
  })),
  entities: z.array(z.object({
    name: z.string(),
    tableName: z.string().optional(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      columnName: z.string().optional(),
      relationship: z.string().optional(), // 'OneToMany', 'ManyToOne', 'OneToOne', 'ManyToMany'
      targetEntity: z.string().optional(),
    })),
  })),
  structure: z.object({
    packages: z.array(z.string()),
    sourceFiles: z.array(z.string()),
  }),
  aiAnalysis: z.object({
    projectOverview: z.string(),
    projectDetails: z.object({
      projectDescription: z.string(),
      businessProblem: z.string(),
      keyObjective: z.string(),
      functionalitySummary: z.string(),
      implementedFeatures: z.array(z.string()),
      modulesServices: z.array(z.string()),
    }),
    architectureInsights: z.array(z.string()),
    moduleInsights: z.record(z.string(), z.object({
      id: z.string(),
      type: z.enum(['overview', 'module_description', 'function_description', 'architecture_suggestion']),
      title: z.string(),
      content: z.string(),
      confidence: z.number(),
      tags: z.array(z.string()),
      relatedComponents: z.array(z.string()),
    })),
    suggestions: z.array(z.string()),
    qualityScore: z.number(),
  }).optional(),
});

export type AnalysisData = z.infer<typeof AnalysisDataSchema>;
