import { eq } from "drizzle-orm";
import { db } from "../../db";
import {
  ApplicationMeta,
  Applications,
  ApplicationSecretKeys,
} from "../../db/schema";
import { NEW_APPLICATION } from "../../types/common";
import isEmpty from "just-is-empty";

export const ApplicationModel = {
  ...Applications,
  create: async function (newApp: NEW_APPLICATION) {
    const createApp = await db.transaction(async (tx) => {
      const [insertResponse] = await tx.insert(Applications).values(newApp);
      await tx.insert(ApplicationMeta).values({
        application_id: insertResponse.insertId,
      });
      await tx.insert(ApplicationSecretKeys).values({
        application_id: insertResponse.insertId,
      });
      const app = await tx.query.Applications.findFirst({
        where: (fields, ops) => ops.eq(fields.id, insertResponse.insertId),
        with: {
          meta: {
            columns: {
              allowed_origins: true,
              logo: true,
            },
          },
          secrets: {
            columns: {
              api_key: true,
              status: true,
              expires_at: true,
            },
          },
        },
      });
      return app;
    });
    return createApp;
  },
  findOne: async function (appId: string, owner_id: string) {
    const app = await db.query.Applications.findFirst({
      where: (fields, ops) =>
        ops.and(
          ops.eq(fields.app_id, appId),
          ops.eq(fields.owner_id, owner_id)
        ),
    });
    return app;
  },
  findMany: async function (ownerId?: string) {
    let apps = await db.query.Applications.findMany({
      where: (fields, ops) =>
        ownerId ? ops.eq(fields.owner_id, ownerId) : undefined,
    });
    // const apps = await db.query.Applications.findMany();
    return apps;
  },
  update: async (appId: string, data: Partial<NEW_APPLICATION>) => {
    if (isEmpty(data)) return;
    const app = await db
      .update(Applications)
      .set(data)
      .where(eq(Applications.app_id, appId));
    return app;
  },
  findUsers: async (appId: string) => {
    const users = await db.query.Users.findMany({
      where: (fields, ops) => ops.eq(fields.application_id, appId),
      with: {
        meta: {
          columns: {
            is_new_user: true,
            last_login: true,
          },
        },
      },
    });
    return users;
  },
};
