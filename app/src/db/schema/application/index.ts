import {
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { authIdGenerator, generateAppId } from "../../../utils";
import { relations } from "drizzle-orm";

export const Application = mysqlTable("Application", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  app_id: varchar("app_id", { length: 50 })
    .unique()
    .notNull()
    .$defaultFn(generateAppId),
  owner_id: varchar("owner_id", { length: 100 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").onUpdateNow(),
});
export const ApplicationSecretKeys = mysqlTable("ApplicationSecretKeys", {
  id: int("id").autoincrement().primaryKey(),
  application_id: varchar("application_id", { length: 50 }).notNull(),
  api_key: varchar("api_key", { length: 50 }).unique().notNull(),
  status: mysqlEnum("status", ["expired", "revoked", "active"]).default(
    "active"
  ),
  expires_at: datetime("expires_at"),
  created_at: timestamp("created_at").defaultNow(),
});
export const ApplicationOwner = mysqlTable("ApplicationOwner", {
  id: int("id").autoincrement().primaryKey(),
  auth_id: varchar("auth_id", { length: 50 })
    .notNull()
    .$defaultFn(authIdGenerator)
    .primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").onUpdateNow(),
});

export const ApplicationRelations = relations(Application, ({ one, many }) => ({
  owner: one(ApplicationOwner, {
    fields: [Application.owner_id],
    references: [ApplicationOwner.auth_id],
  }),
  secrets: many(ApplicationSecretKeys),
}));

export const ApplicationSecretKeysRelations = relations(
  ApplicationSecretKeys,
  ({ one }) => ({
    application: one(Application, {
      fields: [ApplicationSecretKeys.application_id],
      references: [Application.app_id],
    }),
  })
);
