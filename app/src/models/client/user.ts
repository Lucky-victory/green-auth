import bcrypt from "bcrypt";
import { db } from "../../db";
import { ApiKeys, Users } from "../db/schema";
import { IUser, NEW_USER } from "../types/common";
import isEmpty from "just-is-empty";
import { generateApiKey } from "../utils";

export const clientUser = {
  ...Users,
  validatePassword: async (password: string, enteredPassword: string) => {
    const isValid = await bcrypt.compare(password, enteredPassword);
    return isValid;
  },
  findOne: async (
    emailOrAuthId: string,
    excludeFields: (keyof IUser)[] = ["password"]
  ) => {
    const columns = excludeFields.reduce((acc, exclude) => {
      acc[exclude] = true;
      return acc;
    }, {} as Record<keyof IUser, boolean>);

    const user = await db.query.Users.findFirst({
      ...(!isEmpty(columns) ? { columns } : {}),
      where: (fields, ops) =>
        ops.or(
          ops.eq(fields.email, emailOrAuthId),
          ops.eq(fields.auth_id, emailOrAuthId)
        ),
    });

    return user;
  },
  findByAuthId: async (
    auth_id: string,
    excludeFields: (keyof IUser)[] = ["password"]
  ) => {
    const columns = excludeFields.reduce((acc, exclude) => {
      acc[exclude] = true;
      return acc;
    }, {} as Record<keyof IUser, boolean>);
    const user = await db.query.Users.findFirst({
      ...(!isEmpty(columns) ? { columns } : {}),
      where: (fields, ops) => ops.eq(fields.auth_id, auth_id),
    });
    return user;
  },

  create: async (newUser: NEW_USER) => {
    const createdUser = await db.transaction(async (tx) => {
      const [insertResponse] = await tx.insert(Users).values(newUser);
      const user = await tx.query.Users.findFirst({
        where: (fields, ops) => ops.eq(fields.id, insertResponse.insertId),
      });
      await tx.insert(ApiKeys).values({
        created_by: user?.auth_id as string,
        key: generateApiKey(),
      });
      return user;
    });
    return createdUser;
  },
};
