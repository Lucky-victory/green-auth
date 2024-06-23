import {
  datetime,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { authIdGenerator, generateApiKey, generateAppId } from "../../../utils";
import { relations } from "drizzle-orm";
import { Applications, Users } from "../client";

export const ApplicationSecretKeys = mysqlTable("ApplicationSecretKeys", {
  id: int("id").autoincrement().primaryKey(),
  application_id: varchar("application_id", { length: 50 }).notNull(),
  api_key: varchar("api_key", { length: 50 })
    .unique()
    .notNull()
    .$defaultFn(generateApiKey),
  status: mysqlEnum("status", ["expired", "revoked", "active"]).default(
    "active"
  ),
  expires_at: datetime("expires_at"),
  created_at: timestamp("created_at").defaultNow(),
});

export const ApplicationMeta = mysqlTable("ApplicationMeta", {
  id: int("id").autoincrement().primaryKey(),
  application_id: varchar("application_id", { length: 50 }).notNull(),
  allowed_origins: json("allowed_origins"),
  logo: varchar("logo", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").onUpdateNow(),
});

export const ApplicationMetaRelations = relations(
  ApplicationMeta,
  ({ one }) => ({
    application: one(Applications, {
      fields: [ApplicationMeta.application_id],
      references: [Applications.app_id],
    }),
  })
);
export const ApplicationRelations = relations(
  Applications,
  ({ one, many }) => ({
    owner: one(Users, {
      fields: [Applications.owner_id],
      references: [Users.auth_id],
    }),
    meta: one(ApplicationMeta, {
      fields: [Applications.app_id],
      references: [ApplicationMeta.application_id],
    }),

    secrets: many(ApplicationSecretKeys),
  })
);

export const ApplicationSecretKeysRelations = relations(
  ApplicationSecretKeys,
  ({ one }) => ({
    application: one(Applications, {
      fields: [ApplicationSecretKeys.application_id],
      references: [Applications.app_id],
    }),
  })
);
