import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { Applications, UserMeta, Users } from "../db/schema";

export type USER_SELECT = InferSelectModel<typeof Users>;
export type USER_META = InferSelectModel<typeof UserMeta>;
export type USER_APPS = InferSelectModel<typeof Applications>;
export type USER = USER_SELECT;
export type USER_WITH_META = USER_SELECT & { meta: USER_META };
export type USER_WITH_APPS = USER & { apps: USER_APPS[] };

export type NEW_USER = InferInsertModel<typeof Users>
// Pick<
//   USER,
//   | "email"
//   | "first_name"
//   | "avatar"
//   | "auth_id"
//   | "application_id"
//   | "address"
//   | "chain_id"
//   | "last_name"
//   | "password"
//   | "username"
//   | "verification_status"
//   | "auth_type"
//   | "type"
// >;
