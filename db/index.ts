import { drizzle } from "drizzle-orm/d1";
import * as schema from '@/db/schema';
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const getDb = () => {
  const { env } = getCloudflareContext();
  return drizzle(env.DB, { schema });
};
