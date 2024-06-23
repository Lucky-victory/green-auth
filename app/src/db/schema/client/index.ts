import {
  boolean,
  datetime,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { authIdGenerator, generateAppId } from "../../../utils";
import { relations } from "drizzle-orm";

export const Applications = mysqlTable("Applications", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),

  app_id: varchar("app_id", { length: 50 })
    .unique()
    .notNull()
    .$defaultFn(generateAppId),
  owner_id: varchar("owner_id", { length: 100 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").onUpdateNow(),
});
export const Users = mysqlTable(
  "Users",
  {
    id: int("id").autoincrement().primaryKey(),
    type: mysqlEnum("type", ["application", "client"]).default("client"),
    application_id: varchar("application_id", { length: 50 }).notNull(),
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
  },
  (table) => ({
    address_app_id_email_idx: index("address_app_id_email_idx").on(
      table.address,
      table.application_id,
      table.email
    ),
  })
);
export const UserMeta = mysqlTable("UserMeta", {
  id: int("id").autoincrement().primaryKey(),
  is_new_user: boolean("is_new_user").default(true),
  user_id: varchar("user_id", { length: 50 }).notNull(),
  last_login: datetime("last_login"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").onUpdateNow(),
});

export const UserRelations = relations(Users, ({ one, many }) => ({
  meta: one(UserMeta, {
    fields: [Users.auth_id],
    references: [UserMeta.user_id],
  }),
  apps: many(Applications),
}));
