import type { Config } from "drizzle-kit";

export default {
  schema: './db/schema.ts',
  out: './migrations',
  driver: 'd1-http',
  dialect: 'sqlite',
  dbCredentials: {
    accountId: process.env.CF_ACCOUNT_ID!,
    token: process.env.CF_ACCOUNT_TOKEN!,
    databaseId: process.env.CF_D1_ID!,

  },
} satisfies Config;
