import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  originalFileName: text("original_file_name").notNull(),
  status: text("status").notNull().default("processing"), // 'processing', 'completed', 'failed'
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  analysisData: jsonb("analysis_data"),
  fileCount: integer("file_count").default(0),
  controllerCount: integer("controller_count").default(0),
  serviceCount: integer("service_count").default(0),
  repositoryCount: integer("repository_count").default(0),
  entityCount: integer("entity_count").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  uploadedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

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
});

export type AnalysisData = z.infer<typeof AnalysisDataSchema>;
