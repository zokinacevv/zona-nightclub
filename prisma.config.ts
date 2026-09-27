import "dotenv/config";
import { defineConfig } from "prisma/config";

const fallbackDatabaseUrl =
  "postgresql://nightclub:nightclub@localhost:5432/nightclub?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Use Supabase's direct connection for migrations; the pooled URL is for
    // application traffic and can remain in DATABASE_URL.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? fallbackDatabaseUrl,
  },
});
