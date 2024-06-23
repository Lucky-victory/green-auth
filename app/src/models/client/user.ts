import bcrypt from "bcrypt";
import { db } from "../../db";
import { UserMeta, Users } from "../../db/schema/client";
import { USER, NEW_USER } from "../../types/common";
import isEmpty from "just-is-empty";

export const UserModel = {
  ...Users,
  validatePassword: async (password: string, enteredPassword: string) => {
    const isValid = await bcrypt.compare(password, enteredPassword);
    return isValid;
  },
  findOne: async (
    emailOrAuthIdOrAddress: string,
    appId: string,
    excludeFields: (keyof USER)[] = ["password"]
  ) => {
    const columns = excludeFields.reduce((acc, exclude) => {
      acc[exclude] = false;
      return acc;
    }, {} as Record<keyof USER, boolean>);

    const user = await db.query.Users.findFirst({
      ...(!isEmpty(columns) ? { columns } : {}),
      with: {
        meta: {
          columns: { is_new_user: true, last_login: true },
        },
      },
      where: (fields, ops) =>
        ops.and(
          ops.or(
            ops.eq(fields.email, emailOrAuthIdOrAddress),
            ops.eq(fields.auth_id, emailOrAuthIdOrAddress),
            ops.eq(fields.address, emailOrAuthIdOrAddress)
          ),
          ops.eq(fields.application_id, appId)
        ),
    });

    return user;
  },
  findByAuthId: async (
    authId: string,
    appId: string,
    excludeFields: (keyof USER)[] = ["password"]
  ) => {
    const columns = excludeFields.reduce((acc, exclude) => {
      acc[exclude] = false;
      return acc;
    }, {} as Record<keyof USER, boolean>);

    const user = await db.query.Users.findFirst({
      ...(!isEmpty(columns) ? { columns } : {}),
      where: (fields, ops) =>
        ops.and(
          ops.eq(fields.auth_id, authId),
          ops.eq(fields.application_id, appId)
        ),
      with: {
        meta: {
          columns: { is_new_user: true, last_login: true },
        },
      },
    });
    return user;
  },

  findUsersByAppId: async (
    appId: string,
    excludeFields: (keyof USER)[] = ["password"]
  ) => {
    const columns = excludeFields.reduce((acc, exclude) => {
      acc[exclude] = false;
      return acc;
    }, {} as Record<keyof USER, boolean>);
    const users = await db.query.Users.findMany({
      ...(!isEmpty(columns) ? { columns } : {}),
      where: (fields, ops) => ops.eq(fields.application_id, appId),
      with: {
        meta: {
          columns: { is_new_user: true, last_login: true },
        },
      },
    });
    return users;
  },

  create: async (
    newUser: NEW_USER,
    excludeFields: (keyof USER)[] = ["password"]
  ) => {
    const columns = excludeFields.reduce((acc, exclude) => {
      acc[exclude] = false;
      return acc;
    }, {} as Record<keyof USER, boolean>);
    const createdUser = await db.transaction(async (tx) => {
      const [insertResponse] = await tx.insert(Users).values(newUser);
      const user = await tx.query.Users.findFirst({
        ...(!isEmpty(columns) ? { columns } : {}),
        with: {
          meta: {
            columns: {
              is_new_user: true,
              last_login: true,
            },
          },
        },
        where: (fields, ops) => ops.eq(fields.id, insertResponse.insertId),
      });
      await tx.insert(UserMeta).values({
        is_new_user: true,
        user_id: user?.auth_id as string,
      });

      return user;
    });
    return createdUser;
  },
};
