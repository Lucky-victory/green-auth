import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { Applications, UserMeta, Users } from "../db/schema";

export type USER_SELECT = InferSelectModel<typeof Users>;
export type USER_META = InferSelectModel<typeof UserMeta>;
export type USER = USER_SELECT;
export type USER_WITH_META = USER_SELECT & { meta: USER_META };
export type USER_WITH_APPS = USER & { apps: APPLICATION[] };

export type NEW_USER = InferInsertModel<typeof Users>;

export type APPLICATION = InferSelectModel<typeof Applications>;
export type NEW_APPLICATION = InferInsertModel<typeof Applications>;
