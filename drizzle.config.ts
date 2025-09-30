import type { Config } from "drizzle-kit";

export default {
  schema: './db/schema.ts',
  out: './migrations',
  driver: 'd1-http',
  dialect: 'sqlite',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    token: process.env.CLOUDFLARE_ACCOUNT_TOKEN!,
    databaseId: process.env.CLOUDFLARE_D1_ID!,

  },
} satisfies Config;
