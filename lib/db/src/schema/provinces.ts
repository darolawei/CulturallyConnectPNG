import { pgTable, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["contributor", "reviewer", "admin"]);
export const moderationStatusEnum = pgEnum("moderation_status", ["draft", "pending", "approved", "rejected"]);
export const rightsStatusEnum = pgEnum("rights_status", ["public_domain", "open_license", "permission_required", "community_owned", "unknown"]);
export const culturalSensitivityEnum = pgEnum("cultural_sensitivity", ["public", "community_review", "restricted", "sacred"]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  role: userRoleEnum("role").notNull().default("contributor"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const provincesTable = pgTable("provinces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  capital: text("capital").notNull(),
  region: text("region").notNull(),
  population: integer("population"),
  area: real("area"),
  languages: text("languages").array(),
  flagColor: text("flag_color"),
  description: text("description"),
  danceStyle: text("dance_style"),
  imageUrl: text("image_url"),
});

export const insertProvinceSchema = createInsertSchema(provincesTable);
export type InsertProvince = z.infer<typeof insertProvinceSchema>;
export type Province = typeof provincesTable.$inferSelect;

export const storiesTable = pgTable("stories", {
  id: text("id").primaryKey(),
  provinceId: text("province_id").notNull().references(() => provincesTable.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  elderName: text("elder_name").notNull(),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
  audioUrl: text("audio_url"),
  language: text("language"),
  tags: text("tags").array(),
  sourceTitle: text("source_title"),
  sourceUrl: text("source_url"),
  sourceAuthor: text("source_author"),
  license: text("license"),
  rightsStatus: rightsStatusEnum("rights_status").notNull().default("unknown"),
  culturalSensitivity: culturalSensitivityEnum("cultural_sensitivity").notNull().default("community_review"),
  importBatchId: text("import_batch_id"),
  status: moderationStatusEnum("status").notNull().default("pending"),
  createdBy: text("created_by").references(() => usersTable.id),
  updatedBy: text("updated_by").references(() => usersTable.id),
  approvedBy: text("approved_by").references(() => usersTable.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStorySchema = createInsertSchema(storiesTable).omit({
  id: true,
  recordedAt: true,
  sourceTitle: true,
  sourceUrl: true,
  sourceAuthor: true,
  license: true,
  rightsStatus: true,
  culturalSensitivity: true,
  importBatchId: true,
  status: true,
  createdBy: true,
  updatedBy: true,
  approvedBy: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof storiesTable.$inferSelect;

export const herbsTable = pgTable("herbs", {
  id: text("id").primaryKey(),
  provinceId: text("province_id").notNull().references(() => provincesTable.id),
  name: text("name").notNull(),
  localName: text("local_name").notNull(),
  description: text("description").notNull(),
  uses: text("uses").array().notNull(),
  preparation: text("preparation"),
  warnings: text("warnings"),
  imageUrl: text("image_url"),
  sourceTitle: text("source_title"),
  sourceUrl: text("source_url"),
  sourceAuthor: text("source_author"),
  license: text("license"),
  rightsStatus: rightsStatusEnum("rights_status").notNull().default("unknown"),
  culturalSensitivity: culturalSensitivityEnum("cultural_sensitivity").notNull().default("community_review"),
  importBatchId: text("import_batch_id"),
  status: moderationStatusEnum("status").notNull().default("pending"),
  createdBy: text("created_by").references(() => usersTable.id),
  updatedBy: text("updated_by").references(() => usersTable.id),
  approvedBy: text("approved_by").references(() => usersTable.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertHerbSchema = createInsertSchema(herbsTable).omit({
  id: true,
  sourceTitle: true,
  sourceUrl: true,
  sourceAuthor: true,
  license: true,
  rightsStatus: true,
  culturalSensitivity: true,
  importBatchId: true,
  status: true,
  createdBy: true,
  updatedBy: true,
  approvedBy: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertHerb = z.infer<typeof insertHerbSchema>;
export type Herb = typeof herbsTable.$inferSelect;

export const villagesTable = pgTable("villages", {
  id: text("id").primaryKey(),
  provinceId: text("province_id").notNull().references(() => provincesTable.id),
  name: text("name").notNull(),
  clanOrigin: text("clan_origin").notNull(),
  foundingStory: text("founding_story").notNull(),
  location: text("location"),
  population: integer("population"),
  languages: text("languages").array(),
  traditions: text("traditions").array(),
  sourceTitle: text("source_title"),
  sourceUrl: text("source_url"),
  sourceAuthor: text("source_author"),
  license: text("license"),
  rightsStatus: rightsStatusEnum("rights_status").notNull().default("unknown"),
  culturalSensitivity: culturalSensitivityEnum("cultural_sensitivity").notNull().default("community_review"),
  importBatchId: text("import_batch_id"),
  status: moderationStatusEnum("status").notNull().default("pending"),
  createdBy: text("created_by").references(() => usersTable.id),
  updatedBy: text("updated_by").references(() => usersTable.id),
  approvedBy: text("approved_by").references(() => usersTable.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertVillageSchema = createInsertSchema(villagesTable).omit({
  id: true,
  sourceTitle: true,
  sourceUrl: true,
  sourceAuthor: true,
  license: true,
  rightsStatus: true,
  culturalSensitivity: true,
  importBatchId: true,
  status: true,
  createdBy: true,
  updatedBy: true,
  approvedBy: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVillage = z.infer<typeof insertVillageSchema>;
export type Village = typeof villagesTable.$inferSelect;

export const songsTable = pgTable("songs", {
  id: text("id").primaryKey(),
  provinceId: text("province_id").notNull().references(() => provincesTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  performer: text("performer"),
  language: text("language"),
  audioUrl: text("audio_url"),
  lyrics: text("lyrics"),
  tags: text("tags").array(),
  sourceTitle: text("source_title"),
  sourceUrl: text("source_url"),
  sourceAuthor: text("source_author"),
  license: text("license"),
  rightsStatus: rightsStatusEnum("rights_status").notNull().default("unknown"),
  culturalSensitivity: culturalSensitivityEnum("cultural_sensitivity").notNull().default("community_review"),
  importBatchId: text("import_batch_id"),
  status: moderationStatusEnum("status").notNull().default("pending"),
  createdBy: text("created_by").references(() => usersTable.id),
  updatedBy: text("updated_by").references(() => usersTable.id),
  approvedBy: text("approved_by").references(() => usersTable.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Song = typeof songsTable.$inferSelect;

export const festivalsTable = pgTable("festivals", {
  id: text("id").primaryKey(),
  provinceId: text("province_id").notNull().references(() => provincesTable.id),
  name: text("name").notNull(),
  month: text("month"),
  description: text("description").notNull(),
  location: text("location"),
  tags: text("tags").array(),
  sourceTitle: text("source_title"),
  sourceUrl: text("source_url"),
  sourceAuthor: text("source_author"),
  license: text("license"),
  rightsStatus: rightsStatusEnum("rights_status").notNull().default("unknown"),
  culturalSensitivity: culturalSensitivityEnum("cultural_sensitivity").notNull().default("public"),
  importBatchId: text("import_batch_id"),
  status: moderationStatusEnum("status").notNull().default("pending"),
  createdBy: text("created_by").references(() => usersTable.id),
  updatedBy: text("updated_by").references(() => usersTable.id),
  approvedBy: text("approved_by").references(() => usersTable.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Festival = typeof festivalsTable.$inferSelect;
