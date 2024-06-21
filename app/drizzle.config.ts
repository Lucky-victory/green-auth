import { connectionUri } from "./src/db";
import type { Config } from "drizzle-kit";
export default {
  out: "./drizzle",
  schema: ["./src/db/schema/application/*.ts", "./src/db/schema/client/*.ts"],
  dialect: "mysql",
  dbCredentials: {
    url: connectionUri || "",
  },
} satisfies Config;
