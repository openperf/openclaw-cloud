import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * OpenClaw instances managed by the platform
 */
export const instances = mysqlTable("instances", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["running", "stopped", "error"]).default("stopped").notNull(),
  config: json("config").$type<Record<string, unknown>>(),
  port: int("port"),
  // LLM Configuration for AI coding tools (aider, etc.)
  llmProvider: varchar("llmProvider", { length: 50 }), // deepseek, openai, anthropic, etc.
  llmApiKey: text("llmApiKey"), // API key for the LLM provider
  llmModel: varchar("llmModel", { length: 100 }), // Specific model to use
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Instance = typeof instances.$inferSelect;
export type InsertInstance = typeof instances.$inferInsert;

/**
 * Plugins available in the system
 */
export const plugins = mysqlTable("plugins", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["channel", "deployment", "monitoring", "skill-provider", "infrastructure", "other"]).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  description: text("description"),
  author: varchar("author", { length: 255 }),
  configSchema: json("configSchema").$type<Record<string, unknown>>(),
  enabled: boolean("enabled").default(false).notNull(),
  installed: boolean("installed").default(false).notNull(),
  installPath: text("installPath"),
  // Docker container management fields
  dockerImage: varchar("dockerImage", { length: 255 }),
  dockerTag: varchar("dockerTag", { length: 100 }).default("latest"),
  containerId: varchar("containerId", { length: 100 }),
  containerStatus: mysqlEnum("containerStatus", ["running", "stopped", "error", "not_installed"]).default("not_installed"),
  hostPort: int("hostPort"),
  pluginConfig: json("pluginConfig").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Plugin = typeof plugins.$inferSelect;
export type InsertPlugin = typeof plugins.$inferInsert;

/**
 * Plugin configurations for specific instances
 */
export const pluginConfigs = mysqlTable("pluginConfigs", {
  id: int("id").autoincrement().primaryKey(),
  instanceId: int("instanceId").notNull(),
  pluginId: int("pluginId").notNull(),
  config: json("config").$type<Record<string, unknown>>(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PluginConfig = typeof pluginConfigs.$inferSelect;
export type InsertPluginConfig = typeof pluginConfigs.$inferInsert;

/**
 * Skills from various providers (awesome-openclaw-skills, ClawHub, etc.)
 */
export const skills = mysqlTable("skills", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  author: varchar("author", { length: 255 }),
  sourceUrl: text("sourceUrl"),
  provider: varchar("provider", { length: 100 }).notNull(), // awesome-openclaw-skills, clawhub, etc.
  downloadCount: int("downloadCount").default(0),
  rating: int("rating").default(0),
  usage_count: int("usage_count").default(0),
  last_used_at: timestamp("last_used_at"),
  tags: json("tags").$type<string[]>(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;

/**
 * Installed skills on specific instances
 */
export const installedSkills = mysqlTable("installedSkills", {
  id: int("id").autoincrement().primaryKey(),
  instanceId: int("instanceId").notNull(),
  skillId: int("skillId").notNull(),
  status: mysqlEnum("status", ["installing", "installed", "failed", "uninstalling"]).default("installing").notNull(),
  config: json("config").$type<Record<string, unknown>>(),
  installPath: text("installPath"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InstalledSkill = typeof installedSkills.$inferSelect;
export type InsertInstalledSkill = typeof installedSkills.$inferInsert;

/**
 * Skill collections for batch installation
 */
export const skillCollections = mysqlTable("skillCollections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  skillIds: json("skillIds").$type<number[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SkillCollection = typeof skillCollections.$inferSelect;
export type InsertSkillCollection = typeof skillCollections.$inferInsert;
