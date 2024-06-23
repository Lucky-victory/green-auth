import { SnowflakeIdGenerator } from "@green-auth/snowflake-unique-id";
import { v4 as uuid } from "uuid";

const snowflakeId = new SnowflakeIdGenerator({
  nodeId: 1,
  nodeBits: 8,
});
const snowflake2 = new SnowflakeIdGenerator({
  nodeId: 2,
});
export const generateAppId = () => snowflake2.bigIntId();

export const authIdGenerator = () => snowflakeId.bigIntId();
export const shortIdGenerator = (len?: number) => snowflakeId.urlSafeId(len);
export const generateApiKey = () => `sk_${shortIdGenerator(36)}`;
