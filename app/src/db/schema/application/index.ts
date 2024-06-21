import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const ApplicationUser = mysqlTable("ApplicationUser", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }),
  auth_id: varchar("auth_id", { length: 100 }),
});

export const Application = mysqlTable("Application", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }),
  app_id: varchar("app_id", { length: 100 }).unique().notNull(),

  owner_id: varchar("owner_id", { length: 100 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").onUpdateNow(),
});
export const ApplicationSecretKeys = mysqlTable("ApplicationSecretKeys", {
  id: int("id").autoincrement().primaryKey(),
  app_id: varchar("app_id", { length: 50 }).unique().notNull(),
  api_key: varchar("api_key", { length: 50 }).unique().notNull(),
  created_at: timestamp("created_at").defaultNow(),
});
