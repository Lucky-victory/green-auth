import {
  boolean,
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { authIdGenerator } from "../../../utils";
import { relations } from "drizzle-orm";

export const ClientUser = mysqlTable("ClientUser", {
  id: int("id").autoincrement().primaryKey(),
  app_id: varchar("app_id", { length: 50 }).notNull(),
  auth_id: varchar("auth_id", { length: 50 })
    .notNull()
    .$defaultFn(authIdGenerator)
    .primaryKey(),
  first_name: varchar("name", { length: 100 }),
  last_name: varchar("last_name", { length: 100 }),
  avatar: varchar("avatar", { length: 255 }),
  username: varchar("username", { length: 100 }),
  verification_status: mysqlEnum("verification_status", [
    "pending",
    "verified",
    "unverified",
  ]).default("pending"),
  auth_type: mysqlEnum("auth_type", [
    "google",
    "email",
    "github",
    "web3",
  ]).notNull(),
  address: varchar("address", { length: 50 }),
  chain_id: varchar("chain_id", { length: 50 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").onUpdateNow(),
});
export const ClientUserMeta = mysqlTable("ClientUserMeta", {
  id: int("id").autoincrement().primaryKey(),
  is_new_user: boolean("is_new_user").default(true),
  user_id: varchar("user_id", { length: 50 }).notNull(),
  last_login: datetime("last_login"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").onUpdateNow(),
});

export const ClientUserRelations = relations(ClientUser, ({ one, many }) => ({
  meta: one(ClientUserMeta, {
    fields: [ClientUser.id],
    references: [ClientUserMeta.user_id],
  }),
  // apps: many(ClientUserApp, {
  //   fields: [ClientUser.id],
  //   references: [ClientUserApp.user_id],
  // }),
}));
