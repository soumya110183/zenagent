import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for express-session
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User authentication table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  position: varchar("position", { length: 100 }),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table for storing user projects
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  originalFileName: text("original_file_name"),
  githubUrl: text("github_url"),
  githubRepo: text("github_repo"),
  githubBranch: text("github_branch").default("main"),
  sourceType: text("source_type").notNull().default("upload"), // 'upload' | 'github'
  projectType: text("project_type").default("java"), // 'java' | 'python' | 'pyspark' | 'mainframe'
  status: text("status").notNull().default("processing"), // 'processing' | 'completed' | 'failed'
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  analysisData: jsonb("analysis_data"),
  fileCount: integer("file_count").default(0),
  controllerCount: integer("controller_count").default(0),
  serviceCount: integer("service_count").default(0),
  repositoryCount: integer("repository_count").default(0),
  entityCount: integer("entity_count").default(0),
  description: text("description"),
});

// Source files table for storing actual source code content
export const sourceFiles = pgTable("source_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  relativePath: text("relative_path").notNull(),
  content: text("content").notNull(), // Actual source code content
  fileSize: integer("file_size").notNull(),
  language: text("language").default("java"), // 'java' | 'python' | 'scala' | 'cobol' etc.
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_source_files_project_id").on(table.projectId),
]);

// Custom demographic patterns table
export const customDemographicPatterns = pgTable("custom_demographic_patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(),
  fieldName: text("field_name").notNull(),
  patterns: jsonb("patterns").notNull(), // Array of regex pattern strings
  description: text("description").notNull(),
  examples: jsonb("examples").notNull(), // Array of example strings
  createdAt: timestamp("created_at").defaultNow(),
});

// Excel field mapping table
export const excelFieldMappings = pgTable("excel_field_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  fileName: text("file_name").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  mappingData: jsonb("mapping_data").notNull(), // Array of {tableName, fieldName}
  scanResults: jsonb("scan_results"), // Results of scanning with match details
  totalFields: integer("total_fields").notNull().default(0),
  matchedFields: integer("matched_fields").default(0),
  status: text("status").default("uploaded"), // 'uploaded' | 'scanning' | 'completed'
}, (table) => [
  index("idx_excel_mappings_project_id").on(table.projectId),
]);

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UpsertUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export type SourceFile = typeof sourceFiles.$inferSelect;
export type InsertSourceFile = typeof sourceFiles.$inferInsert;

export type CustomDemographicPattern = typeof customDemographicPatterns.$inferSelect;
export type InsertCustomDemographicPattern = typeof customDemographicPatterns.$inferInsert;

export type ExcelFieldMapping = typeof excelFieldMappings.$inferSelect;
export type InsertExcelFieldMapping = typeof excelFieldMappings.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  uploadedAt: true,
});

export const githubProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  githubUrl: z.string().url("Must be a valid GitHub URL"),
  githubBranch: z.string().optional().default("main"),
  projectType: z.enum(["java", "python", "pyspark", "mainframe"]).optional().default("java"),
  description: z.string().optional(),
});

export type GithubProject = z.infer<typeof githubProjectSchema>;

export const insertSourceFileSchema = createInsertSchema(sourceFiles).omit({
  id: true,
  createdAt: true,
});

export type InsertSourceFileInput = z.infer<typeof insertSourceFileSchema>;

// Analysis Data Types
export interface JavaClass {
  name: string;
  package: string;
  type: 'controller' | 'service' | 'repository' | 'entity' | 'config' | 'component' | 'model';
  annotations: string[];
  methods?: Array<{
    name: string;
    annotations: string[];
  }>;
  fields?: Array<{
    name: string;
    type: string;
    annotations: string[];
  }>;
  dependencies?: string[];
}

export interface Relationship {
  from: string;
  to: string;
  type: 'calls' | 'uses' | 'extends' | 'implements' | 'depends';
  method?: string;
}

export interface Pattern {
  name: string;
  description: string;
  classes: string[];
}

export interface Entity {
  name: string;
  tableName: string;
  fields: Array<{
    name: string;
    type: string;
    annotations: string[];
  }>;
}

export interface ProjectDetails {
  projectDescription: string;
  projectType: string;
  businessProblem?: string;
  keyObjective?: string;
  functionalitySummary?: string;
  initialFeatures?: string[];
  implementedFeatures: string[];
  modulesServices: string[];
}

export interface AIInsight {
  description: string;
  components: string[];
  patterns: string[];
  suggestions: string[];
}

export interface AIAnalysisResult {
  projectOverview: string;
  projectDetails: ProjectDetails;
  architectureInsights: string[];
  moduleInsights: Record<string, AIInsight>;
  suggestions: string[];
  qualityScore: number;
}

export interface AnalysisData {
  classes: JavaClass[];
  relationships: Relationship[];
  patterns: Pattern[];
  entities: Entity[];
  dependencies: Relationship[];
  structure: {
    packages: string[];
    sourceFiles: string[];
  };
  aiAnalysis?: AIAnalysisResult;
}